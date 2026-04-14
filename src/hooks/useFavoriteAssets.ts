import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FAVORITES_STORAGE_KEY = 'smart-trade-tracker-favorite-assets';
const PINNED_STORAGE_KEY = 'smart-trade-tracker-pinned-assets';

export const useFavoriteAssets = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites & pinned on mount
  useEffect(() => {
    const loadData = async () => {
      // Load from localStorage
      try {
        const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed)) setFavorites(parsed);
        }
        const savedPinned = localStorage.getItem(PINNED_STORAGE_KEY);
        if (savedPinned) {
          const parsed = JSON.parse(savedPinned);
          if (Array.isArray(parsed)) setPinned(parsed);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }

      // Sync with database if logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('known_devices')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            const stored = data.known_devices as { favorite_assets?: string[]; pinned_assets?: string[] } | null;
            if (stored?.favorite_assets && Array.isArray(stored.favorite_assets)) {
              setFavorites(stored.favorite_assets);
              localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stored.favorite_assets));
            }
            if (stored?.pinned_assets && Array.isArray(stored.pinned_assets)) {
              setPinned(stored.pinned_assets);
              localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(stored.pinned_assets));
            }
          }
        } catch (e) {
          console.error('Error loading from database:', e);
        }
      }

      setIsLoaded(true);
    };

    loadData();
  }, [user]);

  const saveToDb = useCallback(async (newFavorites: string[], newPinned: string[]) => {
    if (!user) return;
    try {
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
            pinned_assets: newPinned,
          },
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Error saving to database:', e);
    }
  }, [user]);

  const toggleFavorite = useCallback((asset: string) => {
    const newFavorites = favorites.includes(asset)
      ? favorites.filter(a => a !== asset)
      : [...favorites, asset];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    
    // If unfavoriting, also unpin
    let newPinned = pinned;
    if (favorites.includes(asset) && pinned.includes(asset)) {
      newPinned = pinned.filter(a => a !== asset);
      setPinned(newPinned);
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(newPinned));
    }
    
    saveToDb(newFavorites, newPinned);
  }, [favorites, pinned, saveToDb]);

  const togglePinned = useCallback((asset: string) => {
    // Can only pin favorites
    if (!favorites.includes(asset)) return;
    
    const newPinned = pinned.includes(asset)
      ? pinned.filter(a => a !== asset)
      : [...pinned, asset];
    setPinned(newPinned);
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(newPinned));
    saveToDb(favorites, newPinned);
  }, [favorites, pinned, saveToDb]);

  const isFavorite = useCallback((asset: string) => {
    return favorites.includes(asset);
  }, [favorites]);

  const isPinned = useCallback((asset: string) => {
    return pinned.includes(asset);
  }, [pinned]);

  return {
    favorites,
    pinned,
    isLoaded,
    toggleFavorite,
    togglePinned,
    isFavorite,
    isPinned,
  };
};

export default useFavoriteAssets;
