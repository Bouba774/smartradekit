
-- 1. COMMUNITY PROFILES (opt-in public profile)
CREATE TABLE public.community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pseudo TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  preferred_assets TEXT[] DEFAULT '{}',
  preferred_sessions TEXT[] DEFAULT '{}',
  strategy TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pseudo_format CHECK (pseudo ~ '^[A-Za-z0-9_-]{3,20}$'),
  CONSTRAINT bio_length CHECK (bio IS NULL OR length(bio) <= 200)
);

ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view public profiles"
  ON public.community_profiles FOR SELECT TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users insert own community profile"
  ON public.community_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own community profile"
  ON public.community_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own community profile"
  ON public.community_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER community_profiles_updated_at
  BEFORE UPDATE ON public.community_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. COMMUNITY STATS (cached score + metrics)
CREATE TABLE public.community_stats (
  user_id UUID PRIMARY KEY,
  global_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  discipline_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  rr_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  winrate_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  regularity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  drawdown_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_trades INT NOT NULL DEFAULT 0,
  winrate_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_rr NUMERIC(6,2) NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View stats of public profiles or own"
  ON public.community_stats FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = community_stats.user_id AND cp.is_public = true
    )
  );

-- 3. SHARED TRADES (manual feed publication)
CREATE TABLE public.shared_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trade_id UUID,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy','sell')),
  session_label TEXT,
  rr NUMERIC(6,2),
  result TEXT CHECK (result IN ('win','loss','breakeven')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT note_length CHECK (note IS NULL OR length(note) <= 280)
);

CREATE INDEX idx_shared_trades_created ON public.shared_trades (created_at DESC);
CREATE INDEX idx_shared_trades_user ON public.shared_trades (user_id);

ALTER TABLE public.shared_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View shared trades from public profiles"
  ON public.shared_trades FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = shared_trades.user_id AND cp.is_public = true
    )
  );

CREATE POLICY "Users share own trades"
  ON public.shared_trades FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = auth.uid() AND cp.is_public = true
    )
  );

CREATE POLICY "Users delete own shared trades"
  ON public.shared_trades FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. REACTIONS
CREATE TABLE public.trade_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_trade_id UUID NOT NULL REFERENCES public.shared_trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like','useful','fire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shared_trade_id, user_id, reaction)
);

CREATE INDEX idx_trade_reactions_trade ON public.trade_reactions (shared_trade_id);
ALTER TABLE public.trade_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reactions"
  ON public.trade_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users react as themselves"
  ON public.trade_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own reactions"
  ON public.trade_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. FOLLOWS
CREATE TABLE public.community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_follower ON public.community_follows (follower_id);
CREATE INDEX idx_follows_following ON public.community_follows (following_id);

ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View follow relations involving self or public"
  ON public.community_follows FOR SELECT TO authenticated
  USING (
    follower_id = auth.uid() OR following_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_profiles cp
      WHERE cp.user_id = community_follows.following_id AND cp.is_public = true
    )
  );

CREATE POLICY "Users follow as themselves"
  ON public.community_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users unfollow themselves"
  ON public.community_follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- 6. CHALLENGES CATALOG
CREATE TABLE public.community_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_emoji TEXT NOT NULL DEFAULT '🏅',
  target INT NOT NULL,
  metric TEXT NOT NULL,
  bonus_points INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view challenges"
  ON public.community_challenges FOR SELECT TO authenticated USING (is_active = true);

-- 7. CHALLENGE PROGRESS
CREATE TABLE public.community_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id TEXT NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.community_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenge progress"
  ON public.community_challenge_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON public.community_challenge_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON public.community_challenge_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 8. SCORE COMPUTATION FUNCTION
CREATE OR REPLACE FUNCTION public.recompute_community_stats(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INT;
  v_wins INT;
  v_losses INT;
  v_with_sl INT;
  v_winrate NUMERIC := 0;
  v_avg_rr NUMERIC := 0;
  v_discipline NUMERIC := 0;
  v_rr_score NUMERIC := 0;
  v_winrate_score NUMERIC := 0;
  v_regularity NUMERIC := 0;
  v_drawdown NUMERIC := 100;
  v_global NUMERIC := 0;
  v_active_days INT;
  v_span_days INT;
  v_max_dd NUMERIC := 0;
  v_running NUMERIC := 0;
  v_peak NUMERIC := 0;
BEGIN
  SELECT COUNT(*) INTO v_total FROM trades WHERE user_id = p_user_id;

  IF v_total = 0 THEN
    INSERT INTO community_stats (user_id, last_computed_at)
    VALUES (p_user_id, now())
    ON CONFLICT (user_id) DO UPDATE SET
      global_score = 0, discipline_score = 0, rr_score = 0,
      winrate_score = 0, regularity_score = 0, drawdown_score = 100,
      total_trades = 0, winrate_pct = 0, avg_rr = 0, last_computed_at = now();
    RETURN;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE result = 'win'),
    COUNT(*) FILTER (WHERE result = 'loss'),
    COUNT(*) FILTER (WHERE stop_loss IS NOT NULL)
  INTO v_wins, v_losses, v_with_sl
  FROM trades WHERE user_id = p_user_id;

  v_winrate := CASE WHEN (v_wins + v_losses) > 0
    THEN (v_wins::NUMERIC / (v_wins + v_losses)) * 100 ELSE 0 END;

  -- Average RR (TP distance / SL distance) for trades with both
  SELECT COALESCE(AVG(
    CASE WHEN stop_loss IS NOT NULL AND take_profit IS NOT NULL AND entry_price <> stop_loss
      THEN ABS(take_profit - entry_price) / NULLIF(ABS(entry_price - stop_loss), 0)
      ELSE NULL END
  ), 0) INTO v_avg_rr FROM trades WHERE user_id = p_user_id;

  -- Discipline = % trades with SL
  v_discipline := (v_with_sl::NUMERIC / v_total) * 100;

  -- RR score: scale (RR 0 -> 0, RR 2 -> 100, capped)
  v_rr_score := LEAST(100, (v_avg_rr / 2.0) * 100);

  -- Winrate score: 50% winrate = 100 score (capped)
  v_winrate_score := LEAST(100, v_winrate * 2);

  -- Regularity: active days / span days * 100 (last 30 days)
  SELECT
    COUNT(DISTINCT date(trade_date)),
    GREATEST(1, LEAST(30, EXTRACT(DAY FROM now() - MIN(trade_date))::INT + 1))
  INTO v_active_days, v_span_days
  FROM trades
  WHERE user_id = p_user_id AND trade_date > now() - INTERVAL '30 days';
  v_regularity := LEAST(100, COALESCE(v_active_days::NUMERIC / NULLIF(v_span_days, 0), 0) * 200);

  -- Drawdown score: invert max consecutive loss streak in PnL units (proxy)
  FOR v_running IN
    SELECT COALESCE(profit_loss, 0) FROM trades
    WHERE user_id = p_user_id ORDER BY trade_date
  LOOP
    v_peak := v_peak + v_running;
    IF v_peak > 0 AND v_running < 0 THEN
      v_max_dd := GREATEST(v_max_dd, ABS(v_running));
    END IF;
  END LOOP;
  -- Simple proxy: 100 if no DD, decreases up to 0 for very large DD relative to wins
  v_drawdown := 100;
  IF v_wins > 0 THEN
    v_drawdown := GREATEST(0, 100 - LEAST(100, (v_losses::NUMERIC / GREATEST(v_wins, 1)) * 50));
  END IF;

  -- Global weighted score
  v_global := (v_discipline * 0.30)
            + (v_rr_score * 0.25)
            + (v_winrate_score * 0.20)
            + (v_regularity * 0.15)
            + (v_drawdown * 0.10);

  INSERT INTO community_stats (
    user_id, global_score, discipline_score, rr_score, winrate_score,
    regularity_score, drawdown_score, total_trades, winrate_pct, avg_rr, last_computed_at
  )
  VALUES (
    p_user_id, ROUND(v_global, 2), ROUND(v_discipline, 2), ROUND(v_rr_score, 2),
    ROUND(v_winrate_score, 2), ROUND(v_regularity, 2), ROUND(v_drawdown, 2),
    v_total, ROUND(v_winrate, 2), ROUND(v_avg_rr, 2), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    global_score = EXCLUDED.global_score,
    discipline_score = EXCLUDED.discipline_score,
    rr_score = EXCLUDED.rr_score,
    winrate_score = EXCLUDED.winrate_score,
    regularity_score = EXCLUDED.regularity_score,
    drawdown_score = EXCLUDED.drawdown_score,
    total_trades = EXCLUDED.total_trades,
    winrate_pct = EXCLUDED.winrate_pct,
    avg_rr = EXCLUDED.avg_rr,
    last_computed_at = now();
END;
$$;

-- 9. TRIGGER on trades to refresh stats
CREATE OR REPLACE FUNCTION public.trades_refresh_community_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_community_stats(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM public.recompute_community_stats(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trades_after_change_refresh_stats
AFTER INSERT OR UPDATE OR DELETE ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.trades_refresh_community_stats();

-- 10. Seed challenges
INSERT INTO public.community_challenges (id, title, description, badge_emoji, target, metric, bonus_points) VALUES
('rr_2_x10', '10 trades avec RR ≥ 2', 'Réalise 10 trades avec un ratio risque/rendement supérieur ou égal à 2.', '🎯', 10, 'rr_above_2', 10),
('sl_streak_20', '20 trades avec Stop Loss', 'Place un SL sur 20 trades consécutifs.', '🛡️', 20, 'sl_set', 10),
('discipline_week', '5 jours disciplinés', 'Respecte ton plan pendant 5 jours actifs.', '⚡', 5, 'disciplined_days', 15),
('no_overtrade_week', '7 jours sans overtrade', 'Aucun jour avec plus de 10 trades pendant une semaine.', '🧘', 7, 'no_overtrade_day', 15);

-- 11. Helper: random pseudo for new users
CREATE OR REPLACE FUNCTION public.generate_unique_pseudo()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_pseudo TEXT;
  v_count INT;
BEGIN
  LOOP
    v_pseudo := 'Trader' || LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    SELECT COUNT(*) INTO v_count FROM public.community_profiles WHERE pseudo = v_pseudo;
    EXIT WHEN v_count = 0;
  END LOOP;
  RETURN v_pseudo;
END;
$$;
