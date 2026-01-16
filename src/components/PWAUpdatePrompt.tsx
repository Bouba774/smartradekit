import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PWAUpdatePrompt: React.FC = () => {
  const { language } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleServiceWorker = async () => {
      try {
        // Get the existing registration or wait for it
        const registration = await navigator.serviceWorker.ready;
        registrationRef.current = registration;

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowPrompt(true);
              }
            });
          }
        });

        // Periodic update check every 5 minutes
        const intervalId = setInterval(() => {
          registration.update().catch(console.error);
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
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
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      // Send message to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
  }, [waitingWorker]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  // Force refresh - useful if the service worker doesn't respond
  const handleForceRefresh = useCallback(() => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    // Unregister the service worker and reload
    if (registrationRef.current) {
      registrationRef.current.unregister().then(() => {
        window.location.reload();
      });
    } else {
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
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {language === 'fr' ? 'Mettre à jour' : 'Update'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleForceRefresh}
                title={language === 'fr' ? 'Forcer le rafraîchissement' : 'Force refresh'}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismiss}
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
