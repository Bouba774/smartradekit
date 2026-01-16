import React, { useState } from 'react';
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
import BottomMenuSheet from './BottomMenuSheet';
import AddTradeSheet from './AddTradeSheet';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);

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
      path: 'menu', 
      icon: Menu, 
      label: t('menu'),
      ariaLabel: t('menu'),
      isMenu: true
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (item.isCenter) {
      setIsAddTradeOpen(true);
    } else if (item.isMenu) {
      setIsMenuOpen(true);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === 'add' || path === 'menu') return false;
    return location.pathname === path;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-background/80 backdrop-blur-md",
          "border-t border-primary/20",
          "pb-[env(safe-area-inset-bottom)]",
          // Fallback for browsers without backdrop-blur
          "supports-[backdrop-filter]:bg-background/80",
          "supports-[not(backdrop-filter)]:bg-background"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.isCenter) {
              // Center "Add" button - prominent style
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "relative -mt-6 flex flex-col items-center justify-center",
                    "w-14 h-14 rounded-full",
                    "bg-primary shadow-lg shadow-primary/30",
                    "transition-all duration-300 ease-out",
                    "hover:scale-105 hover:shadow-xl hover:shadow-primary/40",
                    "active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                  )}
                  aria-label={item.ariaLabel}
                >
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </button>
              );
            }
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "min-w-[60px] min-h-[44px] p-2 rounded-lg",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      active && "scale-110"
                    )} 
                  />
                  {/* Active indicator */}
                  {active && (
                    <div 
                      className={cn(
                        "absolute -bottom-1.5 left-1/2 -translate-x-1/2",
                        "w-1.5 h-1.5 rounded-full bg-primary",
                        "animate-scale-in"
                      )} 
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Menu Sheet */}
      <BottomMenuSheet 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />

      {/* Add Trade Sheet */}
      <AddTradeSheet
        isOpen={isAddTradeOpen}
        onClose={() => setIsAddTradeOpen(false)}
      />
    </>
  );
};

export default BottomNavigation;
