import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Image, 
  Calculator, 
  Trophy, 
  BookOpen, 
  Bot,
  Sparkles,
  ChevronRight,
  GitCompare,
  Coins,
  FileUp,
  Link2
} from 'lucide-react';

const FeatureShowcase: React.FC = () => {
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const features = useMemo(() => [
    {
      icon: BarChart3,
      title: t('featureShowcaseDashboardTitle'),
      desc: t('featureShowcaseDashboardDesc'),
      color: 'from-blue-500 to-cyan-500',
      highlights: [
        t('featureShowcaseDashboardH1'),
        t('featureShowcaseDashboardH2'),
        t('featureShowcaseDashboardH3')
      ]
    },
    {
      icon: TrendingUp,
      title: t('featureShowcaseHistoryTitle'),
      desc: t('featureShowcaseHistoryDesc'),
      color: 'from-green-500 to-emerald-500',
      highlights: [
        t('featureShowcaseHistoryH1'),
        t('featureShowcaseHistoryH2'),
        t('featureShowcaseHistoryH3')
      ]
    },
    {
      icon: Image,
      title: t('featureShowcaseMediaTitle'),
      desc: t('featureShowcaseMediaDesc'),
      color: 'from-red-500 to-orange-500',
      highlights: [
        t('featureShowcaseMediaH1'),
        t('featureShowcaseMediaH2'),
        t('featureShowcaseMediaH3')
      ]
    },
    {
      icon: Brain,
      title: t('featureShowcasePsychologyTitle'),
      desc: t('featureShowcasePsychologyDesc'),
      color: 'from-purple-500 to-pink-500',
      highlights: [
        t('featureShowcasePsychologyH1'),
        t('featureShowcasePsychologyH2'),
        t('featureShowcasePsychologyH3')
      ]
    },
    {
      icon: GitCompare,
      title: t('featureShowcaseComparisonTitle'),
      desc: t('featureShowcaseComparisonDesc'),
      color: 'from-violet-500 to-purple-500',
      highlights: [
        t('featureShowcaseComparisonH1'),
        t('featureShowcaseComparisonH2'),
        t('featureShowcaseComparisonH3')
      ]
    },
    {
      icon: Coins,
      title: t('featureShowcaseCurrencyTitle'),
      desc: t('featureShowcaseCurrencyDesc'),
      color: 'from-yellow-500 to-amber-500',
      highlights: [
        t('featureShowcaseCurrencyH1'),
        t('featureShowcaseCurrencyH2'),
        t('featureShowcaseCurrencyH3')
      ]
    },
    {
      icon: Link2,
      title: t('featureShowcaseMT5Title'),
      desc: t('featureShowcaseMT5Desc'),
      color: 'from-sky-500 to-blue-500',
      highlights: [
        t('featureShowcaseMT5H1'),
        t('featureShowcaseMT5H2'),
        t('featureShowcaseMT5H3')
      ]
    },
    {
      icon: FileUp,
      title: t('featureShowcaseImportTitle'),
      desc: t('featureShowcaseImportDesc'),
      color: 'from-teal-500 to-emerald-500',
      highlights: [
        t('featureShowcaseImportH1'),
        t('featureShowcaseImportH2'),
        t('featureShowcaseImportH3')
      ]
    },
    {
      icon: Calculator,
      title: t('featureShowcaseCalculatorTitle'),
      desc: t('featureShowcaseCalculatorDesc'),
      color: 'from-amber-500 to-yellow-500',
      highlights: [
        t('featureShowcaseCalculatorH1'),
        t('featureShowcaseCalculatorH2'),
        t('featureShowcaseCalculatorH3')
      ]
    },
    {
      icon: Trophy,
      title: t('featureShowcaseChallengesTitle'),
      desc: t('featureShowcaseChallengesDesc'),
      color: 'from-indigo-500 to-violet-500',
      highlights: [
        t('featureShowcaseChallengesH1'),
        t('featureShowcaseChallengesH2'),
        t('featureShowcaseChallengesH3')
      ]
    },
    {
      icon: BookOpen,
      title: t('featureShowcaseLessonsTitle'),
      desc: t('featureShowcaseLessonsDesc'),
      color: 'from-teal-500 to-cyan-500',
      highlights: [
        t('featureShowcaseLessonsH1'),
        t('featureShowcaseLessonsH2'),
        t('featureShowcaseLessonsH3')
      ]
    },
    {
      icon: Bot,
      title: t('featureShowcaseAITitle'),
      desc: t('featureShowcaseAIDesc'),
      color: 'from-fuchsia-500 to-pink-500',
      highlights: [
        t('featureShowcaseAIH1'),
        t('featureShowcaseAIH2'),
        t('featureShowcaseAIH3')
      ]
    },
  ], [t]);

  // Auto-scroll every 3 seconds (increased from 2s for better UX)
  const nextFeature = useCallback(() => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  }, [features.length]);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(nextFeature, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextFeature]);

  const handleFeatureClick = useCallback((index: number) => {
    setActiveFeature(index);
    setIsPaused(true);
    // Resume auto-scroll after 5 seconds of inactivity
    const timeout = setTimeout(() => setIsPaused(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const activeItem = features[activeFeature];
  const ActiveIcon = activeItem.icon;

  return (
    <div 
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Feature tabs - scrollable on mobile */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => handleFeatureClick(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-colors duration-200 ${
                  activeFeature === index
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                    : 'bg-card/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {feature.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{ 
              width: `${((activeFeature + 1) / features.length) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Feature detail card */}
      <div className="relative">
        <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8 overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${activeItem.color} mb-6 shadow-lg`}>
                <ActiveIcon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {activeItem.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                {activeItem.desc}
              </p>
              
              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {activeItem.highlights.map((highlight, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Visual indicator - simplified */}
            <div className="hidden md:flex items-center justify-center">
              <div className={`relative w-40 h-40 rounded-full bg-gradient-to-r ${activeItem.color} flex items-center justify-center shadow-2xl`}>
                <ActiveIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <button
              onClick={() => {
                setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 5000);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              {t('previous')}
            </button>
            
            <div className="flex gap-1.5">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleFeatureClick(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === activeFeature ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                setActiveFeature((prev) => (prev + 1) % features.length);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 5000);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FeatureShowcase);
