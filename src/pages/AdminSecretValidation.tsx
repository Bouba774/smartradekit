import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ADMIN SECRET VALIDATION PAGE
 * ============================
 * Page de validation du secret admin - Double authentification.
 * 
 * Sécurité:
 * - Aucun indice visible sur le mot de passe attendu
 * - Placeholder cryptique: "Nm cmp d dev d l'App"
 * - 3 tentatives max avant blocage 10 min (géré côté serveur)
 * - Aucune information sur le nombre de tentatives restantes
 */

const AdminSecretValidation: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const { isAdminVerified, verifyAdminSecret, isVerifying } = useAdmin();
  const { language } = useLanguage();

  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Redirection si non admin (sans révéler l'existence du mode admin)
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(language === 'fr' 
        ? 'Accès bloqué. Veuillez réessayer plus tard.' 
        : 'Access blocked. Please try again later.');
      return;
    }

    if (!secret.trim()) {
      setError(language === 'fr' ? 'Ce champ est requis' : 'This field is required');
      return;
    }

    setError('');
    const result = await verifyAdminSecret(secret);

    if (result.success) {
      toast.success(language === 'fr' ? 'Accès validé' : 'Access validated');
      navigate('/app/admin/dashboard');
    } else {
      if (result.blocked) {
        setIsBlocked(true);
        toast.error(result.message);
      } else {
        // Message générique - pas d'indication sur les tentatives restantes
        setError(result.message || (language === 'fr' ? 'Validation échouée' : 'Validation failed'));
      }
      setSecret('');
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background neutre */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-background to-muted/5" />

      <div className="w-full max-w-md relative z-10">
        {/* Icône simple - aucun texte indicatif */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center border border-border">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Formulaire de validation */}
        <div className="glass-card p-8 border-muted">
          {isBlocked ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-muted-foreground">
                {language === 'fr' ? 'Accès temporairement indisponible' : 'Access Temporarily Unavailable'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' 
                  ? 'Veuillez réessayer ultérieurement.' 
                  : 'Please try again later.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="mt-4"
              >
                {language === 'fr' ? 'Retour' : 'Back'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className={`pl-10 bg-secondary/50 border-border ${error ? 'border-destructive' : ''}`}
                    placeholder="Nm cmp d dev d l'App"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-destructive text-xs">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'fr' ? 'Vérification...' : 'Verifying...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {language === 'fr' ? 'Continuer' : 'Continue'}
                  </div>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSecretValidation;
