import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PWAUpdatePrompt: React.FC = () => {
  const { language } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const handleServiceWorker = async () => {
      try {
        // Get the existing registration or wait for it
        const registration = await navigator.serviceWorker.ready;
        registrationRef.current = registration;

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setShowPrompt(true);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });

        // Periodic update check every 5 minutes
        intervalId = setInterval(() => {
          registration.update().catch(console.error);
        }, 5 * 60 * 1000);

      } catch (error) {
        console.error('[PWA] Service worker error:', error);
      }
    };

    // Handle controller change - reload the page when new SW takes control
    const handleControllerChange = () => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    handleServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    
    try {
      const registration = registrationRef.current;
      
      if (registration?.waiting) {
        // Tell the waiting service worker to activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait a moment for the SW to take over, then reload
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // No waiting worker - just reload to get latest version
        window.location.reload();
      }
    } catch (error) {
      console.error('[PWA] Update error:', error);
      // Fallback: force reload
      window.location.reload();
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  // Force refresh - clear caches, unregister SW, and reload
  const handleForceRefresh = useCallback(async () => {
    setIsUpdating(true);
    
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      
      // Force hard reload
      window.location.href = window.location.href;
    } catch (error) {
      console.error('[PWA] Force refresh error:', error);
      window.location.reload();
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96">
      <div className="bg-card border border-primary/30 rounded-lg shadow-lg p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">
              {language === 'fr' ? 'Mise à jour disponible' : 'Update available'}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'fr' 
                ? 'Une nouvelle version de l\'application est disponible.'
                : 'A new version of the app is available.'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                className="flex-1"
                disabled={isUpdating}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating 
                  ? (language === 'fr' ? 'Mise à jour...' : 'Updating...') 
                  : (language === 'fr' ? 'Mettre à jour' : 'Update')}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleForceRefresh}
                title={language === 'fr' ? 'Forcer le rafraîchissement complet' : 'Force complete refresh'}
                disabled={isUpdating}
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismiss}
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
