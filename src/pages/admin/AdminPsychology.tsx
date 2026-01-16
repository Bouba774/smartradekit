import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTrades } from '@/hooks/useAdminTrades';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GaugeChart from '@/components/ui/GaugeChart';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { parseISO, getDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminPsychology: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedUser } = useAdmin();
  const { trades, isLoading } = useAdminTrades();

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Sélectionnez un utilisateur pour voir son analyse' : 'Select a user to view their analysis'}
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

  const hasNoData = !trades || trades.length === 0;

  // Calculate emotion statistics
  const emotionStats = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const stats: Record<string, { wins: number; losses: number; trades: number }> = {};
    
    trades.forEach(trade => {
      const emotion = trade.emotions || 'Neutre';
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

  // Emotion distribution
  const emotionDistribution = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    const counts: Record<string, number> = {};
    trades.forEach(trade => {
      const emotion = trade.emotions || 'Neutre';
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

    const total = trades.length;
    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colorPalette[name] || `hsl(${(index * 47 + 60) % 360}, 70%, 55%)`,
    })).sort((a, b) => b.value - a.value);
  }, [trades]);

  // Discipline score
  const disciplineBreakdown = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        score: 0,
        factors: [
          { name: language === 'fr' ? 'Respect du plan' : 'Following plan', score: 0, icon: Target },
          { name: language === 'fr' ? 'Gestion du risque' : 'Risk management', score: 0, icon: Zap },
          { name: language === 'fr' ? 'Pas d\'overtrading' : 'No overtrading', score: 0, icon: AlertTriangle },
          { name: language === 'fr' ? 'SL toujours en place' : 'SL always set', score: 0, icon: CheckCircle2 },
          { name: language === 'fr' ? 'Pas de revenge trading' : 'No revenge trading', score: 0, icon: TrendingDown },
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
        { name: language === 'fr' ? 'Respect du plan' : 'Following plan', score: setupScore, icon: Target },
        { name: language === 'fr' ? 'Gestion du risque' : 'Risk management', score: tpScore, icon: Zap },
        { name: language === 'fr' ? 'Pas d\'overtrading' : 'No overtrading', score: Math.round(overtradingScore), icon: AlertTriangle },
        { name: language === 'fr' ? 'SL toujours en place' : 'SL always set', score: slScore, icon: CheckCircle2 },
        { name: language === 'fr' ? 'Pas de revenge trading' : 'No revenge trading', score: revengeScore, icon: TrendingDown },
      ],
    };
  }, [trades, language]);

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Analyse Psychologique' : 'Psychological Analysis'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? `Analyse de ${selectedUser.nickname}` : `${selectedUser.nickname}'s analysis`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {hasNoData ? (
        <Card className="glass-card p-12 text-center">
          <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {language === 'fr' ? 'Aucune donnée' : 'No data'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'fr' ? 'Cet utilisateur n\'a pas encore de trades' : 'This user has no trades yet'}
          </p>
        </Card>
      ) : (
        <>
          {/* Discipline Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {language === 'fr' ? 'Score de Discipline' : 'Discipline Score'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <GaugeChart
                    value={disciplineBreakdown.score}
                    max={100}
                    label={language === 'fr' ? 'Score global' : 'Overall Score'}
                    size="lg"
                    variant={disciplineBreakdown.score >= 70 ? 'profit' : disciplineBreakdown.score >= 40 ? 'primary' : 'loss'}
                  />
                </div>
                <div className="space-y-3">
                  {disciplineBreakdown.factors.map((factor) => (
                    <div key={factor.name} className="flex items-center gap-3">
                      <factor.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{factor.name}</span>
                          <span className={cn(
                            factor.score >= 70 ? "text-profit" :
                            factor.score >= 40 ? "text-primary" : "text-loss"
                          )}>{factor.score}%</span>
                        </div>
                        <Progress value={factor.score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emotion Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  {language === 'fr' ? 'Distribution Émotionnelle' : 'Emotion Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {emotionDistribution.slice(0, 5).map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emotion Performance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Performance par Émotion' : 'Performance by Emotion'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emotionStats.map((stat) => (
                  <div key={stat.emotion} className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">{stat.emotion}</span>
                      <span className="text-xs text-muted-foreground">{stat.trades} trades</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-profit" />
                        <span className="text-sm text-profit">{stat.wins}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-loss" />
                        <span className="text-sm text-loss">{stat.losses}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPsychology;
