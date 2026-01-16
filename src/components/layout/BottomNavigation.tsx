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
  const [tappedItem, setTappedItem] = useState<string | null>(null);

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
    // Enhanced haptic feedback - more pronounced vibration pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]); // Vibration pattern: vibrate, pause, vibrate
    }

    // Trigger tap animation
    setTappedItem(item.path);
    setTimeout(() => setTappedItem(null), 200);

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
                
                {/* Label */}
                <span 
                  className={cn(
                    "text-[10px] font-medium leading-none transition-all duration-200",
                    active && "font-semibold"
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator - animated dot */}
                {active && (
                  <div 
                    className={cn(
                      "absolute bottom-1 left-1/2 -translate-x-1/2",
                      "w-1 h-1 rounded-full bg-primary",
                      "animate-[scale-in_0.2s_ease-out]",
                      "shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
                    )}
                  />
                )}
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
