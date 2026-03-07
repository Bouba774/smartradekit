import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrades } from '@/hooks/useTrades';
import { useExecutionQuality } from '@/hooks/useExecutionQuality';
import { useTraderProfile } from '@/hooks/useTraderProfile';
import { useMentalFatigue } from '@/hooks/useMentalFatigue';
import { useEmotionalMemory } from '@/hooks/useEmotionalMemory';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import GaugeChart from '@/components/ui/GaugeChart';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Normalisation des émotions stockées en DB vers les labels français
const EMOTION_NORMALIZE: Record<string, string> = {
  'calm': 'Calme', 'confident': 'Confiant', 'stressed': 'Stressé',
  'impulsive': 'Impulsif', 'fearful': 'Craintif', 'greedy': 'Avide',
  'patient': 'Patient', 'focused': 'Concentré', 'euphoric': 'Euphorique',
  'anxious': 'Anxieux', 'frustrated': 'Frustré', 'neutral': 'Neutre',
  'doubtful': 'Hésitant', 'disciplined': 'Discipliné',
  'overconfident': 'Trop confiant', 'tired': 'Fatigué',
};
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  Loader2,
  Activity,
  User,
  Coffee,
  Heart,
  Lightbulb,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { parseISO, getDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { 
  getComponentTranslation, 
  psychologyTranslations, 
  daysTranslations 
} from '@/lib/i18n/componentTranslations';
import type { Language } from '@/lib/i18n';

const PsychologicalAnalysis: React.FC = () => {
  const { language, t } = useLanguage();
  const { trades, isLoading } = useTrades();
  const pt = getComponentTranslation(psychologyTranslations, language as Language);
  const dt = getComponentTranslation(daysTranslations, language as Language);
  
  // Get days array for current language
  const daysArray = [dt.sun, dt.mon, dt.tue, dt.wed, dt.thu, dt.fri, dt.sat];
  
  // New hooks
  const executionQuality = useExecutionQuality(trades, language);
  const traderProfile = useTraderProfile(trades, language);
  const mentalFatigue = useMentalFatigue(trades, language);
  const emotionalMemory = useEmotionalMemory(trades, language);

  // Calculate emotion statistics from real data
  const emotionStats = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const stats: Record<string, { wins: number; losses: number; trades: number }> = {};
    
    trades.forEach(trade => {
      const raw = trade.emotions || 'neutral';
      const emotion = EMOTION_NORMALIZE[raw] || EMOTION_NORMALIZE[raw.toLowerCase()] || raw;
      if (!stats[emotion]) stats[emotion] = { wins: 0, losses: 0, trades: 0 };
      stats[emotion].trades++;
      if (trade.result === 'win') stats[emotion].wins++;
      if (trade.result === 'loss') stats[emotion].losses++;
    });

    return Object.entries(stats).map(([emotion, data]) => ({
      emotion,
      wins: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      losses: data.trades > 0 ? Math.round((data.losses / data.trades) * 100) : 0,
      trades: data.trades,
    })).sort((a, b) => b.trades - a.trades);
  }, [trades]);

  // Calculate emotion distribution with unique colors for all emotions
  const emotionDistribution = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const counts: Record<string, number> = {};
    trades.forEach(trade => {
      const emotion = EMOTION_NORMALIZE[trade.emotions || 'neutral'] || EMOTION_NORMALIZE[(trade.emotions || '').toLowerCase()] || trade.emotions || 'Neutre';
      counts[emotion] = (counts[emotion] || 0) + 1;
    });

    const colorPalette: Record<string, string> = {
      'Calme': 'hsl(142, 76%, 36%)',
      'Confiant': 'hsl(217, 91%, 60%)',
      'Stressé': 'hsl(0, 84%, 60%)',
      'Impulsif': 'hsl(30, 100%, 50%)',
      'Euphorique': 'hsl(280, 87%, 65%)',
      'Fatigué': 'hsl(45, 93%, 47%)',
      'Frustré': 'hsl(350, 89%, 60%)',
      'Concentré': 'hsl(190, 90%, 50%)',
      'Anxieux': 'hsl(320, 70%, 50%)',
      'Neutre': 'hsl(220, 9%, 46%)',
    };

    const usedHues: number[] = Object.values(colorPalette).map(c => {
      const match = c.match(/hsl\((\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    let hueIndex = 0;
    const getColor = (emotion: string): string => {
      if (colorPalette[emotion]) return colorPalette[emotion];
      let hue = (hueIndex * 47 + 60) % 360;
      while (usedHues.includes(hue)) {
        hue = (hue + 30) % 360;
      }
      hueIndex++;
      usedHues.push(hue);
      return `hsl(${hue}, 70%, 55%)`;
    };

    const total = trades.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: getColor(name),
    })).sort((a, b) => b.value - a.value);
  }, [trades]);

  // Calculate weekly emotion trends with all emotions
  const weeklyEmotionsByType = useMemo(() => {
    if (!trades || trades.length === 0) return { emotions: [], chartData: [] };

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const allEmotions = new Set<string>();
    const dayData: Record<number, Record<string, number>> = {};
    const dayTotals: Record<number, number> = {};
    
    for (let i = 0; i < 7; i++) {
      dayData[i] = {};
      dayTotals[i] = 0;
    }

    trades.forEach(trade => {
      const tradeDate = parseISO(trade.trade_date);
      if (isWithinInterval(tradeDate, { start: weekStart, end: weekEnd })) {
        const dayIndex = getDay(tradeDate);
        const emotion = EMOTION_NORMALIZE[trade.emotions || 'neutral'] || EMOTION_NORMALIZE[(trade.emotions || '').toLowerCase()] || trade.emotions || 'Neutre';
        allEmotions.add(emotion);
        dayData[dayIndex][emotion] = (dayData[dayIndex][emotion] || 0) + 1;
        dayTotals[dayIndex]++;
      }
    });

    const emotions = Array.from(allEmotions);
    
    const colorPalette: Record<string, string> = {
      'Calme': 'hsl(142, 76%, 36%)',
      'Confiant': 'hsl(217, 91%, 60%)',
      'Stressé': 'hsl(0, 84%, 60%)',
      'Impulsif': 'hsl(30, 100%, 50%)',
      'Euphorique': 'hsl(280, 87%, 65%)',
      'Fatigué': 'hsl(45, 93%, 47%)',
      'Frustré': 'hsl(350, 89%, 60%)',
      'Concentré': 'hsl(190, 90%, 50%)',
      'Anxieux': 'hsl(320, 70%, 50%)',
      'Neutre': 'hsl(220, 9%, 46%)',
    };

    const getColor = (emotion: string, index: number): string => {
      if (colorPalette[emotion]) return colorPalette[emotion];
      const hue = (index * 47 + 60) % 360;
      return `hsl(${hue}, 70%, 55%)`;
    };

    const chartData = [1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
      const result: Record<string, any> = { day: daysArray[dayIndex] };
      emotions.forEach(emotion => {
        result[emotion] = dayTotals[dayIndex] > 0 
          ? Math.round(((dayData[dayIndex][emotion] || 0) / dayTotals[dayIndex]) * 100) 
          : 0;
      });
      return result;
    });

    return { 
      emotions: emotions.map((e, i) => ({ name: e, color: getColor(e, i) })), 
      chartData 
    };
  }, [trades, language]);

  // Calculate discipline score
  const disciplineBreakdown = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        score: 0,
        factors: [
          { name: pt.followingPlan, score: 0, icon: Target },
          { name: pt.riskManagement, score: 0, icon: Zap },
          { name: pt.noOvertrading, score: 0, icon: AlertTriangle },
          { name: pt.slAlwaysSet, score: 0, icon: CheckCircle2 },
          { name: pt.noRevengeTrading, score: 0, icon: TrendingDown },
        ],
      };
    }

    const tradesWithSL = trades.filter(t => t.stop_loss).length;
    const tradesWithTP = trades.filter(t => t.take_profit).length;
    const tradesWithSetup = trades.filter(t => t.setup).length;
    
    const slScore = Math.round((tradesWithSL / trades.length) * 100);
    const tpScore = Math.round((tradesWithTP / trades.length) * 100);
    const setupScore = Math.round((tradesWithSetup / trades.length) * 100);
    
    const tradesByDay: Record<string, number> = {};
    trades.forEach(t => {
      const day = t.trade_date.split('T')[0];
      tradesByDay[day] = (tradesByDay[day] || 0) + 1;
    });
    const avgTradesPerDay = Object.values(tradesByDay).length > 0
      ? Object.values(tradesByDay).reduce((a, b) => a + b, 0) / Object.values(tradesByDay).length
      : 0;
    const overtradingScore = Math.max(0, 100 - (avgTradesPerDay > 5 ? (avgTradesPerDay - 5) * 20 : 0));

    const calmTrades = trades.filter(t => t.emotions === 'Calme' || t.emotions === 'Confiant').length;
    const revengeScore = Math.round((calmTrades / trades.length) * 100);

    const overallScore = Math.round((slScore + tpScore + setupScore + overtradingScore + revengeScore) / 5);

    return {
      score: overallScore,
      factors: [
        { name: pt.followingPlan, score: setupScore, icon: Target },
        { name: pt.riskManagement, score: tpScore, icon: Zap },
        { name: pt.noOvertrading, score: Math.round(overtradingScore), icon: AlertTriangle },
        { name: pt.slAlwaysSet, score: slScore, icon: CheckCircle2 },
        { name: pt.noRevengeTrading, score: revengeScore, icon: TrendingDown },
      ],
    };
  }, [trades, pt]);

  // Generate mental summary based on data
  const mentalSummary = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { positives: [], negatives: [] };
    }

    const positives: string[] = [];
    const negatives: string[] = [];

    const tradesWithSL = trades.filter(t => t.stop_loss).length;
    if (tradesWithSL / trades.length >= 0.8) {
      positives.push(pt.excellentRiskManagement);
    } else if (tradesWithSL / trades.length < 0.5) {
      negatives.push(pt.improveSlUsage);
    }

    const calmTrades = trades.filter(t => t.emotions === 'Calme').length;
    if (calmTrades / trades.length >= 0.5) {
      positives.push(pt.goodEmotionalControl);
    }

    const stressedTrades = trades.filter(t => t.emotions === 'Stressé' || t.emotions === 'Impulsif').length;
    if (stressedTrades / trades.length >= 0.3) {
      negatives.push(pt.tradingUnderStress);
    }

    const winrate = trades.filter(t => t.result === 'win').length / trades.length;
    if (winrate >= 0.6) {
      positives.push(pt.excellentWinRate);
    } else if (winrate < 0.4) {
      negatives.push(pt.reviewEntryStrategy);
    }

    if (positives.length === 0) {
      positives.push(pt.continueTrading);
    }
    if (negatives.length === 0) {
      negatives.push(pt.noImprovementNeeded);
    }

    return { positives, negatives };
  }, [trades, pt]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasNoData = !trades || trades.length === 0;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('psychology')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('understandEmotionsImpact')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {hasNoData ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {t('noData')}
          </h3>
          <p className="text-muted-foreground">
            {t('addTradesWithEmotions')}
          </p>
        </div>
      ) : (
        <>
          {/* Mental Fatigue Alert */}
          {mentalFatigue.shouldPause && (
            <div className={cn(
              "p-4 rounded-lg border animate-pulse",
              mentalFatigue.level === 'critical' 
                ? "bg-loss/20 border-loss/50" 
                : "bg-yellow-500/20 border-yellow-500/50"
            )}>
              <div className="flex items-center gap-3">
                <Coffee className={cn(
                  "w-6 h-6",
                  mentalFatigue.level === 'critical' ? "text-loss" : "text-yellow-500"
                )} />
                <p className={cn(
                  "font-medium",
                  mentalFatigue.level === 'critical' ? "text-loss" : "text-yellow-500"
                )}>
                  {mentalFatigue.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Top Row: Execution Quality + Mental Fatigue + Trader Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Execution Quality */}
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {pt.executionQuality}
                </h3>
              </div>
              <div className="flex justify-center mb-4">
                <GaugeChart
                  value={executionQuality.overallScore}
                  max={100}
                  label={pt.overallScore}
                  size="md"
                  variant="primary"
                />
              </div>
              <div className="space-y-4">
                {/* Entry Timing */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {pt.entryTiming}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      executionQuality.entryTiming.score >= 70 ? "bg-profit/20 text-profit" :
                      executionQuality.entryTiming.score >= 40 ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-loss/20 text-loss"
                    )}>
                      {executionQuality.entryTiming.label}
                    </span>
                  </div>
                  <Progress value={executionQuality.entryTiming.score} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{executionQuality.entryTiming.detail}</p>
                </div>
                {/* SL Sizing */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {pt.slSizing}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      executionQuality.slSizing.score >= 60 ? "bg-profit/20 text-profit" :
                      executionQuality.slSizing.score >= 30 ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-loss/20 text-loss"
                    )}>
                      {executionQuality.slSizing.label}
                    </span>
                  </div>
                  <Progress value={executionQuality.slSizing.score} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{executionQuality.slSizing.detail}</p>
                </div>
                {/* TP Optimization */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {pt.tpOptimization}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      executionQuality.tpOptimization.score >= 70 ? "bg-profit/20 text-profit" :
                      executionQuality.tpOptimization.score >= 40 ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-loss/20 text-loss"
                    )}>
                      {executionQuality.tpOptimization.label}
                    </span>
                  </div>
                  <Progress value={executionQuality.tpOptimization.score} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{executionQuality.tpOptimization.detail}</p>
                </div>
              </div>
            </div>

            {/* Mental Fatigue Index */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  mentalFatigue.level === 'critical' ? "bg-loss/20" :
                  mentalFatigue.level === 'high' ? "bg-yellow-500/20" :
                  mentalFatigue.level === 'moderate' ? "bg-primary/20" : "bg-profit/20"
                )}>
                  <Activity className={cn(
                    "w-5 h-5",
                    mentalFatigue.level === 'critical' ? "text-loss" :
                    mentalFatigue.level === 'high' ? "text-yellow-500" :
                    mentalFatigue.level === 'moderate' ? "text-primary" : "text-profit"
                  )} />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {pt.mentalFatigue}
                </h3>
              </div>
              <div className="flex justify-center mb-4">
                <GaugeChart
                  value={mentalFatigue.score}
                  max={100}
                  label={pt.currentFatigue}
                  size="md"
                  variant={mentalFatigue.level === 'critical' || mentalFatigue.level === 'high' ? 'loss' : 'primary'}
                />
              </div>
              {mentalFatigue.factors.length > 0 ? (
                <div className="space-y-3">
                  {mentalFatigue.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{factor.name}</span>
                      <span className="text-foreground font-medium">{factor.detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  {language === 'fr' ? 'Pas de trades aujourd\'hui' : 'No trades today'}
                </p>
              )}
              <div className={cn(
                "mt-4 p-3 rounded-lg text-sm",
                mentalFatigue.level === 'low' ? "bg-profit/10 text-profit" :
                mentalFatigue.level === 'moderate' ? "bg-primary/10 text-primary" :
                mentalFatigue.level === 'high' ? "bg-yellow-500/10 text-yellow-600" :
                "bg-loss/10 text-loss"
              )}>
                {mentalFatigue.recommendation}
              </div>
            </div>

            {/* Trader Profile */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex 