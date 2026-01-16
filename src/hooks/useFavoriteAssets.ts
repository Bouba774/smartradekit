import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FAVORITES_STORAGE_KEY = 'smart-trade-tracker-favorite-assets';

export const useFavoriteAssets = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      // First try localStorage
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        } catch (e) {
          console.error('Error loading favorites from localStorage:', e);
        }
      }

      // If user is logged in, sync with database
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('known_devices')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            // We're using known_devices JSON field to store favorites temporarily
            // In a real app, you'd have a dedicated column
            const stored = data.known_devices as { favorite_assets?: string[] } | null;
            if (stored?.favorite_assets && Array.isArray(stored.favorite_assets)) {
              setFavorites(stored.favorite_assets);
              localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stored.favorite_assets));
            }
          }
        } catch (e) {
          console.error('Error loading favorites from database:', e);
        }
      }

      setIsLoaded(true);
    };

    loadFavorites();
  }, [user]);

  // Save favorites
  const saveFavorites = useCallback(async (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));

    if (user) {
      try {
        // Get current known_devices to preserve other data
        const { data } = await supabase
          .from('user_settings')
          .select('known_devices')
          .eq('user_id', user.id)
          .single();

        const currentData = (data?.known_devices as Record<string, unknown>) || {};
        
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            known_devices: {
              ...currentData,
              favorite_assets: newFavorites,
            },
          }, { onConflict: 'user_id' });
      } catch (e) {
        console.error('Error saving favorites:', e);
      }
    }
  }, [user]);

  const toggleFavorite = useCallback((asset: string) => {
    const newFavorites = favorites.includes(asset)
      ? favorites.filter(a => a !== asset)
      : [...favorites, asset];
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((asset: string) => {
    return favorites.includes(asset);
  }, [favorites]);

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
  };
};

export default useFavoriteAssets;
