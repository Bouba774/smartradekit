import React from 'react';
import AppSidebar from './AppSidebar';
import Footer from './Footer';
import NavigationProgress from '@/components/NavigationProgress';
import PageTransition from '@/components/PageTransition';
import BottomNavigation from './BottomNavigation';
import OfflineBanner from '@/components/OfflineBanner';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAutoPrefetch } from '@/hooks/useDataPrefetch';
import { useTrades } from '@/hooks/useTrades';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSmartNotifications, getNotificationPermission } from '@/hooks/useSmartNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isDashboard = location.pathname === '/dashboard';
  
  // Auto-prefetch data for faster navigation
  useAutoPrefetch();

  // Notifications intelligentes (tourne en arrière-plan sur toutes les pages)
  const { trades } = useTrades();
  const { language } = useLanguage();
  useSmartNotifications({
    trades,
    language,
    enabled: getNotificationPermission() === 'granted',
  });

  return (
    <SidebarProvider defaultOpen={false}>
      <OfflineBanner />
      <NavigationProgress />
      <div className="min-h-screen flex w-full bg-background relative overflow-x-hidden">
        {/* Ambient glow effects - reduced on mobile for performance */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] sm:blur-[150px] animate-pulse" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-profit/5 rounded-full blur-[100px] sm:blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && <AppSidebar />}
        
        <SidebarInset className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Header removed - no longer showing time/date/logo bar */}
          
          {/* Main content with bottom padding on mobile for bottom nav */}
          <main className={`flex-1 pt-2 sm:pt-4 px-3 sm:px-4 md:px-6 relative z-10 overflow-x-hidden overflow-y-auto ${isMobile ? 'pb-24' : 'pb-4 sm:pb-6'}`}>
            <PageTransition>
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
              {isDashboard && <Footer />}
            </PageTransition>
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        {isMobile && <BottomNavigation />}
      </div>
    </SidebarProvider>
  );
};

export default Layout;
