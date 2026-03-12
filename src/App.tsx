import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Layout from "@/components/layout/Layout";
import { CookieConsent } from "@/components/CookieConsent";
import LockScreen from "@/components/LockScreen";
import { usePinSecurity } from "@/hooks/usePinSecurity";
import { toast } from "sonner";

import { useSessionTracking } from "@/hooks/useSessionTracking";
import ChunkErrorBoundary from "@/components/ChunkErrorBoundary";
import { usePrefetchOnAuth } from "@/hooks/useRoutePrefetch";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { idbPersister } from "@/lib/offlineStorage";
import { initOfflineSync, syncPendingMutations } from "@/lib/offlineSync";
// Critical pages loaded immediately
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages with webpackChunkName for better caching
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "./pages/Dashboard"));
const AddTrade = lazy(() => import(/* webpackChunkName: "add-trade" */ "./pages/AddTrade"));
const History = lazy(() => import(/* webpackChunkName: "history" */ "./pages/History"));
const Reports = lazy(() => import(/* webpackChunkName: "reports" */ "./pages/Reports"));
const PeriodComparison = lazy(() => import(/* webpackChunkName: "comparison" */ "./pages/PeriodComparison"));
const PsychologicalAnalysis = lazy(() => import(/* webpackChunkName: "psychology" */ "./pages/PsychologicalAnalysis"));
const Journal = lazy(() => import(/* webpackChunkName: "journal" */ "./pages/Journal"));
const Calculator = lazy(() => import(/* webpackChunkName: "calculator" */ "./pages/Calculator"));
const CurrencyConversion = lazy(() => import(/* webpackChunkName: "currency" */ "./pages/CurrencyConversion"));
const Challenges = lazy(() => import(/* webpackChunkName: "challenges" */ "./pages/Challenges"));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ "./pages/Profile"));
const Settings = lazy(() => import(/* webpackChunkName: "settings" */ "./pages/Settings"));
const SessionsAdmin = lazy(() => import(/* webpackChunkName: "sessions" */ "./pages/SessionsAdmin"));
const AdminRoles = lazy(() => import(/* webpackChunkName: "admin-roles" */ "./pages/AdminRoles"));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/TermsOfUse"));
const About = lazy(() => import(/* webpackChunkName: "about" */ "./pages/About"));
const PrivacyCenter = lazy(() => import(/* webpackChunkName: "privacy" */ "./pages/PrivacyCenter"));
const ResetPassword = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/ResetPassword"));
const VerifyLogin = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/VerifyLogin"));
const ConfirmEmail = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/ConfirmEmail"));
const MenuPage = lazy(() => import(/* webpackChunkName: "menu" */ "./pages/MenuPage"));
const AIAssistant = lazy(() => import(/* webpackChunkName: "ai-assistant" */ "./pages/AIAssistant"));

const Help = lazy(() => import(/* webpackChunkName: "help" */ "./pages/Help"));
const AIChatBot = lazy(() => import(/* webpackChunkName: "ai-chat" */ "@/components/AIChatBot"));
const ChangelogModal = lazy(() => import(/* webpackChunkName: "changelog" */ "@/components/ChangelogModal"));

// Admin pages
const AdminSecretValidation = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/AdminSecretValidation"));
const AdminLayout = lazy(() => import(/* webpackChunkName: "admin" */ "./components/layout/AdminLayout"));

// Admin page wrappers - grouped in same chunk
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminDashboard"));
const AdminAddTrade = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminAddTrade"));
const AdminHistory = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminHistory"));
const AdminReports = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminReports"));
const AdminComparison = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminComparison"));
const AdminPsychology = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminPsychology"));
const AdminJournal = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminJournal"));
const AdminCalculator = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminCalculator"));
const AdminCurrencyConversion = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminCurrencyConversion"));
const AdminChallenges = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminChallenges"));
const AdminSessions = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminSessions"));
const AdminRolesPage = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminRolesPage"));
const AdminAuditHistory = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminAuditHistory"));
const AdminSecurityDashboard = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminSecurityDashboard"));
const AdminProfile = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminProfile"));
const AdminSettings = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminSettings"));
const AdminAbout = lazy(() => import(/* webpackChunkName: "admin-pages" */ "./pages/admin/AdminAbout"));

// Improved loading fallback with skeleton
const PageLoader = () => <PageSkeleton type="default" />;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep cache for offline
      retry: navigator.onLine ? 1 : 0, // Don't retry when offline
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch when coming back online
      refetchOnMount: false,
      networkMode: 'offlineFirst', // Use cache first, then network
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist options for IndexedDB
const persistOptions = {
  persister: idbPersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: 'v1',
};

// Initialize offline sync engine
initOfflineSync();

// Constants for brute force protection
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout

// Protected route wrapper with lock screen guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isLocked, isPinConfigured, isLoading: securityLoading } = useSecurity();

  if (loading || securityLoading) {
    return null; // Splash screen is still visible during loading
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isPinConfigured && isLocked) {
    return null;
  }

  return <>{children}</>;
};

// Component to conditionally render layout
const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    isLocked, 
    unlockApp, 
    isPinConfigured, 
    isLoading: securityLoading,
    failedAttempts,
    setFailedAttempts,
    lockCooldownEnd,
    setLockCooldown,
    clearLockCooldown,
  } = useSecurity();
  const {
    isBiometricEnabled,
    verifyPin,
    maxAttempts,
    shouldWipeOnMaxAttempts,
    wipeLocalData,
    requestPinReset,
    isVerifying,
    checkBiometricAvailability,
    verifyBiometric,
    pinStatus,
  } = usePinSecurity();

  // Check if biometric is actually available (credentials registered)
  const [biometricReady, setBiometricReady] = useState(false);
  
  useEffect(() => {
    if (isBiometricEnabled && user) {
      checkBiometricAvailability().then(setBiometricReady);
    } else {
      setBiometricReady(false);
    }
  }, [isBiometricEnabled, user, checkBiometricAvailability]);
  // Handle PIN verification with brute force protection
  const handlePinVerify = useCallback(async (pin: string): Promise<boolean> => {
    try {
      // Check if we're in cooldown
      if (lockCooldownEnd && lockCooldownEnd > Date.now()) {
        return false;
      }

      const isValid = await verifyPin({ pin });
      
      if (isValid) {
        unlockApp();
        setFailedAttempts(0);
        return true;
      }
      
      // Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Check if we should lock out (brute force protection)
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        const cooldownEnd = Date.now() + LOCKOUT_DURATION_MS;
        setLockCooldown(cooldownEnd);
        toast.error('Trop de tentatives. Veuillez patienter 1 minute.');
      }
      
      // Check if we should wipe data
      if (shouldWipeOnMaxAttempts && newAttempts >= (maxAttempts || MAX_PIN_ATTEMPTS)) {
        await wipeLocalData();
        toast.error('Données effacées après trop de tentatives');
      }
      
      return false;
    } catch {
      setFailedAttempts(failedAttempts + 1);
      return false;
    }
  }, [verifyPin, unlockApp, failedAttempts, setFailedAttempts, lockCooldownEnd, setLockCooldown, shouldWipeOnMaxAttempts, maxAttempts, wipeLocalData]);

  // Handle biometric authentication using proper WebAuthn credential
  const handleBiometricUnlock = useCallback(async (): Promise<boolean> => {
    try {
      // First check if biometric is properly configured
      const isAvailable = await checkBiometricAvailability();
      if (!isAvailable) {
        // Don't show error - just silently fail and let user use PIN
        return false;
      }

      // Use the proper verification that requires registered credentials
      const success = await verifyBiometric();
      
      if (success) {
        unlockApp();
        setFailedAttempts(0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      return false;
    }
  }, [checkBiometricAvailability, verifyBiometric, unlockApp, setFailedAttempts]);

  const handleForgotPin = useCallback(async () => {
    const success = await requestPinReset();
    if (success) {
      toast.success('Email de réinitialisation envoyé');
    } else {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  }, [requestPinReset]);

  const handleCooldownEnd = useCallback(() => {
    clearLockCooldown();
  }, [clearLockCooldown]);

  // Hide splash screen once both auth and security state are resolved
  useEffect(() => {
    if (!securityLoading && !authLoading) {
      window.dispatchEvent(new Event('app-ready'));
    }
  }, [securityLoading, authLoading]);

  if (securityLoading || authLoading) {
    return null; // Keep splash screen visible until fully resolved
  }

  // Show lock screen if locked and user is authenticated with PIN configured
  if (user && isLocked && isPinConfigured) {
    // Only show biometric option if credentials are actually registered
    const showBiometricOption = isBiometricEnabled && biometricReady;
    
    return (
      <LockScreen
        onUnlock={handlePinVerify}
        onBiometricUnlock={showBiometricOption ? handleBiometricUnlock : undefined}
        failedAttempts={failedAttempts}
        maxAttempts={maxAttempts || MAX_PIN_ATTEMPTS}
        showBiometric={showBiometricOption}
        pinLength={pinStatus?.pinLength || 4}
        isVerifying={isVerifying}
        onForgotPin={handleForgotPin}
        cooldownEndTime={lockCooldownEnd}
        onCooldownEnd={handleCooldownEnd}
      />
    );
  }

  return (
    <>
      <ChunkErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public landing page - redirects to dashboard if logged in */}
            <Route path="/" element={
              authLoading ? null : user ? <Navigate to="/dashboard" replace /> : <Landing />
            } />
            
            {/* Auth pages */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-login" element={<VerifyLogin />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            
            {/* Public pages without authentication */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/aide" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            
            {/* Admin verification page */}
            <Route path="/admin-verify" element={<ProtectedRoute><AdminSecretValidation /></ProtectedRoute>} />
            
            {/* ========== USER ROUTES ========== */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/add-trade" element={<ProtectedRoute><Layout><AddTrade /></Layout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/comparison" element={<ProtectedRoute><Layout><PeriodComparison /></Layout></ProtectedRoute>} />
            <Route path="/psychology" element={<ProtectedRoute><Layout><PsychologicalAnalysis /></Layout></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Layout><Journal /></Layout></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><Layout><Calculator /></Layout></ProtectedRoute>} />
            <Route path="/currency-conversion" element={<ProtectedRoute><Layout><CurrencyConversion /></Layout></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Layout><Challenges /></Layout></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><Layout><SessionsAdmin /></Layout></ProtectedRoute>} />
            <Route path="/admin-roles" element={<ProtectedRoute><Layout><AdminRoles /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/privacy-center" element={<ProtectedRoute><Layout><PrivacyCenter /></Layout></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Layout><MenuPage /></Layout></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><Layout><AIAssistant /></Layout></ProtectedRoute>} />
            
            {/* ========== ADMIN ROUTES ========== */}
            <Route path="/app/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="add-trade" element={<AdminAddTrade />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="comparison" element={<AdminComparison />} />
              <Route path="psychology" element={<AdminPsychology />} />
              <Route path="journal" element={<AdminJournal />} />
              <Route path="calculator" element={<AdminCalculator />} />
              <Route path="currency-conversion" element={<AdminCurrencyConversion />} />
              <Route path="challenges" element={<AdminChallenges />} />
              <Route path="sessions" element={<AdminSessions />} />
              <Route path="roles" element={<AdminRolesPage />} />
              <Route path="audit" element={<AdminAuditHistory />} />
              <Route path="security" element={<AdminSecurityDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="about" element={<AdminAbout />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
      {user && (
        <Suspense fallback={null}>
          <AIChatBot />
          <ChangelogModal />
        </Suspense>
      )}
    </>
  );
};

// Wrapper to use hooks inside BrowserRouter
const AppWrapper = () => {
  return (
    <>
      <AppContent />
      <CookieConsent />
    </>
  );
};

// Top-level error boundary to prevent black screen on crash
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidMount() {
    window.dispatchEvent(new Event('app-ready'));
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#fff', background: '#0a1929', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Une erreur est survenue</h2>
          <p style={{ color: '#aaa' }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handleRejection);
    window.dispatchEvent(new Event('app-ready'));
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  // Detect if running inside Capacitor (file:// protocol or capacitor://)
  const isCapacitor = typeof window !== 'undefined' && (
    window.location.protocol === 'file:' ||
    window.location.protocol === 'capacitor:' ||
    navigator.userAgent.includes('SmartTradeKit/Native')
  );

  const Router = isCapacitor ? HashRouter : BrowserRouter;

  return (
    <AppErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <SecurityProvider>
                <AdminProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Router>
                      <AppWrapper />
                    </Router>
                  </TooltipProvider>
                </AdminProvider>
              </SecurityProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
