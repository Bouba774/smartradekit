import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur';
  delay?: number;
  duration?: number;
  threshold?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 400,
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, prefersReducedMotion]);

  // If reduced motion, render children directly
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionProperty: 'opacity, transform',
    };

    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return { ...baseStyles, opacity: 0, transform: 'translateY(20px)' };
        case 'fade-down':
          return { ...baseStyles, opacity: 0, transform: 'translateY(-20px)' };
        case 'fade-left':
          return { ...baseStyles, opacity: 0, transform: 'translateX(20px)' };
        case 'fade-right':
          return { ...baseStyles, opacity: 0, transform: 'translateX(-20px)' };
        case 'scale':
          return { ...baseStyles, opacity: 0, transform: 'scale(0.97)' };
        case 'blur':
          return { ...baseStyles, opacity: 0 };
        default:
          return { ...baseStyles, opacity: 0 };
      }
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'none',
    };
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  );
};

export default React.memo(ScrollReveal);
