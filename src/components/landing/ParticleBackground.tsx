import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);
  
  // Detect if device is mobile or has low performance
  const shouldRender = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Skip on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return false;
    
    // Skip if user prefers reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    
    // Skip on low-end devices (less than 4 cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
    
    return true;
  }, []);

  // Defer particle initialization
  useEffect(() => {
    if (!shouldRender) return;
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, [shouldRender]);

  useEffect(() => {
    if (!isReady || !shouldRender) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let resizeTimeout: number;
    const resizeCanvas = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 100);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Minimal particle count for performance
    const particleCount = 20;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    let lastTime = 0;
    const frameInterval = 1000 / 20; // Cap at 20fps for better performance

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particleColor = resolvedTheme === 'dark' ? '255, 255, 255' : '0, 0, 0';

      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity * 0.25})`;
        ctx.fill();
      });

      // Skip connection lines entirely for better performance
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(resizeTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resolvedTheme, isReady, shouldRender]);

  if (!shouldRender || !isReady) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4, contain: 'strict' }}
    />
  );
};

export default React.memo(ParticleBackground);
