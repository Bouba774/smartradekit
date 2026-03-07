import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudUpload } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { cn } from '@/lib/utils';

const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline, pendingCount } = useOffline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
    } else if (wasOffline) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOnline, wasOffline]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300',
        isOnline
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-500 text-white'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Connexion rétablie</span>
          {pendingCount > 0 && (
            <>
              <span>—</span>
              <CloudUpload className="w-4 h-4 animate-pulse" />
              <span>Synchronisation de {pendingCount} action{pendingCount > 1 ? 's' : ''}...</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Mode hors ligne</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">
              {pendingCount} en attente
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
