import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import { useTrades } from '@/hooks/useTrades';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { useCurrency } from '@/hooks/useCurrency';
import { useTradeFocus } from '@/hooks/useTradeFocus';
import { useInitialCapital } from '@/hooks/useInitialCapital';
import { useSettings } from '@/hooks/useSettings';
import { APP_VERSION } from '@/lib/version';
import { getAssetCategory } from '@/data/assets';
import { mainStatsTooltips, timeTooltips, streaksTooltips, gaugeTooltips, advancedTooltips } from '@/data/helpTooltips';
import StatCard from '@/components/ui/StatCard';
import GaugeChart from '@/components/ui/GaugeChart';
import TradeFocusMode from '@/components/TradeFocusMode';
import ConfidentialValue from '@/components/ConfidentialValue';
import HelpTooltip from '@/components/ui/HelpTooltip';
import InitialCapitalPrompt from '@/components/InitialCapitalPrompt';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Clock,
  Percent,
  Scale,
  Calendar,
  ArrowUpDown,
  Zap,
  Timer,
  Trophy,
  AlertTriangle,
  Layers,
  Flame,
  Award,
  Focus,
  PieChart as PieChartIcon,
  Wallet,
  Info,
  LineChart as LineChartIcon,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { currentLevel } = useChallenges();
  const { trades, isLoading } = useTrades();
  const { formatAmount, currency } = useCurrency();
  const { isEnabled: focusEnabled, toggle: toggleFocus } = useTradeFocus();
  const { capitalInfo, showPrompt, dismissPrompt } = useInitialCapital();
  const { settings } = useSettings();
  
  // Get initial capital for equity curve and stats
  const initialCapital = capitalInfo.capitalDefined && capitalInfo.capital ? capitalInfo.capital : 10000;
  
  // Pass capital info to advanced stats hook
  const stats = useAdvancedStats(trades, { 
    initialCapital, 
    capitalDefined: capitalInfo.capitalDefined 
  });
  
  // State for capital prompt dialog
  const [capitalPromptOpen, setCapitalPromptOpen] = useState(showPrompt);
  
  // Sync prompt state
  React.useEffect(() => {
    if (showPrompt) {
      setCapitalPromptOpen(true);
    }
  }, [showPrompt]);

  // Render Trade Focus Mode if enabled
  if (focusEnabled) {
    return <TradeFocusMode />;
  }

  // User profile from auth
  const userNickname = profile?.nickname || 'Trader';
  const userLevel = profile?.level || 1;
  const levelTitle = language === 'fr' ? currentLevel.title : currentLevel.titleEn;

  // Generate equity curve data from trades (with default empty chart data)
  const equityData = React.useMemo(() => {
    if (trades.length === 0) {
      return [
        { date: language === 'fr' ? 'Départ' : 'Start', value: initialCapital, pnl: 0, isStart: true },
      ];
    }
    
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );
    
    // Start with initial capital point
    const result: { date: string; value: number; pnl: number; isStart?: boolean; asset?: string }[] = [
      { date: language === 'fr' ? 'Départ' : 'Start', value: initialCapital, pnl: 0, isStart: true }
    ];
    
    let runningTotal = initialCapital;
    const tradesToShow = sortedTrades.slice(-20); // Show more trades for better curve
    
    tradesToShow.forEach((trade) => {
      const pnl = trade.profit_loss || 0;
      runningTotal += pnl;
      result.push({
        date: format(parseISO(trade.trade_date), 'dd/MM', { locale: fr }),
        value: runningTotal,
        pnl: pnl,
        asset: trade.asset,
      });
    });
    
    return result;
  }, [trades, initialCapital, language]);

  // Generate monthly data (with default empty data)
  const monthlyData = React.useMemo(() => {
    if (trades.length === 0) {
      return [
        { month: 'Jan', pnl: 0, wins: 0, losses: 0 },
        { month: 'Fév', pnl: 0, wins: 0, losses: 0 },
        { month: 'Mar', pnl: 0, wins: 0, losses: 0 },
      ];
    }
    const months: { [key: string]: { pnl: number; wins: number; losses: number } } = {};
    trades.forEach(trade => {
      const monthKey = format(parseISO(trade.trade_date), 'MMM', { locale: fr });
      if (!months[monthKey]) {
        months[monthKey] = { pnl: 0, wins: 0, losses: 0 };
      }
      months[monthKey].pnl += trade.profit_loss || 0;
      if (trade.result === 'win') months[monthKey].wins++;
      if (trade.result === 'loss') months[monthKey].losses++;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [trades]);

  // Position distribution data (always show, even with 0 values)
  const positionData = [
    { name: t('longPositions'), value: stats.buyPositions || 0.1, actualValue: stats.buyPositions, color: 'hsl(var(--profit))' },
    { name: t('shortPositions'), value: stats.sellPositions || 0.1, actualValue: stats.sellPositions, color: 'hsl(var(--loss))' },
  ];

  // Results distribution
  const resultsData = [
    { name: t('winners'), value: stats.winningTrades || 0.1, actualValue: stats.winningTrades, color: 'hsl(var(--profit))' },
    { name: t('losers'), value: stats.losingTrades || 0.1, actualValue: stats.losingTrades, color: 'hsl(var(--loss))' },
    { name: t('breakeven'), value: stats.breakevenTrades || 0.1, actualValue: stats.breakevenTrades, color: 'hsl(var(--muted-foreground))' },
  ];

  // Market distribution data
  const marketDistribution = React.useMemo(() => {
    if (trades.length === 0) return [];
    
    const marketCounts: { [key: string]: { count: number; pnl: number } } = {};
    
    trades.forEach(trade => {
      const category = getAssetCategory(trade.asset);
      // Group categories for cleaner display
      let marketGroup = category;
      if (category.startsWith('Forex')) {
        marketGroup = 'Forex';
      } else if (category.startsWith('Indices')) {
        marketGroup = 'Indices';
      } else if (category.startsWith('Actions')) {
        marketGroup = 'Stocks';
      }
      
      if (!marketCounts[marketGroup]) {
        marketCounts[marketGroup] = { count: 0, pnl: 0 };
      }
      marketCounts[marketGroup].count += 1;
      marketCounts[marketGroup].pnl += trade.profit_loss || 0;
    });

    const total = trades.length;
    const marketColors: { [key: string]: string } = {
      'Forex': 'hsl(45, 93%, 47%)',
      'Crypto': 'hsl(142, 71%, 45%)',
      'Indices': 'hsl(0, 84%, 60%)',
      'Stocks': 'hsl(217, 91%, 60%)',
      'Métaux': 'hsl(48, 96%, 53%)',
      'Énergies': 'hsl(25, 95%, 53%)',
      'Other': 'hsl(220, 9%, 46%)',
    };

    return Object.entries(marketCounts)
      .map(([name, data]) => ({
        name,
        value: data.count,
        pnl: data.pnl,
        percentage: Math.round((data.count / total) * 100),
        color: marketColors[name] || marketColors['Other'],
      }))
      .sort((a, b) => b.value - a.value);
  }, [trades]);

  // Radar chart data for performance overview - all values clamped 0-100
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const round1 = (val: number) => Math.round(val * 10) / 10;
  
  const radarData = [
    { subject: t('winrate'), A: round1(clamp(stats.winrate, 0, 100)), fullMark: 100 },
    { subject: t('profitFactor'), A: round1(clamp(stats.profitFactor * 25, 0, 100)), fullMark: 100 },
    { subject: t('riskReward'), A: round1(clamp(stats.avgRiskReward * 25, 0, 100)), fullMark: 100 },
    { subject: t('consistency'), A: stats.longestWinStreak > 0 ? round1(clamp(stats.longestWinStreak * 15, 0, 100)) : 0, fullMark: 100 },
    { subject: t('riskManagement'), A: round1(clamp(100 - stats.maxDrawdownPercent, 0, 100)), fullMark: 100 },
  ];

  // No data message component
  const NoDataMessage = () => (
    <div className="text-center py-4 px-2 bg-muted/30 rounded-lg border border-border/50 mb-4">
      <p className="text-sm text-muted-foreground">
        {t('noDataYet')}
      </p>
    </div>
  );

  // Section header component
  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string; delay?: number }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
    </div>
  );

  return (
    <div className="space-y-6 py-4 w-full max-w-full overflow-x-hidden">
      {/* Initial Capital Prompt Dialog */}
      <InitialCapitalPrompt
        open={capitalPromptOpen}
        onOpenChange={setCapitalPromptOpen}
        onDismiss={dismissPrompt}
      />

      {/* Welcome Message */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-profit/10 border-primary/30">
        <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-foreground truncate">
          {t('welcome')} {userNickname} 👋
        </h1>
      </div>

      {/* Capital not defined notice */}
      {!capitalInfo.capitalDefined && trades.length > 0 && (
        <div 
          className="glass-card p-4 flex items-center gap-3 border-yellow-500/30 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/50 transition-colors"
          onClick={() => setCapitalPromptOpen(true)}
        >
          <Wallet className="w-5 h-5 text-yellow-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              {language === 'fr' 
                ? 'Définissez votre capital pour des statistiques plus précises' 
                : 'Set your capital for more accurate statistics'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' 
                ? 'Courbe d\'équité, drawdown, ROI...' 
                : 'Equity curve, drawdown, ROI...'}
            </p>
          </div>
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      )}

      {/* No data message */}
      {trades.length === 0 && <NoDataMessage />}

      {/* Section: Statistiques Principales */}
      <div>
        <SectionHeader icon={Activity} title={t('mainStatistics')} delay={100} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title={t('totalTransactions')}
            value={stats.totalTrades}
            icon={Activity}
            delay={150}
            tooltip={mainStatsTooltips.totalTrades}
          />
          <StatCard
            title={t('winningTransactions')}
            value={stats.winningTrades}
            icon={TrendingUp}
            variant="profit"
            delay={200}
            tooltip={mainStatsTooltips.winningTrades}
          />
          <StatCard
            title={t('losingTransactions')}
            value={stats.losingTrades}
            icon={TrendingDown}
            variant="loss"
            delay={250}
            tooltip={mainStatsTooltips.losingTrades}
          />
          <StatCard
            title={t('victoryRate')}
            value={`${stats.winrate.toFixed(1)}%`}
            icon={Target}
            variant={stats.winrate >= 50 ? 'profit' : 'loss'}
            delay={300}
            tooltip={mainStatsTooltips.winrate}
          />
          <StatCard
            title={t('breakeven')}
            value={stats.breakevenTrades}
            icon={ArrowUpDown}
            variant="neutral"
            delay={350}
            tooltip={mainStatsTooltips.breakeven}
          />
        </div>
      </div>

      {/* Section: Positions */}
      <div>
        <SectionHeader icon={ArrowUpDown} title={t('positions')} delay={400} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title={t('buyPositions')}
            value={stats.buyPositions}
            icon={TrendingUp}
            variant="profit"
            delay={450}
            tooltip={mainStatsTooltips.buyPositions}
          />
          <StatCard
            title={t('sellPositions')}
            value={stats.sellPositions}
            icon={TrendingDown}
            variant="loss"
            delay={500}
            tooltip={mainStatsTooltips.sellPositions}
          />
          <StatCard
            title={t('avgLotSize')}
            value={<ConfidentialValue>{stats.avgLotSize.toFixed(2)}</ConfidentialValue>}
            icon={Layers}
            delay={550}
            tooltip={mainStatsTooltips.avgLotSize}
          />
          <StatCard
            title={t('totalLots')}
            value={<ConfidentialValue>{stats.totalLots.toFixed(2)}</ConfidentialValue>}
            icon={Layers}
            delay={600}
            tooltip={mainStatsTooltips.totalLots}
          />
        </div>
      </div>

      {/* Section: Profits & Pertes */}
      <div>
        <SectionHeader icon={DollarSign} title={t('profitsAndLosses')} delay={650} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title={t('bestProfit')}
            value={<ConfidentialValue>{formatAmount(stats.bestProfit)}</ConfidentialValue>}
            icon={Trophy}
            variant="profit"
            delay={700}
            tooltip={mainStatsTooltips.bestProfit}
          />
          <StatCard
            title={t('worstLoss')}
            value={<ConfidentialValue>{formatAmount(stats.worstLoss)}</ConfidentialValue>}
            icon={AlertTriangle}
            variant="loss"
            delay={750}
            tooltip={mainStatsTooltips.worstLoss}
          />
          <StatCard
            title={t('avgProfitPerTrade')}
            value={<ConfidentialValue>{formatAmount(stats.avgProfitPerTrade)}</ConfidentialValue>}
            icon={TrendingUp}
            variant="profit"
            delay={800}
            tooltip={mainStatsTooltips.avgProfitPerTrade}
          />
          <StatCard
            title={t('avgLossPerTrade')}
            value={<ConfidentialValue>{formatAmount(stats.avgLossPerTrade)}</ConfidentialValue>}
            icon={TrendingDown}
            variant="loss"
            delay={850}
            tooltip={mainStatsTooltips.avgLossPerTrade}
          />
          <StatCard
            title={t('totalProfit')}
            value={<ConfidentialValue>{formatAmount(stats.totalProfit)}</ConfidentialValue>}
            icon={DollarSign}
            variant="profit"
            delay={900}
            tooltip={mainStatsTooltips.totalProfit}
          />
          <StatCard
            title={t('totalLoss')}
            value={<ConfidentialValue>{formatAmount(stats.totalLoss)}</ConfidentialValue>}
            icon={DollarSign}
            variant="loss"
            delay={950}
            tooltip="Somme totale de toutes les pertes enregistrées."
          />
        </div>
      </div>

      {/* Section: Indicateurs de Performance */}
      <div>
        <SectionHeader icon={Zap} title={t('performanceIndicators')} delay={1000} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            title={t('netProfit')}
            value={<ConfidentialValue>{formatAmount(stats.netProfit)}</ConfidentialValue>}
            icon={DollarSign}
            variant={stats.netProfit >= 0 ? 'profit' : 'loss'}
            delay={1050}
            tooltip={mainStatsTooltips.netProfit}
          />
          <StatCard
            title={t('profitFactorLabel')}
            value={stats.profitFactorDisplay}
            icon={Scale}
            variant={stats.profitFactor >= 1.5 ? 'profit' : stats.profitFactor >= 1 ? 'neutral' : 'loss'}
            delay={1100}
            tooltip={mainStatsTooltips.profitFactor}
          />
          <StatCard
            title={t('avgRiskReward')}
            value={stats.avgRiskRewardDisplay}
            icon={Scale}
            variant={stats.avgRiskReward >= 1.5 ? 'profit' : stats.avgRiskReward >= 1 ? 'neutral' : 'loss'}
            delay={1150}
            tooltip={mainStatsTooltips.avgRR}
          />
          <StatCard
            title={t('avgTradeResult')}
            value={<ConfidentialValue>{formatAmount(stats.avgTradeResult)}</ConfidentialValue>}
            icon={BarChart3}
            variant={stats.avgTradeResult >= 0 ? 'profit' : 'loss'}
            delay={1200}
            tooltip={mainStatsTooltips.avgTradeResult}
          />
        </div>
      </div>

      {/* Section: ROI & Drawdown (Capital-Based) */}
      <div>
        <SectionHeader icon={LineChartIcon} title={language === 'fr' ? 'ROI & Drawdown' : 'ROI & Drawdown'} delay={1025} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title={language === 'fr' ? 'Capital Actuel' : 'Current Equity'}
            value={
              <ConfidentialValue>
                {stats.capitalDefined ? stats.currentEquityDisplay : '--'}
              </ConfidentialValue>
            }
            icon={Wallet}
            variant={stats.currentEquity >= initialCapital ? 'profit' : 'loss'}
            delay={1030}
            tooltip={language === 'fr' 
              ? 'Valeur actuelle du capital (capital initial + PnL cumulé)' 
              : 'Current capital value (initial capital + cumulative PnL)'}
          />
          <StatCard
            title="ROI"
            value={
              <ConfidentialValue>
                {stats.roiDisplay}
              </ConfidentialValue>
            }
            icon={Percent}
            variant={stats.roi >= 0 ? 'profit' : 'loss'}
            delay={1035}
            tooltip={language === 'fr' 
              ? 'Retour sur Investissement : (Capital actuel - Capital initial) / Capital initial × 100. Définissez votre capital pour un calcul précis.' 
              : 'Return on Investment: (Current Equity - Initial Capital) / Initial Capital × 100. Set your capital for accurate calculation.'}
          />
          <StatCard
            title={language === 'fr' ? 'Drawdown Max' : 'Max Drawdown'}
            value={
              <ConfidentialValue>
                {stats.capitalDefined ? stats.maxDrawdownDisplay : `${stats.maxDrawdownPercent.toFixed(1)}%`}
              </ConfidentialValue>
            }
            icon={ArrowDownRight}
            variant={stats.maxDrawdownPercent > 10 ? 'loss' : stats.maxDrawdownPercent > 0 ? 'neutral' : 'profit'}
            delay={1040}
            tooltip={language === 'fr' 
              ? 'Perte maximale depuis le plus haut capital atteint. Un drawdown < 20% est considéré sain.' 
              : 'Maximum loss from peak equity. A drawdown < 20% is considered healthy.'}
          />
          <StatCard
            title={language === 'fr' ? 'Drawdown Actuel' : 'Current Drawdown'}
            value={
              <ConfidentialValue>
                {stats.isInDrawdown 
                  ? (stats.capitalDefined ? stats.currentDrawdownDisplay : `${stats.currentDrawdownPercent.toFixed(1)}%`)
                  : (language === 'fr' ? 'Aucun' : 'None')}
              </ConfidentialValue>
            }
            icon={stats.isInDrawdown ? AlertTriangle : TrendingUp}
            variant={stats.isInDrawdown 
              ? (stats.currentDrawdownPercent > 15 ? 'loss' : 'neutral') 
              : 'profit'}
            delay={1060}
            tooltip={language === 'fr' 
              ? 'Perte actuelle depuis le plus haut capital. Indicateur de risque en temps réel.' 
              : 'Current loss from peak equity. Real-time risk indicator.'}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;