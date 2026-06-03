import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Native-style page transition.
 *
 * - Instant content swap (no fade-out delay that causes blink).
 * - A subtle horizontal slide-in on route change, similar to a stock
 *   Android activity transition. Animation completes in ~180ms.
 * - Disabled automatically when the user has turned off animations.
 */
const SETTINGS_KEY = 'smart-trade-tracker-settings';

const routeOrder = [
  '/dashboard',
  '/reports',
  '/add-trade',
  '/calculator',
  '/history',
  '/journal',
  '/profile',
  '/settings',
];

const getRouteIndex = (path: string): number => {
  const i = routeOrder.indexOf(path);
  return i === -1 ? routeOrder.length : i;
};

const animationsEnabled = (): boolean => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return true;
    return JSON.parse(raw)?.animations !== false;
  } catch { return true; }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [enterFrom, setEnterFrom] = useState<'none' | 'left' | 'right'>('none');
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return;
    if (!animationsEnabled()) {
      previousPathRef.current = location.pathname;
      return;
    }
    const prev = getRouteIndex(previousPathRef.current);
    const curr = getRouteIndex(location.pathname);
    setEnterFrom(curr > prev ? 'right' : curr < prev ? 'left' : 'none');
    previousPathRef.current = location.pathname;
    setAnimating(true);
    const id = window.setTimeout(() => setAnimating(false), 200);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  const initialTransform =
    !animating ? 'translate3d(0,0,0)' :
    enterFrom === 'right' ? 'translate3d(16px,0,0)' :
    enterFrom === 'left' ? 'translate3d(-16px,0,0)' :
    'translate3d(0,4px,0)';

  return (
    <div
      key={location.pathname}
      className="page-transition-container"
      style={{
        opacity: animating ? 0.001 : 1,
        transform: initialTransform,
        animation: animating ? 'pk-page-in 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards' : undefined,
        width: '100%',
        minHeight: '100%',
        willChange: animating ? 'transform, opacity' : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
