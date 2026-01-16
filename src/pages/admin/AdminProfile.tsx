import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useAdminTrades } from '@/hooks/useAdminTrades';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  User,
  Mail,
  Trophy,
  Star,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedUser } = useAdmin();
  const { profile, isLoading: profileLoading } = useAdminProfile();
  const { trades, stats, isLoading: tradesLoading } = useAdminTrades();
  const locale = language === 'fr' ? fr : enUS;

  const isLoading = profileLoading || tradesLoading;

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Sélectionnez un utilisateur pour voir son profil' : 'Select a user to view their profile'}
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

  const getLevelTitle = (level: number) => {
    const titles = ['beginner', 'intermediate', 'analyst', 'pro', 'expert', 'legend'];
    const index = Math.min(level - 1, 5);
    return t(titles[index]);
  };

  const userLevel = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Profil Utilisateur' : 'User Profile'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Consultation en lecture seule' : 'Read-only view'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Profile Card */}
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-primary/30 shadow-neon">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                  {profile?.nickname?.charAt(0)?.toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold shadow-lg">
                {userLevel}
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {profile?.nickname || 'Trader'}
              </h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{selectedUser.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {language === 'fr' ? 'Membre depuis le ' : 'Member since '}
                  {format(new Date(selectedUser.created_at), 'd MMM yyyy', { locale })}
                </span>
              </div>
            </div>

            {/* Level & Title */}
            <div className="glass-card px-6 py-4 bg-primary/5 border border-primary/20 w-full max-w-sm">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    {t('titleLevel')}
                  </p>
                  <p className="font-display font-bold text-foreground">
                    {getLevelTitle(userLevel)} <span className="text-primary">({t('level')} {userLevel})</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  {totalPoints} {t('points')}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="w-full max-w-md">
                <p className="text-muted-foreground text-sm italic">"{profile.bio}"</p>
              </div>
            )}

            {/* Trading Style */}
            {profile?.trading_style && (
              <Badge variant="outline" className="text-sm">
                {profile.trading_style}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              {language === 'fr' ? 'Total Trades' : 'Total Trades'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stats?.totalTrades || 0}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-profit" />
              {language === 'fr' ? 'Winrate' : 'Win Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-profit">{stats?.winrate?.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-profit" />
              {language === 'fr' ? 'Profit Total' : 'Total Profit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-profit">+{stats?.totalProfit?.toFixed(2) || 0}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-loss" />
              {language === 'fr' ? 'Perte Totale' : 'Total Loss'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-loss">-{stats?.totalLoss?.toFixed(2) || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      {(profile?.weekly_objective_trades || profile?.monthly_objective_profit) && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">
              {language === 'fr' ? 'Objectifs' : 'Objectives'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.weekly_objective_trades && (
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Objectif hebdo (trades)' : 'Weekly target (trades)'}
                </p>
                <p className="text-xl font-bold text-foreground">{profile.weekly_objective_trades}</p>
              </div>
            )}
            {profile.monthly_objective_profit && (
              <div className="p-4 rounded-lg bg-profit/10">
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Objectif mensuel (profit)' : 'Monthly target (profit)'}
                </p>
                <p className="text-xl font-bold text-profit">{profile.monthly_objective_profit}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProfile;
