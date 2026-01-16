import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminChallenges } from '@/hooks/useAdminChallenges';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Trophy,
  Target,
  Flame,
  Star,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Shield,
};

const AdminChallenges: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedUser } = useAdmin();
  const {
    challenges,
    isLoading,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    totalPoints,
    completedCount,
    USER_LEVELS
  } = useAdminChallenges();

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Sélectionnez un utilisateur pour voir ses défis' : 'Select a user to view their challenges'}
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

  const difficultyColors = {
    easy: 'bg-profit/20 text-profit border-profit/30',
    medium: 'bg-primary/20 text-primary border-primary/30',
    hard: 'bg-loss/20 text-loss border-loss/30',
    expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const difficultyLabels = {
    easy: { fr: 'Facile', en: 'Easy' },
    medium: { fr: 'Moyen', en: 'Medium' },
    hard: { fr: 'Difficile', en: 'Hard' },
    expert: { fr: 'Expert', en: 'Expert' },
  };

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Défis & Progression' : 'Challenges & Progress'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? `Défis de ${selectedUser.nickname}` : `${selectedUser.nickname}'s challenges`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Trophy className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* User Level Card */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Level Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-neon">
                <span className="text-4xl">{currentLevel.badge}</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {t('niv')} {currentLevel.level}
              </div>
            </div>

            {/* Level Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {language === 'fr' ? currentLevel.title : currentLevel.titleEn}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {totalPoints} {t('points')} • {completedCount} {t('challengesCompleted')}
              </p>
              
              {nextLevel && (
                <div className="space-y-2 max-w-md">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{language === 'fr' ? currentLevel.title : currentLevel.titleEn}</span>
                    <span>{language === 'fr' ? nextLevel.title : nextLevel.titleEn}</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {nextLevel.minPoints - totalPoints} {t('pointsRemaining')}
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="glass-card p-3 rounded-lg">
                <p className="font-display text-2xl font-bold text-profit">{completedCount}</p>
                <p className="text-xs text-muted-foreground">{t('completedLabel')}</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <p className="font-display text-2xl font-bold text-primary">{challenges.length - completedCount}</p>
                <p className="text-xs text-muted-foreground">{t('inProgress')}</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <p className="font-display text-2xl font-bold text-foreground">{challenges.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges by Difficulty */}
      {(['easy', 'medium', 'hard', 'expert'] as const).map((difficulty) => {
        const sectionChallenges = challenges.filter(c => c.difficulty === difficulty);
        if (sectionChallenges.length === 0) return null;

        return (
          <div key={difficulty} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                difficultyColors[difficulty]
              )}>
                {difficultyLabels[difficulty][language]}
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionChallenges.map((challenge) => {
                const Icon = iconMap[challenge.icon] || Target;
                const progressPercent = (challenge.progress / challenge.target) * 100;

                return (
                  <Card
                    key={challenge.id}
                    className={cn(
                      "glass-card relative overflow-hidden",
                      challenge.completed && "border-profit/30"
                    )}
                  >
                    {challenge.completed && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-profit" />
                      </div>
                    )}

                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                          challenge.completed ? "bg-profit/20" : "bg-primary/20"
                        )}>
                          <Icon className={cn(
                            "w-6 h-6",
                            challenge.completed ? "text-profit" : "text-primary"
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground mb-1 pr-8">
                            {language === 'fr' ? challenge.title : challenge.titleEn}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {language === 'fr' ? challenge.description : challenge.descriptionEn}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{t('progress')}</span>
                              <span className={cn(
                                "font-medium",
                                challenge.completed ? "text-profit" : "text-primary"
                              )}>
                                {challenge.progress}/{challenge.target}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(progressPercent, 100)} 
                              className={cn("h-2", challenge.completed && "[&>div]:bg-profit")}
                            />
                          </div>

                          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {t('reward')}: <span className="text-foreground">{challenge.reward}</span>
                            </p>
                            <span className="text-xs font-bold text-profit">+{challenge.points} pts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Level Roadmap */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t('levelProgression')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {USER_LEVELS.map((level, index) => {
              const isCurrentLevel = level.level === currentLevel.level;
              const isUnlocked = totalPoints >= level.minPoints;

              return (
                <React.Fragment key={level.level}>
                  <div className={cn(
                    "flex flex-col items-center min-w-[80px] p-3 rounded-lg transition-all shrink-0",
                    isCurrentLevel && "bg-primary/20 border border-primary/50 shadow-neon",
                    !isCurrentLevel && isUnlocked && "bg-secondary/30",
                    !isUnlocked && "opacity-50"
                  )}>
                    <span className="text-2xl mb-1">{level.badge}</span>
                    <span className={cn(
                      "text-xs font-medium text-center",
                      isCurrentLevel ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {language === 'fr' ? level.title : level.titleEn}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{level.minPoints}pts</span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-muted-foreground mt-1" />}
                  </div>
                  {index < USER_LEVELS.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 shrink-0",
                      isUnlocked ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChallenges;
