import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import { CHALLENGE_CATEGORIES, ChallengeCategory } from '@/data/disciplineChallenges';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Sparkles,
  Clock,
  Timer,
  Moon,
  ShieldCheck,
  Scale,
  Calculator,
  FileText,
  Crosshair,
  BarChart3,
  Smile,
  Heart,
  Brain,
  BookOpen,
  AlertTriangle,
  Gift,
  ChevronRight,
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
  Clock,
  Timer,
  Moon,
  ShieldCheck,
  Scale,
  Calculator,
  FileText,
  Crosshair,
  BarChart3,
  Smile,
  Heart,
  Brain,
  BookOpen,
};

const Challenges: React.FC = () => {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const {
    challenges,
    challengesByCategory,
    categories,
    rewardChests,
    disciplineStreak,
    hasSabotage,
    sabotageAlerts,
    isLoading,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    totalPoints,
    completedCount,
    totalChallenges,
    syncAllChallenges,
    USER_LEVELS,
    RARITY_COLORS,
  } = useChallenges();

  const [showCongrats, setShowCongrats] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState<typeof challenges[0] | null>(null);
  const [syncedChallenges, setSyncedChallenges] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<ChallengeCategory | null>('self_control');

  // Sync challenges on mount
  useEffect(() => {
    if (!isLoading && challenges.length > 0) {
      syncAllChallenges();
    }
  }, [challenges.length, isLoading]);

  // Check for newly completed challenges
  useEffect(() => {
    const newlyCompleted = challenges.find(c => 
      c.isNewlyCompleted && !syncedChallenges.has(c.id)
    );
    
    if (newlyCompleted) {
      setCompletedChallenge(newlyCompleted);
      setShowCongrats(true);
      setSyncedChallenges(prev => new Set([...prev, newlyCompleted.id]));
    }
  }, [challenges, syncedChallenges]);

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

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Congratulations Popup */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="bg-background border-border text-center w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-neon">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-display text-center">
              🎉 {t('congratulations')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <p className="text-base sm:text-lg text-foreground mb-2">
              {t('youHaveCompleted')}:
            </p>
            <p className="text-lg sm:text-xl font-display font-bold text-primary mb-4 break-words">
              {completedChallenge && (language === 'fr' ? completedChallenge.title.fr : completedChallenge.title.en)}
            </p>
            <p className="text-muted-foreground text-sm sm:text-base break-words">
              {t('reward')}: {completedChallenge && (language === 'fr' ? completedChallenge.reward.fr : completedChallenge.reward.en)}
            </p>
            <p className="text-profit font-bold mt-2">
              +{completedChallenge?.points} points!
            </p>
          </div>
          <Button
            onClick={() => setShowCongrats(false)}
            className="w-full bg-gradient-primary hover:opacity-90 font-display touch-target"
          >
            {t('continue')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
            {language === 'fr' ? 'Défis Discipline' : 'Discipline Challenges'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 break-words">
            {language === 'fr' ? 'Maîtrisez votre comportement, pas vos profits' : 'Master your behavior, not your profits'}
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon shrink-0">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Sabotage Alert */}
      {hasSabotage && sabotageAlerts.length > 0 && (
        <Alert className="border-loss/50 bg-loss/10">
          <AlertTriangle className="h-4 w-4 text-loss" />
          <AlertDescription className="text-loss text-sm">
            {language === 'fr' 
              ? '⚠️ Auto-sabotage détecté ! Les défis de type "Série" ont été réinitialisés.'
              : '⚠️ Self-sabotage detected! Streak challenges have been reset.'}
          </AlertDescription>
        </Alert>
      )}

      {/* User Level Card */}
      <div className="glass-card p-4 sm:p-6 animate-fade-in w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Level Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-neon animate-pulse-neon">
              <span className="text-3xl sm:text-4xl">{currentLevel.badge}</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
              {t('niv')} {currentLevel.level}
            </div>
          </div>

          {/* Level Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground break-words">
              {language === 'fr' ? currentLevel.title : currentLevel.titleEn}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3">
              {totalPoints} {t('points')} • {completedCount}/{totalChallenges} {t('challengesCompleted')}
            </p>
            
            {nextLevel && (
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span className="truncate max-w-[40%]">{language === 'fr' ? currentLevel.title : currentLevel.titleEn}</span>
                  <span className="truncate max-w-[40%] text-right">{language === 'fr' ? nextLevel.title : nextLevel.titleEn}</span>
                </div>
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  {nextLevel.minPoints - totalPoints} {t('pointsRemaining')}
                </p>
              </div>
            )}
          </div>

          {/* Discipline Streak */}
          <div className="shrink-0 text-center glass-card p-3 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-display text-2xl font-bold text-foreground">{disciplineStreak}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {language === 'fr' ? 'Jours Discipline' : 'Discipline Days'}
            </p>
          </div>
        </div>
      </div>

      {/* Reward Chests Section */}
      <div className="glass-card p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm sm:text-base">
            {language === 'fr' ? 'Coffres de Récompense' : 'Reward Chests'}
          </h3>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
          {rewardChests.map((chest, index) => {
            const rarityStyle = RARITY_COLORS[chest.rarity];
            
            return (
              <div
                key={chest.id}
                className={cn(
                  "relative flex flex-col items-center min-w-[80px] sm:min-w-[90px] p-3 rounded-lg border transition-all shrink-0",
                  rarityStyle.bg,
                  rarityStyle.border,
                  chest.unlocked ? rarityStyle.glow : 'opacity-60'
                )}
              >
                <span className="text-2xl sm:text-3xl mb-1">{chest.icon}</span>
                <span className={cn("text-[9px] sm:text-[10px] font-medium text-center leading-tight", rarityStyle.text)}>
                  {language === 'fr' ? chest.name.fr : chest.name.en}
                </span>
                <span className="text-[8px] text-muted-foreground mt-1">
                  {chest.requiredDays}j
                </span>
                {!chest.unlocked && (
                  <>
                    <Lock className="w-3 h-3 text-muted-foreground mt-1" />
                    <div className="w-full h-1 bg-secondary/50 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", rarityStyle.bg)}
                        style={{ width: `${chest.progress}%` }}
                      />
                    </div>
                  </>
                )}
                {chest.unlocked && (
                  <CheckCircle2 className="w-3 h-3 text-profit mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenges by Category */}
      {(Object.keys(categories) as ChallengeCategory[]).map((categoryKey, categoryIndex) => {
        const category = categories[categoryKey];
        const categoryChallenges = challengesByCategory[categoryKey];
        const CategoryIcon = iconMap[category.icon] || Target;
        const completedInCategory = categoryChallenges.filter(c => c.completed).length;
        const isExpanded = expandedCategory === categoryKey;

        return (
          <div 
            key={categoryKey} 
            className="glass-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${categoryIndex * 100}ms` }}
          >
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
              className={cn(
                "w-full p-4 flex items-center gap-3 transition-colors",
                category.bgColor,
                "hover:opacity-90"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                category.bgColor
              )}>
                <CategoryIcon className={cn("w-5 h-5", category.color)} />
              </div>
              <div className="flex-1 text-left">
                <h3 className={cn("font-display font-semibold text-sm sm:text-base", category.color)}>
                  {language === 'fr' ? category.title.fr : category.title.en}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? category.description.fr : category.description.en} • {completedInCategory}/{categoryChallenges.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", category.bgColor)}
                    style={{ width: `${(completedInCategory / categoryChallenges.length) * 100}%` }}
                  />
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  isExpanded && "rotate-90"
                )} />
              </div>
            </button>

            {/* Category Challenges */}
            {isExpanded && (
              <div className="p-4 pt-2 space-y-3">
                {categoryChallenges.map((challenge, index) => {
                  const Icon = iconMap[challenge.icon] || Target;
                  const progressPercent = (challenge.progress / challenge.target) * 100;

                  return (
                    <div
                      key={challenge.id}
                      className={cn(
                        "p-3 sm:p-4 rounded-lg border bg-background/50 relative overflow-hidden animate-fade-in",
                        challenge.completed && "border-profit/30",
                        challenge.wasReset && "border-loss/30"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Completed/Reset Badge */}
                      {challenge.completed && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-profit animate-scale-in" />
                        </div>
                      )}
                      {challenge.wasReset && (
                        <div className="absolute top-2 right-2">
                          <AlertTriangle className="w-5 h-5 text-loss" />
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          challenge.completed ? "bg-profit/20" : category.bgColor
                        )}>
                          <Icon className={cn(
                            "w-5 h-5",
                            challenge.completed ? "text-profit" : category.color
                          )} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-display font-semibold text-foreground text-sm break-words pr-6">
                              {language === 'fr' ? challenge.title.fr : challenge.title.en}
                            </h4>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full border shrink-0",
                              difficultyColors[challenge.difficulty]
                            )}>
                              {difficultyLabels[challenge.difficulty][language]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 break-words">
                            {language === 'fr' ? challenge.description.fr : challenge.description.en}
                          </p>

                          {/* Streak indicator */}
                          {challenge.isStreak && (
                            <div className="flex items-center gap-1 mb-2">
                              <Flame className="w-3 h-3 text-orange-400" />
                              <span className="text-[10px] text-orange-400">
                                {language === 'fr' ? 'Défi Série' : 'Streak Challenge'}
                              </span>
                            </div>
                          )}

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">{t('progress')}</span>
                              <span className={cn(
                                "font-medium",
                                challenge.completed ? "text-profit" : category.color
                              )}>
                                {challenge.progress}/{challenge.target}
                              </span>
                            </div>
                            <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                                  challenge.completed ? "bg-profit" : "bg-gradient-primary"
                                )}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Reward */}
                          <div className="mt-2 pt-2 border-t border-border flex flex-wrap items-center justify-between gap-1">
                            <p className="text-[10px] text-muted-foreground">
                              {t('reward')}: 
                              <span className="text-foreground ml-1">
                                {language === 'fr' ? challenge.reward.fr : challenge.reward.en}
                              </span>
                            </p>
                            <span className="text-[10px] font-bold text-profit">
                              +{challenge.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Level Roadmap */}
      <div className="glass-card p-4 sm:p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="font-display font-semibold text-foreground mb-4 sm:mb-6 text-sm sm:text-base">
          {t('levelProgression')}
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
          {USER_LEVELS.map((level, index) => {
            const isCurrentLevel = level.level === currentLevel.level;
            const isUnlocked = totalPoints >= level.minPoints;

            return (
              <React.Fragment key={level.level}>
                <div className={cn(
                  "flex flex-col items-center min-w-[60px] sm:min-w-[70px] md:min-w-[80px] p-2 sm:p-3 rounded-lg transition-all shrink-0",
                  isCurrentLevel && "bg-primary/20 border border-primary/50 shadow-neon",
                  !isCurrentLevel && isUnlocked && "bg-secondary/30",
                  !isUnlocked && "opacity-50"
                )}>
                  <span className="text-xl sm:text-2xl mb-1">{level.badge}</span>
                  <span className={cn(
                    "text-[9px] sm:text-[10px] md:text-xs font-medium text-center leading-tight",
                    isCurrentLevel ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {language === 'fr' ? level.title : level.titleEn}
                  </span>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground">
                    {level.minPoints}pts
                  </span>
                  {!isUnlocked && (
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground mt-1" />
                  )}
                </div>
                {index < USER_LEVELS.length - 1 && (
                  <div className={cn(
                    "w-4 sm:w-6 md:w-8 h-0.5 shrink-0",
                    isUnlocked ? "bg-primary" : "bg-border"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
