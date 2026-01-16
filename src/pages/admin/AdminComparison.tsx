import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTrades } from '@/hooks/useAdminTrades';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  isWithinInterval,
  format,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type ViewMode = 'week' | 'month';

interface PeriodStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winrate: number;
  pnl: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
  disciplineScore: number;
}

const AdminComparison: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedUser } = useAdmin();
  const { trades, isLoading } = useAdminTrades();
  const locale = language === 'fr' ? fr : enUS;

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [periodADate, setPeriodADate] = useState<Date>(new Date());
  const [periodBDate, setPeriodBDate] = useState<Date>(subMonths(new Date(), 1));

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Sélectionnez un utilisateur pour voir les comparaisons' : 'Select a user to view comparisons'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate period boundaries
  const periodAStart = viewMode === 'month' ? startOfMonth(periodADate) : startOfWeek(periodADate, { weekStartsOn: 1 });
  const periodAEnd = viewMode === 'month' ? endOfMonth(periodADate) : endOfWeek(periodADate, { weekStartsOn: 1 });
  const periodBStart = viewMode === 'month' ? startOfMonth(periodBDate) : startOfWeek(periodBDate, { weekStartsOn: 1 });
  const periodBEnd = viewMode === 'month' ? endOfMonth(periodBDate) : endOfWeek(periodBDate, { weekStartsOn: 1 });

  const formatPeriodLabel = (date: Date) => {
    if (viewMode === 'month') {
      return format(date, 'MMMM yyyy', { locale });
    }
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(weekStart, 'd MMM', { locale })} - ${format(weekEnd, 'd MMM', { locale })}`;
  };

  const formatPeriodKey = (date: Date) => {
    if (viewMode === 'month') {
      return format(date, 'MMM yyyy', { locale });
    }
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    return `S${format(weekStart, 'w')}`;
  };

  const calculatePeriodStats = (periodStart: Date, periodEnd: Date): PeriodStats => {
    if (!trades || trades.length === 0) {
      return { totalTrades: 0, winningTrades: 0, losingTrades: 0, winrate: 0, pnl: 0, avgProfit: 0, avgLoss: 0, profitFactor: 0, disciplineScore: 0 };
    }

    const periodTrades = trades.filter(trade => {
      const tradeDate = parseISO(trade.trade_date);
      return isWithinInterval(tradeDate, { start: periodStart, end: periodEnd });
    });

    if (periodTrades.length === 0) {
      return { totalTrades: 0, winningTrades: 0, losingTrades: 0, winrate: 0, pnl: 0, avgProfit: 0, avgLoss: 0, profitFactor: 0, disciplineScore: 0 };
    }

    const winningTrades = periodTrades.filter(t => t.result === 'win');
    const losingTrades = periodTrades.filter(t => t.result === 'loss');
    const winrate = Math.round((winningTrades.length / periodTrades.length) * 100);
    const pnl = periodTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));

    const avgProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

    const tradesWithSL = periodTrades.filter(t => t.stop_loss).length;
    const tradesWithTP = periodTrades.filter(t => t.take_profit).length;
    const disciplineScore = Math.round(((tradesWithSL + tradesWithTP) / (periodTrades.length * 2)) * 100);

    return {
      totalTrades: periodTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winrate,
      pnl: Math.round(pnl * 100) / 100,
      avgProfit: Math.round(avgProfit * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      disciplineScore,
    };
  };

  const statsA = calculatePeriodStats(periodAStart, periodAEnd);
  const statsB = calculatePeriodStats(periodBStart, periodBEnd);

  const getDiff = (a: number, b: number, higherIsBetter = true) => {
    if (b === 0) return a > 0 ? 100 : 0;
    const diff = ((a - b) / Math.abs(b)) * 100;
    return higherIsBetter ? Math.round(diff) : -Math.round(diff);
  };

  const periodAKey = formatPeriodKey(periodADate);
  const periodBKey = formatPeriodKey(periodBDate);

  const comparisonData = [
    { metric: 'Trades', [periodAKey]: statsA.totalTrades, [periodBKey]: statsB.totalTrades },
    { metric: 'Winrate %', [periodAKey]: statsA.winrate, [periodBKey]: statsB.winrate },
    { metric: 'Discipline %', [periodAKey]: statsA.disciplineScore, [periodBKey]: statsB.disciplineScore },
  ];

  const radarData = [
    { metric: 'Winrate', A: statsA.winrate, B: statsB.winrate, fullMark: 100 },
    { metric: 'Volume', A: Math.min((statsA.totalTrades / Math.max(statsA.totalTrades, statsB.totalTrades, 1)) * 100, 100), B: Math.min((statsB.totalTrades / Math.max(statsA.totalTrades, statsB.totalTrades, 1)) * 100, 100), fullMark: 100 },
    { metric: 'Discipline', A: statsA.disciplineScore, B: statsB.disciplineScore, fullMark: 100 },
    { metric: 'P.Factor', A: Math.min((statsA.profitFactor / Math.max(statsA.profitFactor, statsB.profitFactor, 1)) * 100, 100), B: Math.min((statsB.profitFactor / Math.max(statsA.profitFactor, statsB.profitFactor, 1)) * 100, 100), fullMark: 100 },
  ];

  const navigatePeriod = (period: 'A' | 'B', direction: 'prev' | 'next') => {
    const setter = period === 'A' ? setPeriodADate : setPeriodBDate;
    if (viewMode === 'month') {
      setter(prev => direction === 'next' ? subMonths(prev, -1) : subMonths(prev, 1));
    } else {
      setter(prev => direction === 'next' ? subWeeks(prev, -1) : subWeeks(prev, 1));
    }
  };

  const StatCard = ({ label, valueA, valueB, formatValue = (v: number) => v.toString(), higherIsBetter = true }: { label: string; valueA: number; valueB: number; formatValue?: (v: number) => string; higherIsBetter?: boolean }) => {
    const diff = getDiff(valueA, valueB, higherIsBetter);
    const isImproved = diff > 0;
    const isDeclined = diff < 0;

    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">{label}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{periodAKey}</p>
              <p className="font-display text-xl font-bold text-foreground">{formatValue(valueA)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{periodBKey}</p>
              <p className="font-display text-xl font-bold text-foreground">{formatValue(valueB)}</p>
            </div>
          </div>
          <div className={cn(
            "mt-3 pt-3 border-t border-border flex items-center gap-2",
            isImproved && "text-profit",
            isDeclined && "text-loss",
            !isImproved && !isDeclined && "text-muted-foreground"
          )}>
            {isImproved ? <ArrowUp className="w-4 h-4" /> : isDeclined ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            <span className="text-sm font-medium">{isImproved ? '+' : ''}{diff}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const hasNoData = !trades || trades.length === 0;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Comparaison de Périodes' : 'Period Comparison'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? `Comparaison pour ${selectedUser.nickname}` : `Comparison for ${selectedUser.nickname}`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <GitCompare className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {hasNoData ? (
        <Card className="glass-card p-12 text-center">
          <GitCompare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {language === 'fr' ? 'Aucune donnée' : 'No data'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'fr' ? 'Cet utilisateur n\'a pas encore de trades' : 'This user has no trades yet'}
          </p>
        </Card>
      ) : (
        <>
          {/* View Mode Toggle & Period Selectors */}
          <Card className="glass-card p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* View Mode */}
              <div className="flex gap-2">
                <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('week'); setPeriodBDate(subWeeks(periodADate, 1)); }}>
                  {language === 'fr' ? 'Semaine' : 'Week'}
                </Button>
                <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('month'); setPeriodBDate(subMonths(periodADate, 1)); }}>
                  {language === 'fr' ? 'Mois' : 'Month'}
                </Button>
              </div>

              {/* Period Selectors */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('A', 'prev')}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">{formatPeriodLabel(periodADate)}</span>
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('A', 'next')}><ChevronRight className="w-4 h-4" /></Button>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('B', 'prev')}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">{formatPeriodLabel(periodBDate)}</span>
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('B', 'next')}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label={language === 'fr' ? 'Total Trades' : 'Total Trades'} valueA={statsA.totalTrades} valueB={statsB.totalTrades} />
            <StatCard label="Winrate" valueA={statsA.winrate} valueB={statsB.winrate} formatValue={v => `${v}%`} />
            <StatCard label="PnL" valueA={statsA.pnl} valueB={statsB.pnl} formatValue={v => v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)} />
            <StatCard label="Discipline" valueA={statsA.disciplineScore} valueB={statsB.disciplineScore} formatValue={v => `${v}%`} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{language === 'fr' ? 'Comparaison' : 'Comparison'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey={periodAKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={periodBKey} fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{language === 'fr' ? 'Radar Performance' : 'Performance Radar'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name={periodAKey} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar name={periodBKey} dataKey="B" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminComparison;
