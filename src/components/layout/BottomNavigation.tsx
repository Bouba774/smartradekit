import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BarChart3, 
  PlusCircle, 
  Calculator, 
  Menu 
} from 'lucide-react';
import { usePrefetchOnHover } from '@/hooks/useDataPrefetch';

// Routes that should keep "Menu" highlighted
const MENU_ROUTES = [
  '/menu',
  '/history',
  '/comparison',
  '/psychology',
  '/journal',
  '/currency-conversion',
  '/challenges',
  '/ai-assistant',
  '/profile',
  '/settings',
  '/about',
];

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [tappedItem, setTappedItem] = useState<string | null>(null);
  const { prefetchForRoute } = usePrefetchOnHover();

  const navItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: t('dashboard'),
      ariaLabel: t('dashboard')
    },
    { 
      path: '/reports', 
      icon: BarChart3, 
      label: t('reports'),
      ariaLabel: t('reports')
    },
    { 
      path: 'add', 
      icon: PlusCircle, 
      label: t('addTrade'),
      ariaLabel: t('addTrade'),
      isCenter: true
    },
    { 
      path: '/calculator', 
      icon: Calculator, 
      label: t('calculator'),
      ariaLabel: t('calculator')
    },
    { 
      path: '/menu', 
      icon: Menu, 
      label: t('menu'),
      ariaLabel: t('menu'),
      isMenu: true
    },
  ];

  // Prefetch data on touch start for instant loading
  const handleTouchStart = useCallback((path: string) => {
    if (path !== 'add') {
      prefetchForRoute(path);
    }
  }, [prefetchForRoute]);

  const handleNavClick = (item: typeof navItems[0]) => {
    // Enhanced haptic feedback - more pronounced vibration pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]);
    }

    // Trigger tap animation
    setTappedItem(item.path);
    setTimeout(() => setTappedItem(null), 200);

    if (item.isCenter) {
      navigate('/add-trade');
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === 'add') {
      return location.pathname === '/add-trade';
    }
    if (path === '/menu') {
      return MENU_ROUTES.includes(location.pathname);
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-background border-t border-border",
          "pb-[env(safe-area-inset-bottom)]"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isTapped = tappedItem === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                onTouchStart={() => handleTouchStart(item.path)}
                onMouseEnter={() => handleTouchStart(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  "flex-1 h-full py-2",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                {/* Icon with animation */}
                <div 
                  className={cn(
                    "relative transition-all duration-200 ease-out",
                    isTapped && "scale-90",
                    active && "scale-110"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    )} 
                  />
                </div>
                
                {/* Label with ellipsis for long text */}
                <span 
                  className={cn(
                    "text-[10px] font-medium leading-none transition-all duration-200",
                    "max-w-[60px] truncate text-center",
                    active && "font-semibold"
                  )}
                >
                  {item.label}
                </span>

              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
