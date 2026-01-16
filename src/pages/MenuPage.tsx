import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  History,
  GitCompare,
  Brain,
  BookOpen,
  ArrowRightLeft,
  Trophy,
  User,
  Settings,
  Info,
  MessageCircle,
} from 'lucide-react';
import AIChatBot from '@/components/AIChatBot';

interface MenuSection {
  title: string;
  items: {
    path?: string;
    icon: React.ElementType;
    label: string;
    action?: () => void;
  }[];
}

const MenuPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const handleOpenAIChat = () => {
    setIsAIChatOpen(true);
  };

  // Group menu items by sections
  // Note: Dashboard, Reports, Add Trade, Calculator are in bottom nav - excluded here
  const menuSections: MenuSection[] = [
    {
      title: t('trading'),
      items: [
        { path: '/history', icon: History, label: t('history') },
        { path: '/comparison', icon: GitCompare, label: t('periodComparison') },
      ],
    },
    {
      title: t('psychology'),
      items: [
        { path: '/psychology', icon: Brain, label: t('psychology') },
        { path: '/journal', icon: BookOpen, label: t('journal') },
      ],
    },
    {
      title: t('tools'),
      items: [
        { path: '/currency-conversion', icon: ArrowRightLeft, label: t('currencyConversion') },
        { path: '/challenges', icon: Trophy, label: t('challenges') },
        { icon: MessageCircle, label: t('aiAssistant'), action: handleOpenAIChat },
      ],
    },
    {
      title: t('account'),
      items: [
        { path: '/profile', icon: User, label: t('profile') },
        { path: '/settings', icon: Settings, label: t('settings') },
        { path: '/about', icon: Info, label: t('about') },
      ],
    },
  ];

  const handleItemClick = (item: MenuSection['items'][0]) => {
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold">{t('menu')}</h1>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {/* Section Title */}
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-2">
              {section.title}
            </h3>
            
            {/* Section Items */}
            <div className="grid grid-cols-3 gap-2">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path || `action-${index}`}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2",
                      "p-4 rounded-xl",
                      "bg-secondary/50 hover:bg-primary/10",
                      "border border-primary/10 hover:border-primary/30",
                      "transition-all duration-200 ease-out",
                      "active:scale-95",
                      "min-h-[100px]",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    aria-label={item.label}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-primary/10"
                    )}>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Component - controlled externally */}
      <AIChatBot 
        isOpenExternal={isAIChatOpen} 
        onCloseExternal={() => setIsAIChatOpen(false)} 
      />
    </div>
  );
};

export default MenuPage;
