import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

type TransitionDirection = 'left' | 'right' | 'none';

// Define route order for determining slide direction
const routeOrder = [
  '/dashboard',
  '/reports',
  '/add-trade',
  '/calculator',
];

const getRouteIndex = (path: string): number => {
  const index = routeOrder.indexOf(path);
  return index === -1 ? routeOrder.length : index;
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [direction, setDirection] = useState<TransitionDirection>('none');
  const previousPathRef = useRef(location.pathname);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Only trigger transition if path actually changed
    if (previousPathRef.current !== location.pathname) {
      const previousIndex = getRouteIndex(previousPathRef.current);
      const currentIndex = getRouteIndex(location.pathname);
      
      // Determine slide direction based on route order
      const newDirection: TransitionDirection = 
        currentIndex > previousIndex ? 'left' : 
        currentIndex < previousIndex ? 'right' : 'none';
      
      setDirection(newDirection);
      previousPathRef.current = location.pathname;
      
      // Quick fade out then immediate fade in
      setIsVisible(false);
      
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          // Small delay then fade back in
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsVisible(true);
            }
          }, 50);
        }
      });
    }
  }, [location.pathname]);

  const getTransform = () => {
    if (isVisible) return 'translateX(0)';
    
    switch (direction) {
      case 'left':
        return 'translateX(-20px)';
      case 'right':
        return 'translateX(20px)';
      default:
        return 'translateY(4px)';
    }
  };

  return (
    <div
      className="page-transition-container"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        width: '100%',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
