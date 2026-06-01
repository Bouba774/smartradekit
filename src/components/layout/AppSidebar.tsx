import React, { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/version';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  GitCompare,
  Brain,
  BookOpen,
  Calculator,
  ArrowRightLeft,
  Trophy,
  User,
  Settings,
  Info,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { isAdminVerified, isInAdminMode } = useAdmin();
  const { state, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
  const isOpen = isMobile ? openMobile : state === 'expanded';
  const isCollapsed = !isMobile && state === 'collapsed';

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/add-trade', icon: PlusCircle, label: t('addTrade') },
    { path: '/history', icon: History, label: t('history') },
    { path: '/reports', icon: FileText, label: t('reports') },
    { path: '/comparison', icon: GitCompare, label: t('periodComparison') },
    { path: '/psychology', icon: Brain, label: t('psychology') },
    { path: '/journal', icon: BookOpen, label: t('journal') },
    { path: '/calculator', icon: Calculator, label: t('calculator') },
    { path: '/currency-conversion', icon: ArrowRightLeft, label: t('currencyConversion') },
    { path: '/challenges', icon: Trophy, label: t('challenges') },
    { path: '/profile', icon: User, label: t('profile') },
    { path: '/settings', icon: Settings, label: t('settings') },
    { path: '/about', icon: Info, label: t('about') },
  ];

  // Fast navigation - close sidebar and navigate immediately
  const handleNavClick = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    
    // Close sidebar immediately on mobile
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
    
    // Navigate immediately
    navigate(path);
  }, [isMobile, openMobile, setOpenMobile, navigate]);

  const handleClose = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <>
      {/* Mobile overlay with fade animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isMobile && isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />
      
      <Sidebar 
        className={cn(
          "border-r border-primary/20 bg-sidebar/95 backdrop-blur-xl z-50",
          "transition-transform duration-300 ease-out",
          isMobile && "fixed inset-y-0 left-0",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
          isMobile && "w-[70vw] max-w-[360px]",
          "max-[420px]:w-[78vw]",
          !isMobile && !isCollapsed && "w-[220px]",
          !isMobile && isCollapsed && "w-[60px]"
        )}
        collapsible="icon"
      >
        <SidebarHeader className="p-3 sm:p-4 border-b border-primary/20">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3")}>
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
              <img 
                src="/assets/app-logo.png" 
                alt="PipsKit" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0 object-cover animate-logo-glow"
              />
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="font-display font-bold text-foreground text-sm leading-tight">
                    Smart Trade
                  </h1>
                  <p className="text-[10px] text-primary neon-text">
                    Kit <span className="text-muted-foreground">V{APP_VERSION}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Close button on mobile */}
            {isMobile && (
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/50 hover:bg-primary/20 transition-colors touch-target"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="py-2 sm:py-4 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                      >
                        <Link
                          to={item.path}
                          onClick={(e) => handleNavClick(e, item.path)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg transition-colors duration-100 group relative touch-target",
                            isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3",
                            isActive
                              ? "bg-primary/20 text-primary border-l-2 border-primary"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20"
                          )}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm font-medium truncate">
                              {item.label}
                            </span>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Desktop toggle button */}
        {!isMobile && (
          <SidebarFooter className="p-2 border-t border-primary/20">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title={isCollapsed ? 'Agrandir' : 'Réduire'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5" />
                  <span className="text-xs font-medium">Réduire</span>
                </>
              )}
            </button>
          </SidebarFooter>
        )}
      </Sidebar>
    </>
  );
};

export default AppSidebar;
