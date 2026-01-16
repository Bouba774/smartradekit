import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, Zap, Target, Award } from 'lucide-react';

const AnimatedStats: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [values, setValues] = useState({
    winrate: 0,
    profitFactor: 0,
    trades: 0,
    profit: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setValues({
        winrate: 71,
        profitFactor: 1.85,
        trades: 247,
        profit: 12450,
      });
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setValues({
        winrate: Math.floor(71 * easeOut),
        profitFactor: parseFloat((1.85 * easeOut).toFixed(2)),
        trades: Math.floor(247 * easeOut),
        profit: Math.floor(12450 * easeOut),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, prefersReducedMotion]);

  const stats = [
    {
      icon: Target,
      label: t('animatedStatsWinRate'),
      value: `${values.winrate}%`,
      color: 'text-profit',
      bgColor: 'bg-profit/10',
      trend: '+5.2%',
    },
    {
      icon: Activity,
      label: t('animatedStatsProfitFactor'),
      value: values.profitFactor.toFixed(2),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+0.23',
    },
    {
      icon: Zap,
      label: t('animatedStatsTradesMonth'),
      value: values.trades.toString(),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      trend: '+12',
    },
    {
      icon: Award,
      label: t('animatedStatsTotalProfit'),
      value: `$${values.profit.toLocaleString()}`,
      color: 'text-profit',
      bgColor: 'bg-profit/10',
      trend: '+$2,340',
    },
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
              transition: `opacity 0.4s ease-out ${index * 0.08}s, transform 0.4s ease-out ${index * 0.08}s`,
            }}
          >
            <div className="relative p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors duration-200">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              
              {/* Value */}
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1 tabular-nums`}>
                {stat.value}
              </div>
              
              {/* Label */}
              <div className="text-sm text-muted-foreground mb-3">
                {stat.label}
              </div>
              
              {/* Trend */}
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-profit/10 text-profit">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(AnimatedStats);
