import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Sparkles, Target, User as UserIcon, Flame, Lightbulb, ThumbsUp, Search } from 'lucide-react';
import {
  useMyCommunityProfile,
  useEnsureCommunityProfile,
  useUpdateCommunityProfile,
  useMyCommunityStats,
  useLeaderboard,
  useSharedTrades,
  useToggleReaction,
  useDiscoverTraders,
  useCommunityChallenges,
  useCommunityFollows,
} from '@/hooks/useTradeHub';
import { cn } from '@/lib/utils';

const ScorePill: React.FC<{ value: number }> = ({ value }) => {
  const tone =
    value >= 75 ? 'bg-primary/20 text-primary border-primary/40'
    : value >= 50 ? 'bg-yellow-500/15 text-yellow-500 border-yellow-500/40'
    : 'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn('inline-flex items-center justify-center font-semibold rounded-full border px-2.5 py-0.5 text-xs', tone)}>
      {Math.round(value)}
    </span>
  );
};

const TradeHub: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile();
  const ensure = useEnsureCommunityProfile();
  const update = useUpdateCommunityProfile();
  const { data: myStats } = useMyCommunityStats();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard();
  const { data: feed = [] } = useSharedTrades();
  const { data: discover = [] } = useDiscoverTraders();
  const { data: challenges = [] } = useCommunityChallenges();
  const toggleReaction = useToggleReaction();
  const { following, toggle: toggleFollow } = useCommunityFollows();

  const [pseudoDraft, setPseudoDraft] = useState('');
  const [search, setSearch] = useState('');

  // Auto-create profile (private) the first time user lands on TradeHub
  useEffect(() => {
    if (!profileLoading && !profile && !ensure.isPending) {
      ensure.mutate();
    }
  }, [profileLoading, profile, ensure]);

  useEffect(() => {
    if (profile?.pseudo) setPseudoDraft(profile.pseudo);
  }, [profile?.pseudo]);

  const filteredLb = useMemo(
    () => leaderboard.filter((p) => !search || p.pseudo.toLowerCase().includes(search.toLowerCase())),
    [leaderboard, search]
  );

  return (
    <div className="px-3 py-3 pb-24 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">TradeHub</h1>
          <p className="text-xs text-muted-foreground">Communauté discipline-first · 100% anonyme</p>
        </div>
        {profile && (
          <Badge variant={profile.is_public ? 'default' : 'outline'}>
            {profile.is_public ? 'Public' : 'Privé'}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto">
          <TabsTrigger value="leaderboard" className="flex flex-col gap-1 py-2 px-1 text-[10px]">
            <Trophy className="w-4 h-4" /> Top
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex flex-col gap-1 py-2 px-1 text-[10px]">
            <Sparkles className="w-4 h-4" /> Feed
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex flex-col gap-1 py-2 px-1 text-[10px]">
            <Users className="w-4 h-4" /> Découvrir
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex flex-col gap-1 py-2 px-1 text-[10px]">
            <Target className="w-4 h-4" /> Défis
          </TabsTrigger>
          <TabsTrigger value="me" className="flex flex-col gap-1 py-2 px-1 text-[10px]">
            <UserIcon className="w-4 h-4" /> Moi
          </TabsTrigger>
        </TabsList>

        {/* === LEADERBOARD === */}
        <TabsContent value="leaderboard" className="space-y-2 mt-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher un pseudo…"
              className="pl-8 h-9"
            />
          </div>
          {lbLoading && <p className="text-sm text-muted-foreground p-3">Chargement…</p>}
          {!lbLoading && filteredLb.length === 0 && (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              Aucun trader public pour l'instant. Active ton profil dans l'onglet "Moi".
            </Card>
          )}
          <div className="space-y-1.5">
            {filteredLb.map((entry, i) => (
              <Card key={entry.user_id} className="flex items-center gap-3 p-2.5 border border-border/40">
                <span className="text-sm font-bold w-6 text-center text-muted-foreground">{i + 1}</span>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback>{entry.pseudo.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.pseudo}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {entry.stats?.winrate_pct.toFixed(0)}% WR · RR {entry.stats?.avg_rr.toFixed(2)} ·{' '}
                    {entry.stats?.total_trades} trades
                  </p>
                </div>
                <ScorePill value={entry.stats?.global_score || 0} />
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === FEED === */}
        <TabsContent value="feed" className="space-y-2 mt-3">
          {feed.length === 0 && (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              Pas encore de trades partagés. Partage ton premier trade depuis l'historique !
            </Card>
          )}
          {feed.map((t) => (
            <Card key={t.id} className="p-3 space-y-2 border border-border/40">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={t.community_profiles?.avatar_url || undefined} />
                  <AvatarFallback>{t.community_profiles?.pseudo?.slice(0, 2) || '??'}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{t.community_profiles?.pseudo || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge variant="outline">{t.asset}</Badge>
                <Badge variant={t.direction === 'buy' ? 'default' : 'destructive'}>
                  {t.direction.toUpperCase()}
                </Badge>
                {t.session_label && <Badge variant="secondary">{t.session_label}</Badge>}
                {t.rr != null && <Badge variant="secondary">RR {t.rr.toFixed(2)}</Badge>}
                {t.result && (
                  <Badge variant={t.result === 'win' ? 'default' : t.result === 'loss' ? 'destructive' : 'outline'}>
                    {t.result}
                  </Badge>
                )}
              </div>
              {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
              <div className="flex gap-1.5 pt-1">
                {t.reactions?.map((r) => {
                  const icon = r.reaction === 'like' ? <ThumbsUp className="w-3 h-3" />
                    : r.reaction === 'useful' ? <Lightbulb className="w-3 h-3" />
                    : <Flame className="w-3 h-3" />;
                  return (
                    <button
                      key={r.reaction}
                      onClick={() =>
                        toggleReaction.mutate({ tradeId: t.id, reaction: r.reaction, mine: r.mine })
                      }
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] transition',
                        r.mine
                          ? 'bg-primary/15 border-primary/40 text-primary'
                          : 'border-border/40 text-muted-foreground hover:bg-secondary/50'
                      )}
                    >
                      {icon}
                      {r.count}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* === DISCOVER === */}
        <TabsContent value="discover" className="space-y-2 mt-3">
          {discover.length === 0 && (
            <Card className="p-4 text-center text-sm text-muted-foreground">
              Aucun trader à découvrir pour l'instant.
            </Card>
          )}
          {discover.map((p) => {
            const isFollowing = following.has(p.user_id);
            return (
              <Card key={p.user_id} className="flex items-center gap-3 p-2.5 border border-border/40">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback>{p.pseudo.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.pseudo}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {p.strategy || 'Trader'} · {p.preferred_assets?.slice(0, 2).join(', ') || '—'}
                  </p>
                </div>
                <ScorePill value={p.stats?.global_score || 0} />
                <Button
                  size="sm"
                  variant={isFollowing ? 'secondary' : 'default'}
                  onClick={() => toggleFollow({ targetId: p.user_id, currently: isFollowing })}
                  className="h-7 text-[11px] px-2"
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </Button>
              </Card>
            );
          })}
        </TabsContent>

        {/* === CHALLENGES === */}
        <TabsContent value="challenges" className="space-y-2 mt-3">
          {challenges.map((c) => {
            const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
            return (
              <Card key={c.id} className="p-3 space-y-2 border border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.badge_emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">{c.description}</p>
                  </div>
                  {c.completed && <Badge variant="default">✓</Badge>}
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{c.progress} / {c.target}</span>
                  <span>+{c.bonus_points} pts</span>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* === MY PUBLIC PROFILE === */}
        <TabsContent value="me" className="space-y-3 mt-3">
          <Card className="p-3 space-y-3 border border-border/40">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{profile?.pseudo?.slice(0, 2) || 'TR'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">{profile?.pseudo || '...'}</p>
                <p className="text-[11px] text-muted-foreground">
                  Score global : <ScorePill value={myStats?.global_score || 0} />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-[10px] text-muted-foreground">Winrate</p>
                <p className="text-sm font-semibold">{(myStats?.winrate_pct || 0).toFixed(0)}%</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-[10px] text-muted-foreground">RR moy.</p>
                <p className="text-sm font-semibold">{(myStats?.avg_rr || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-[10px] text-muted-foreground">Trades</p>
                <p className="text-sm font-semibold">{myStats?.total_trades || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Discipline', myStats?.discipline_score],
                ['RR', myStats?.rr_score],
                ['Régularité', myStats?.regularity_score],
                ['Drawdown', myStats?.drawdown_score],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between rounded-md bg-secondary/30 px-2 py-1">
                  <span className="text-muted-foreground">{label}</span>
                  <ScorePill value={(value as number) || 0} />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-public" className="text-xs">Profil public</Label>
                <Switch
                  id="is-public"
                  checked={!!profile?.is_public}
                  onCheckedChange={(v) => update.mutate({ is_public: v })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pseudo" className="text-xs">Pseudo</Label>
                <div className="flex gap-2">
                  <Input
                    id="pseudo"
                    value={pseudoDraft}
                    onChange={(e) => setPseudoDraft(e.target.value)}
                    maxLength={20}
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    onClick={() => update.mutate({ pseudo: pseudoDraft })}
                    disabled={!pseudoDraft || pseudoDraft === profile?.pseudo}
                  >
                    OK
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">3-20 caractères, alphanumérique, _ ou -</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradeHub;
