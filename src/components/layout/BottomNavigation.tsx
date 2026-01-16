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
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "flex-1 h-full py-2",
                  "transition-colors duration-200",
                  "focus:outline-none",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium leading-none">
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
