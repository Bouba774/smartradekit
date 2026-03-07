import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTrades } from '@/hooks/useTrades';
import { useTradeMedia } from '@/hooks/useTradeMedia';
import { useTradeAutocomplete } from '@/hooks/useTradeAutocomplete';
import TradeMediaUploader, { type MediaItem } from '@/components/TradeMediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Save,
  Sparkles,
  Search,
  Loader2,
  Trash2,
  Star,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ASSET_CATEGORIES } from '@/data/assets';
import { useFavoriteAssets } from '@/hooks/useFavoriteAssets';
import { validateTradeForm, sanitizeText } from '@/lib/tradeValidation';
// Clé pour les données de trade en attente (utilisé lors de l'envoi depuis la calculatrice)
export const PENDING_TRADE_KEY = 'pending_trade_data';
import HelpTooltip from '@/components/ui/HelpTooltip';
import { tradeFormTooltips } from '@/data/helpTooltips';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'M45', 'H1', 'H2', 'H3', 'H4', 'D1', 'W1', 'MN'];

const EMOTIONS = [
  { value: 'calm', labelFr: 'Calme', labelEn: 'Calm', emoji: '😌' },
  { value: 'confident', labelFr: 'Confiant', labelEn: 'Confident', emoji: '💪' },
  { value: 'stressed', labelFr: 'Stressé', labelEn: 'Stressed', emoji: '😰' },
  { value: 'impulsive', labelFr: 'Impulsif', labelEn: 'Impulsive', emoji: '⚡' },
  { value: 'fearful', labelFr: 'Craintif', labelEn: 'Fearful', emoji: '😨' },
  { value: 'greedy', labelFr: 'Avide', labelEn: 'Greedy', emoji: '🤑' },
  { value: 'patient', labelFr: 'Patient', labelEn: 'Patient', emoji: '🧘' },
  { value: 'focused', labelFr: 'Concentré', labelEn: 'Focused', emoji: '🎯' },
  { value: 'euphoric', labelFr: 'Euphorique', labelEn: 'Euphoric', emoji: '🤩' },
  { value: 'anxious', labelFr: 'Anxieux', labelEn: 'Anxious', emoji: '😟' },
  { value: 'frustrated', labelFr: 'Frustré', labelEn: 'Frustrated', emoji: '😤' },
  { value: 'neutral', labelFr: 'Neutre', labelEn: 'Neutral', emoji: '😐' },
  { value: 'doubtful', labelFr: 'Hésitant', labelEn: 'Doubtful', emoji: '🤔' },
  { value: 'disciplined', labelFr: 'Discipliné', labelEn: 'Disciplined', emoji: '🎖️' },
  { value: 'overconfident', labelFr: 'Trop confiant', labelEn: 'Overconfident', emoji: '😎' },
  { value: 'tired', labelFr: 'Fatigué', labelEn: 'Tired', emoji: '😴' },
];

const TAGS = [
  { value: 'a_plus_setup', labelFr: 'Setup A+', labelEn: 'A+ Setup' },
  { value: 'high_probability', labelFr: 'Haute probabilité', labelEn: 'High Probability' },
  { value: 'plan_followed', labelFr: 'Plan respecté', labelEn: 'Plan Followed' },
  { value: 'breakeven', labelFr: 'Break-even', labelEn: 'Break-even' },
  { value: 'fomo', labelFr: 'FOMO', labelEn: 'FOMO' },
  { value: 'revenge_trading', labelFr: 'Revenge Trading', labelEn: 'Revenge Trading' },
  { value: 'overtrading', labelFr: 'Overtrading', labelEn: 'Overtrading' },
  { value: 'early_entry', labelFr: 'Entrée anticipée', labelEn: 'Early Entry' },
  { value: 'late_entry', labelFr: 'Entrée tardive', labelEn: 'Late Entry' },
  { value: 'perfect_execution', labelFr: 'Exécution parfaite', labelEn: 'Perfect Execution' },
  { value: 'news_event', labelFr: 'Événement news', labelEn: 'News Event' },
  { value: 'session_open', labelFr: 'Ouverture session', labelEn: 'Session Open' },
  { value: 'session_close', labelFr: 'Clôture session', labelEn: 'Session Close' },
  { value: 'trend_trade', labelFr: 'Trade tendance', labelEn: 'Trend Trade' },
  { value: 'counter_trend', labelFr: 'Contre-tendance', labelEn: 'Counter-Trend' },
  { value: 'scalp', labelFr: 'Scalp', labelEn: 'Scalp' },
  { value: 'swing', labelFr: 'Swing', labelEn: 'Swing' },
  { value: 'sl_hit', labelFr: 'SL touché', labelEn: 'SL Hit' },
  { value: 'tp_hit', labelFr: 'TP touché', labelEn: 'TP Hit' },
  { value: 'partial_tp', labelFr: 'TP partiel', labelEn: 'Partial TP' },
  { value: 'moved_sl', labelFr: 'SL déplacé', labelEn: 'Moved SL' },
  { value: 'killzone', labelFr: 'Killzone', labelEn: 'Killzone' },
  { value: 'liquidity_grab', labelFr: 'Prise de liquidité', labelEn: 'Liquidity Grab' },
];

const AddTrade: React.FC = () => {
  const { t, language } = useLanguage();
  const { getCurrencySymbol } = useCurrency();
  const { addTrade } = useTrades();
  const { uploadMedia } = useTradeMedia();
  const { setups: suggestedSetups, timeframes: suggestedTimeframes } = useTradeAutocomplete();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteAssets();
  const locale = language === 'fr' ? fr : enUS;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [entryTime, setEntryTime] = useState(() => format(new Date(), 'HH:mm'));
  const [exitDate, setExitDate] = useState<Date | undefined>();
  const [exitTime, setExitTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return format(d, 'HH:mm');
  });
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [customAsset, setCustomAsset] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [customTimeframe, setCustomTimeframe] = useState('');
  const [customSetup, setCustomSetup] = useState('');
  const [exitMethod, setExitMethod] = useState<'sl' | 'tp' | 'manual'>('manual');
  
  const [hasPendingData, setHasPendingData] = useState(false);

  const [formData, setFormData] = useState(() => {
    // Load pending trade data from localStorage on initial mount
    const savedData = localStorage.getItem(PENDING_TRADE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          asset: parsed.asset || '',
          setup: '',
          timeframe: '',
          entryPrice: parsed.entryPrice || '',
          exitPrice: '',
          stopLoss: parsed.stopLoss || '',
          takeProfit: parsed.takeProfit || '',
          lotSize: parsed.lotSize || '',
          pnl: '',
          risk: parsed.risk || '',
          riskCash: parsed.riskCash || '',
          capital: parsed.capital || '',
          emotion: '',
          notes: '',
        };
      } catch {
        return {
          asset: '',
          setup: '',
          timeframe: '',
          entryPrice: '',
          exitPrice: '',
          stopLoss: '',
          takeProfit: '',
          lotSize: '',
          pnl: '',
          risk: '',
          riskCash: '',
          capital: '',
          emotion: '',
          notes: '',
        };
      }
    }
    return {
      asset: '',
      setup: '',
      timeframe: '',
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      takeProfit: '',
      lotSize: '',
      pnl: '',
      risk: '',
      riskCash: '',
      capital: '',
      emotion: '',
      notes: '',
    };
  });

  // Track which risk field was last modified
  const [lastModifiedRiskField, setLastModifiedRiskField] = useState<'percent' | 'cash' | null>(null);

  // Check if there's pending data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(PENDING_TRADE_KEY);
    setHasPendingData(!!savedData);
  }, []);

  // Load direction from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(PENDING_TRADE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.direction) {
          setDirection(parsed.direction);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Filter assets based on search and organize with favorites first
  const { filteredAssets, filteredFavorites } = useMemo(() => {
    const searchLower = assetSearch.toLowerCase();
    const result: { [key: string]: string[] } = {};
    const favs: string[] = [];
    
    for (const [category, assets] of Object.entries(ASSET_CATEGORIES)) {
      const filtered = assets.filter(asset => {
        const matches = !assetSearch || asset.toLowerCase().includes(searchLower);
        if (matches && favorites.includes(asset)) {
          favs.push(asset);
        }
        return matches;
      });
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }
    return { filteredAssets: result, filteredFavorites: favs };
  }, [assetSearch, favorites]);

  // Calculate estimated duration in real-time
  const estimatedDuration = useMemo(() => {
    if (!exitDate) return null;
    
    // Build entry datetime
    const entryDateTime = new Date(date);
    if (entryTime) {
      const [hours, minutes] = entryTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        entryDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    // Build exit datetime
    const exitDateTime = new Date(exitDate);
    if (exitTime) {
      const [hours, minutes] = exitTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        exitDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    const durationMs = exitDateTime.getTime() - entryDateTime.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    
    // Check if exit is before entry (invalid)
    if (durationSeconds < 0) {
      return { isValid: false, formatted: '', seconds: durationSeconds };
    }
    
    // Format duration
    const days = Math.floor(durationSeconds / (60 * 60 * 24));
    const hours = Math.floor((durationSeconds % (60 * 60 * 24)) / (60 * 60));
    const mins = Math.floor((durationSeconds % (60 * 60)) / 60);
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    
    return { 
      isValid: true, 
      formatted: parts.length > 0 ? parts.join(' ') : '< 1m',
      seconds: durationSeconds 
    };
  }, [date, entryTime, exitDate, exitTime]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Bidirectional risk calculation
  const handleRiskPercentChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, risk: value };
      const capital = parseFloat(prev.capital);
      const percent = parseFloat(value);
      
      if (!isNaN(capital) && !isNaN(percent) && capital > 0) {
        newData.riskCash = ((capital * percent) / 100).toFixed(2);
      } else {
        newData.riskCash = '';
      }
      return newData;
    });
    setLastModifiedRiskField('percent');
  };

  const handleRiskCashChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, riskCash: value };
      const capital = parseFloat(prev.capital);
      const cash = parseFloat(value);
      
      if (!isNaN(capital) && !isNaN(cash) && capital > 0) {
        newData.risk = ((cash / capital) * 100).toFixed(2);
      } else {
        newData.risk = '';
      }
      return newData;
    });
    setLastModifiedRiskField('cash');
  };

  const handleCapitalChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, capital: value };
      const capital = parseFloat(value);
      
      // Recalculate based on last modified field
      if (lastModifiedRiskField === 'percent' && prev.risk) {
        const percent = parseFloat(prev.risk);
        if (!isNaN(capital) && !isNaN(percent) && capital > 0) {
          newData.riskCash = ((capital * percent) / 100).toFixed(2);
        }
      } else if (lastModifiedRiskField === 'cash' && prev.riskCash) {
        const cash = parseFloat(prev.riskCash);
        if (!isNaN(capital) && !isNaN(cash) && capital > 0) {
          newData.risk = ((cash / capital) * 100).toFixed(2);
        }
      }
      return newData;
    });
  };

  const clearPendingData = () => {
    localStorage.removeItem(PENDING_TRADE_KEY);
    setHasPendingData(false);
    setFormData({
      asset: '',
      setup: '',
      timeframe: '',
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      takeProfit: '',
      lotSize: '',
      pnl: '',
      risk: '',
      riskCash: '',
      capital: '',
      emotion: '',
      notes: '',
    });
    setDirection('buy');
    setSelectedTags([]);
    setCustomAsset('');
    setCustomSetup('');
    setCustomTimeframe('');
    setDate(new Date());
    setEntryTime(format(new Date(), 'HH:mm'));
    setExitDate(undefined);
    setExitTime('');
    toast.success(language === 'fr' ? 'Formulaire réinitialisé' : 'Form cleared');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleMediaError = (error: string) => {
    toast.error(error);
  };

  const calculateQualityScore = () => {
    let score = 0;
    if (formData.setup) score += 20;
    if (!selectedTags.includes('FOMO')) score += 20;
    if (formData.stopLoss) score += 20;
    if (parseFloat(formData.risk) <= 2) score += 10;
    if (selectedTags.includes('Plan Respecté')) score += 20;
    if (!selectedTags.includes('Revenge Trading')) score += 10;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAsset = customAsset || formData.asset;
    const finalSetup = customSetup || formData.setup;
    
    // Comprehensive validation using Zod schema
    const validationData = {
      asset: finalAsset,
      direction: direction,
      entryPrice: formData.entryPrice,
      exitPrice: formData.exitPrice || undefined,
      stopLoss: formData.stopLoss || undefined,
      takeProfit: formData.takeProfit || undefined,
      lotSize: formData.lotSize,
      pnl: formData.pnl || undefined,
      risk: formData.risk || undefined,
      setup: formData.setup || undefined,
      customSetup: customSetup || undefined,
      timeframe: formData.timeframe || customTimeframe || undefined,
      emotion: formData.emotion || undefined,
      notes: formData.notes || undefined,
    };

    const validation = validateTradeForm(validationData);
    if (!validation.success) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    // Validate exit date/time is not before entry date/time
    if (estimatedDuration && !estimatedDuration.isValid) {
      toast.error(
        language === 'fr' 
          ? 'La date/heure de sortie ne peut pas être antérieure à la date/heure d\'entrée' 
          : 'Exit date/time cannot be before entry date/time'
      );
      return;
    }

    
    setIsSubmitting(true);
    
    try {
      // Upload all media files
      const mediaFiles = mediaItems.map(item => item.file);
      const uploadedMedia = mediaFiles.length > 0 
        ? await uploadMedia(mediaFiles) 
        : { images: [], videos: [], audios: [] };

      const pnl = parseFloat(formData.pnl) || null;
      let result: 'win' | 'loss' | 'breakeven' | 'pending' | null = null;
      
      if (pnl !== null) {
        if (pnl > 0) result = 'win';
        else if (pnl < 0) result = 'loss';
        else result = 'breakeven';
      } else {
        result = 'pending';
      }

      // Build the complete entry datetime from date + entryTime
      const entryDateTime = new Date(date);
      if (entryTime) {
        const [hours, minutes] = entryTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          entryDateTime.setHours(hours, minutes, 0, 0);
        }
      }
      const tradeDateISO = entryDateTime.toISOString();

      // Calculate exit timestamp and duration
      let exitTimestamp: string | null = null;
      let durationSeconds: number | null = null;
      
      if (exitDate) {
        const exitDateTime = new Date(exitDate);
        if (exitTime) {
          const [hours, minutes] = exitTime.split(':').map(Number);
          if (!isNaN(hours) && !isNaN(minutes)) {
            exitDateTime.setHours(hours, minutes, 0, 0);
          }
        }
        exitTimestamp = exitDateTime.toISOString();
        // Calculate duration based on actual entry datetime (not just date)
        durationSeconds = Math.floor((exitDateTime.getTime() - entryDateTime.getTime()) / 1000);
        if (durationSeconds < 0) durationSeconds = null;
      }

      // Calculate exit price based on exit method
      let finalExitPrice = formData.exitPrice ? parseFloat(formData.exitPrice) : null;
      if (exitMethod === 'sl' && formData.stopLoss) {
        finalExitPrice = parseFloat(formData.stopLoss);
      } else if (exitMethod === 'tp' && formData.takeProfit) {
        finalExitPrice = parseFloat(formData.takeProfit);
      }

      // Validation for exit price
      if (finalExitPrice !== null && finalExitPrice < 0) {
        toast.error(language === 'fr' ? 'Le prix de sortie ne peut pas être négatif' : 'Exit price cannot be negative');
        setIsSubmitting(false);
        return;
      }
      
      await addTrade.mutateAsync({
        asset: finalAsset,
        direction: direction === 'buy' ? 'long' : 'short',
        entry_price: parseFloat(formData.entryPrice),
        exit_price: finalExitPrice,
        stop_loss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        take_profit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        lot_size: parseFloat(formData.lotSize),
        setup: finalSetup || null,
        custom_setup: customSetup ? sanitizeText(customSetup) : null,
        result,
        profit_loss: pnl,
        risk_amount: formData.riskCash ? parseFloat(formData.riskCash) : null,
        notes: formData.notes ? sanitizeText(formData.notes) : null,
        emotions: formData.emotion || null,
        images: uploadedMedia.images.length > 0 ? uploadedMedia.images : null,
        videos: uploadedMedia.videos.length > 0 ? uploadedMedia.videos : null,
        audios: uploadedMedia.audios.length > 0 ? uploadedMedia.audios : null,
        trade_date: tradeDateISO,
        exit_timestamp: exitTimestamp,
        exit_method: exitTimestamp ? exitMethod : null,
        duration_seconds: durationSeconds,
        timeframe: formData.timeframe || customTimeframe || null,
      });
      
      // Clear pending trade data from localStorage only after successful save
      localStorage.removeItem(PENDING_TRADE_KEY);
      
      toast.success(t('tradeRegistered'));
      
      // Reset form
      setFormData({
        asset: '',
        setup: '',
        timeframe: '',
        entryPrice: '',
        exitPrice: '',
        stopLoss: '',
        takeProfit: '',
        lotSize: '',
        pnl: '',
        risk: '',
        riskCash: '',
        capital: '',
        emotion: '',
        notes: '',
      });
      setDirection('buy');
      setSelectedTags([]);
      setMediaItems([]);
      setCustomAsset('');
      setCustomSetup('');
      setCustomTimeframe('');
      setDate(new Date());
      setEntryTime(format(new Date(), 'HH:mm'));
      setExitDate(undefined);
      setExitTime('');
      setExitMethod('manual');
      
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error(t('errorSavingTrade'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (