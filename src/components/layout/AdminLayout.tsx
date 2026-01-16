import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import AdminUserSelector from '@/components/admin/AdminUserSelector';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Menu, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import PageTransition from '@/components/PageTransition';
import { toast } from 'sonner';

/**
 * ADMIN LAYOUT - VERSION SÉCURISÉE
 * =================================
 * Layout pour l'espace administrateur avec validation serveur obligatoire.
 * 
 * Sécurité:
 * - Vérification du rôle admin à chaque montage
 * - Validation de session serveur périodique
 * - Redirection automatique si session expirée
 * - Aucun accès sans validation complète
 */

const AdminLayoutContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const { 
    isAdminVerified, 
    selectedUser, 
    exitAdminMode, 
    validateAdminSession,
    isSessionValid,
    sessionExpiresAt 
  } = useAdmin();
  const { language } = useLanguage();
  const { setOpenMobile } = useSidebar();
  const [isValidating, setIsValidating] = useState(true);

  // Validation initiale de la session côté serveur
  useEffect(() => {
    const validateSession = async () => {
      if (!authLoading && user && !roleLoading && isAdmin && isAdminVerified) {
        setIsValidating(true);
        const valid = await validateAdminSession();
        setIsValidating(false);
        
        if (!valid) {
          toast.error(language === 'fr' 
            ? 'Session admin invalide. Veuillez vous reconnecter.' 
            : 'Invalid admin session. Please reconnect.');
          navigate('/admin-verify');
        }
      } else {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [authLoading, user, roleLoading, isAdmin, isAdminVerified, validateAdminSession, navigate, language]);

  // Redirections de sécurité
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (!isAdminVerified) {
      navigate('/admin-verify');
      return;
    }
  }, [user, authLoading, isAdmin, roleLoading, isAdminVerified, navigate]);

  const handleExitAdminMode = () => {
    exitAdminMode();
    navigate('/dashboard');
  };

  // Affichage pendant le chargement
  if (authLoading || roleLoading || isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Lock className="w-8 h-8 text-primary animate-pulse" />
          <div className="text-muted-foreground">
            {language === 'fr' ? 'Validation de la session...' : 'Validating session...'}
          </div>
        </div>
      </div>
    );
  }

  // Vérification que la session est valide
  if (!isSessionValid && isAdminVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-semibold">
            {language === 'fr' ? 'Session expirée' : 'Session Expired'}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {language === 'fr' 
              ? 'Votre session admin a expiré. Veuillez vous reconnecter pour continuer.' 
              : 'Your admin session has expired. Please reconnect to continue.'}
          </p>
          <Button onClick={() => navigate('/admin-verify')}>
            {language === 'fr' ? 'Se reconnecter' : 'Reconnect'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Admin Header Bar - Indicateurs visuels clairs */}
        <header className="sticky top-0 z-40 border-b border-destructive/30 bg-destructive/5 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Badge ADMIN visible uniquement après validation */}
              <Badge variant="destructive" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                ADMIN
              </Badge>
              
              {/* Indicateur utilisateur sélectionné */}
              {selectedUser && (
                <Badge variant="outline" className="flex items-center gap-1 border-primary/50 text-primary">
                  <Eye className="w-3 h-3" />
                  {language === 'fr' ? 'Consultation:' : 'Viewing:'} {selectedUser.nickname}
                </Badge>
              )}
              
              {/* Indicateur d'expiration de session */}
              {sessionExpiresAt && (
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {language === 'fr' ? 'Session expire:' : 'Session expires:'}{' '}
                  {sessionExpiresAt.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExitAdminMode}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              {language === 'fr' ? 'Quitter mode admin' : 'Exit Admin Mode'}
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Sélecteur d'utilisateur - Toujours visible */}
            <AdminUserSelector />
            
            {/* Contenu de la page avec transitions */}
            <PageTransition>
              <div className="min-h-0">
                <Outlet />
              </div>
            </PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
