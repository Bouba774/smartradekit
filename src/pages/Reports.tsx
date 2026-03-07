import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrades } from '@/hooks/useTrades';
import { useCurrency } from '@/hooks/useCurrency';
import { ConfidentialValue } from '@/components/ConfidentialValue';
import { useSessionAnalysis } from '@/hooks/useSessionAnalysis';
import { useStrategyAnalysis } from '@/hooks/useStrategyAnalysis';
import { useSelfSabotage } from '@/hooks/useSelfSabotage';
import { useDisciplineScore } from '@/hooks/useDisciplineScore';
import { usePerformanceHeatmap } from '@/hooks/usePerformanceHeatmap';
import { useEmotionCorrelation } from '@/hooks/useEmotionCorrelation';
import { useNYTime } from '@/hooks/useNYTime';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AIDailySummaryCard from '@/components/AIDailySummaryCard';
import SessionSettingsCard from '@/components/SessionSettingsCard';
import HelpTooltip from '@/components/ui/HelpTooltip';
import { mainStatsTooltips, reportsTooltips, psychologyTooltips } from '@/data/helpTooltips';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, parseISO, getDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts';
import {
  FileText,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Award,
  AlertTriangle,
  Loader2,
  Globe,
  BarChart3,
  Shield,
  Clock,
  Flame,
  AlertCircle,
  Heart,
  Radio,
} from 'lucide-react';
import GaugeChart from '@/components/ui/GaugeChart';

type ViewMode = 'week' | 'month';

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Session display config for each mode
const SESSION_CONFIG = {
  classic: {
    sydney: { fr: 'Sydney', en: 'Sydney', color: 'hsl(45, 93%, 47%)' },
    tokyo: { fr: 'Tokyo', en: 'Tokyo', color: 'hsl(0, 84%, 60%)' },
    london: { fr: 'Londres', en: 'London', color: 'hsl(var(--primary))' },
    newYork: { fr: 'New York', en: 'New York', color: 'hsl(var(--profit))' },
    overlap: { fr: 'Chevauche.', en: 'Overlap', color: 'hsl(280, 70%, 50%)' },
    none: { fr: 'Hors session', en: 'Off session', color: 'hsl(var(--muted-foreground))' },
  },
  killzones: {
    asia: { fr: 'KZ Asie', en: 'Asia KZ', color: 'hsl(217, 91%, 60%)' },
    london: { fr: 'KZ Londres', en: 'London KZ', color: 'hsl(var(--primary))' },
    newYork: { fr: 'KZ New York', en: 'NY KZ', color: 'hsl(var(--profit))' },
    londonClose: { fr: 'London Close', en: 'London Close', color: 'hsl(180, 70%, 45%)' },
    none: { fr: 'Hors KZ', en: 'Outside KZ', color: 'hsl(var(--muted-foreground))' },
  },
} as const;

// Flat version for backward compatibility
const SESSION_NAMES: Record<string, { fr: string; en: string; color: string }> = {
  london: { fr: 'Londres', en: 'London', color: 'hsl(var(--primary))' },
  newYork: { fr: 'New York', en: 'New York', color: 'hsl(var(--profit))' },
  asia: { fr: 'Asie', en: 'Asia', color: 'hsl(217, 91%, 60%)' },
  overlap: { fr: 'Chevauche.', en: 'Overlap', color: 'hsl(280, 70%, 50%)' },
  sydney: { fr: 'Sydney', en: 'Sydney', color: 'hsl(45, 93%, 47%)' },
  tokyo: { fr: 'Tokyo', en: 'Tokyo', color: 'hsl(0, 84%, 60%)' },
  londonClose: { fr: 'London Close', en: 'London Close', color: 'hsl(180, 70%, 45%)' },
  none: { fr: 'Hors session', en: 'Off session', color: 'hsl(var(--muted-foreground))' },
};

const Reports: React.FC = () => {
  const { language, t } = useLanguage();
  const { trades, isLoading } = useTrades();
  const { formatAmount } = useCurrency();
  const locale = language === 'fr' ? fr : enUS;
  
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const periodStart = viewMode === 'week' 
    ? startOfWeek(selectedDate, { weekStartsOn: 1 })
    : startOfMonth(selectedDate);
  const periodEnd = viewMode === 'week'
    ? endOfWeek(selectedDate, { weekStartsOn: 1 })
    : endOfMonth(selectedDate);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        return newDate;
      });
    } else {
      setSelectedDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const formatPeriod = () => {
    if (viewMode === 'week') {
      return `${format(periodStart, 'd MMM', { locale })} - ${format(periodEnd, 'd MMM yyyy', { locale })}`;
    }
    return format(selectedDate, 'MMMM yyyy', { locale });
  };

  // Filter trades for selected period
  const periodTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter(trade => {
      const tradeDate = parseISO(trade.trade_date);
      return isWithinInterval(tradeDate, { start: periodStart, end: periodEnd });
    });
  }, [trades, periodStart, periodEnd]);

  // Use new analysis hooks
  const sessionAnalysis = useSessionAnalysis(periodTrades, language);
  const strategyAnalysis = useStrategyAnalysis(periodTrades);
  const selfSabotage = useSelfSabotage(periodTrades, language);
  const disciplineScore = useDisciplineScore(periodTrades);
  const heatmap = usePerformanceHeatmap(periodTrades, language);
  const emotionCorrelation = useEmotionCorrelation(periodTrades);
  const nyTimeInfo = useNYTime(60000); // Update every minute

  // Calculate basic statistics
  const stats = useMemo(() => {
    if (periodTrades.length === 0) {
      return {
        winrate: 0,
        pnl: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        bestSetup: '-',
        bestAsset: '-',
        dominantEmotion: '-',
        bestDay: { day: '-', pnl: 0 },
        worstDay: { day: '-', pnl: 0 },
      };
    }

    const winningTrades = periodTrades.filter(t => t.result === 'win').length;
    const losingTrades = periodTrades.filter(t => t.result === 'loss').length;
    const winrate = periodTrades.length > 0 ? Math.round((winningTrades / periodTrades.length) * 100) : 0;
    const pnl = periodTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

    const days = language === 'fr' ? DAYS_FR : DAYS_EN;
    const dayStats: Record<number, { pnl: number }> = {};
    periodTrades.forEach(trade => {
      const dayIndex = getDay(parseISO(trade.trade_date));
      if (!dayStats[dayIndex]) dayStats[dayIndex] = { pnl: 0 };
      dayStats[dayIndex].pnl += trade.profit_loss || 0;
    });

    let bestDay = { day: '-', pnl: 0 };
    let worstDay = { day: '-', pnl: 0 };
    Object.entries(dayStats).forEach(([dayIndex, data]) => {
      if (data.pnl > bestDay.pnl) bestDay = { day: days[parseInt(dayIndex)], pnl: data.pnl };
      if (data.pnl < worstDay.pnl) worstDay = { day: days[parseInt(dayIndex)], pnl: data.pnl };
    });

    const setupStats: Record<string, { wins: number; total: number }> = {};
    periodTrades.forEach(trade => {
      const setup = trade.setup || 'Other';
      if (!setupStats[setup]) setupStats[setup] = { wins: 0, total: 0 };
      setupStats[setup].total++;
      if (trade.result === 'win') setupStats[setup].wins++;
    });
    let bestSetup = '-';
    let bestSetupWinrate = 0;
    Object.entries(setupStats).forEach(([setup, data]) => {
      const wr = data.total > 0 ? data.wins / data.total : 0;
      if (wr > bestSetupWinrate && data.total >= 2) {
        bestSetupWinrate = wr;
        bestSetup = setup;
      }
    });

    const assetStats: Record<string, number> = {};
    periodTrades.forEach(trade => {
      if (!assetStats[trade.asset]) assetStats[trade.asset] = 0;
      assetStats[trade.asset] += trade.profit_loss || 0;
    });
    let bestAsset = '-';
    let bestAssetPnl = -Infinity;
    Object.entries(assetStats).forEach(([asset, pnlVal]) => {
      if (pnlVal > bestAssetPnl) {
        bestAssetPnl = pnlVal;
        bestAsset = asset;
      }
    });

    const emotionCounts: Record<string, number> = {};
    periodTrades.forEach(trade => {
      const emotion = trade.emotions || 'Neutre';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    let dominantEmotion = '-';
    let maxEmotionCount = 0;
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxEmotionCount) {
        maxEmotionCount = count;
        dominantEmotion = emotion;
      }
    });

    return {
      winrate,
      pnl,
      totalTrades: periodTrades.length,
      winningTrades,
      losingTrades,
      bestSetup,
      bestAsset,
      dominantEmotion,
      bestDay,
      worstDay,
    };
  }, [periodTrades, language]);

  // Daily PnL data
  const dailyPnL = useMemo(() => {
    const days = language === 'fr' ? DAYS_FR : DAYS_EN;
    const dayData: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    
    periodTrades.forEach(trade => {
      const dayIndex = getDay(parseISO(trade.trade_date));
      dayData[dayIndex] += trade.profit_loss || 0;
    });

    return [1, 2, 3, 4, 5, 6, 0].map(dayIndex => ({
      day: days[dayIndex],
      pnl: Math.round(dayData[dayIndex] * 100) / 100,
    }));
  }, [periodTrades, language]);

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
            {t('reports')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('performanceAnalysis')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="glass-card p-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary/50">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={cn(viewMode === 'week' && 'bg-primary text-primary-foreground')}
            >
              {t('week')}
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={cn(viewMode === 'month' && 'bg-primary text-primary-foreground')}
            >
              {t('month')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] gap-2 font-display">
                  <CalendarIcon className="w-4 h-4" />
                  {formatPeriod()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  locale={locale}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasNoData ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {t('noData')}
          </h3>
          <p className="text-muted-foreground">
            {t('addTradesToSeeReports')}
          </p>
        </div>
      ) : (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Winrate</span>
                <HelpTooltip tooltip={mainStatsTooltips.winrate} />
              </div>
              <p className={cn("font-display text-2xl font-bold", stats.winrate >= 50 ? "text-profit" : "text-loss")}>
                {stats.winrate}%
              </p>
            </div>
            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-profit" />
                <span className="text-xs text-muted-foreground">PnL</span>
                <HelpTooltip tooltip={reportsTooltips.pnlTotal} />
              </div>
              <p className={cn("font-display text-2xl font-bold", stats.pnl >= 0 ? "text-profit" : "text-loss")}>
                <ConfidentialValue>{formatAmount(stats.pnl, true)}</ConfidentialValue>
              </p>
            </div>
            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Trades</span>
                <HelpTooltip tooltip={mainStatsTooltips.totalTrades} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{stats.totalTrades}</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-profit">{stats.winningTrades}W</span> / <span className="text-loss">{stats.losingTrades}L</span>
              </p>
            </div>
            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{t('discipline')}</span>
                <HelpTooltip tooltip={psychologyTooltips.discipline} />
              </div>
              <p className={cn(
                "font-display text-2xl font-bold",
                disciplineScore.overallScore >= 70 ? "text-profit" : disciplineScore.overallScore >= 50 ? "text-primary" : "text-loss"
              )}>
                {disciplineScore.overallScore}/100
              </p>
              <p className="text-xs text-muted-foreground">
                {t('disciplineGrade')}: {disciplineScore.grade}
              </p>
            </div>
          </div>

          {/* Session Analysis */}
          <div className="glass-card p-6 animate-fade-in">
            {/* Live Session Indicator */}
            <div className="flex items-center justify-between p-3 mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="w-5 h-5 text-primary" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-profit rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'fr' ? 'Heure New York' : 'New York Time'}
                  </p>
                  <p className="font-mono text-lg font-bold text-foreground">{nyTimeInfo.formattedTime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Session active' : 'Active session'}
                </p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ 
                      backgroundColor: nyTimeInfo.currentSession !== 'none' 
                        ? ((SESSION_CONFIG[sessionAnalysis.mode] as any)[nyTimeInfo.currentSession]?.color || 'hsl(var(--primary))')
                        : 'hsl(var(--muted-foreground))'
                    }} 
                  />
                  <span className={cn(
                    "font-medium",
                    nyTimeInfo.currentSession !== 'none' ? "text-primary" : "text-muted-foreground"
                  )}>
                    {nyTimeInfo.sessionLabel[language as 'fr' | 'en']}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">{t('sessionAnalysis')}</h3>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                  {sessionAnalysis.mode === 'killzones' ? 'ICT Killzones' : 'Sessions classiques'}
                </span>
                <SessionSettingsCard />
              </div>
              {sessionAnalysis.bestSessionBadge && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {sessionAnalysis.bestSessionBadge}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {sessionAnalysis.sessions.map(session => {
                const config = SESSION_CONFIG[sessionAnalysis.mode];
                const sessionInfo = (config as any)[session.session] || SESSION_NAMES[session.session] || SESSION_NAMES.none;
                const isActive = nyTimeInfo.currentSession === session.session;
                return (
                  <div 
                    key={session.session} 
                    className={cn(
                      "p-3 rounded-lg bg-secondary/30 transition-all",
                      isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sessionInfo.color }} />
                      <span className="text-sm font-medium text-foreground">
                        {sessionInfo[language as 'fr' | 'en']}
                      </span>
                      {isActive && (
                        <span className="text-[10px] 