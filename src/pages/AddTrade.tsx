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
    <form onSubmit={handleSubmit} className="py-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('addTrade')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('registerNewTrade')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Pending Data Banner */}
      {hasPendingData && (
        <div className="glass-card p-3 border-primary/30 bg-primary/5 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              {language === 'fr' ? 'Données pré-remplies depuis la calculatrice' : 'Pre-filled data from calculator'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearPendingData}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Direction */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">{t('direction')}</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={direction === 'buy' ? 'default' : 'outline'}
            className={cn(direction === 'buy' && 'bg-profit hover:bg-profit/90 text-white')}
            onClick={() => setDirection('buy')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('buy')} / Long
          </Button>
          <Button
            type="button"
            variant={direction === 'sell' ? 'default' : 'outline'}
            className={cn(direction === 'sell' && 'bg-loss hover:bg-loss/90 text-white')}
            onClick={() => setDirection('sell')}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            {t('sell')} / Short
          </Button>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">
          {t('asset')} <HelpTooltip tooltip={tradeFormTooltips.asset} size="sm" />
        </Label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'fr' ? 'Rechercher un actif...' : 'Search asset...'}
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Favorites */}
        {filteredFavorites.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground mb-2 block">
              <Star className="w-3 h-3 inline mr-1 text-yellow-500" />
              {language === 'fr' ? 'Favoris' : 'Favorites'}
            </span>
            <div className="flex flex-wrap gap-2">
              {filteredFavorites.map(asset => (
                <Badge
                  key={asset}
                  variant={formData.asset === asset ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.asset === asset && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => { handleInputChange('asset', asset); setCustomAsset(''); }}
                >
                  {asset}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Asset Categories */}
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {Object.entries(filteredAssets).map(([category, assets]) => (
            <div key={category}>
              <span className="text-xs text-muted-foreground font-medium">{category}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {assets.map(asset => (
                  <Badge
                    key={asset}
                    variant={formData.asset === asset ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer text-xs transition-all",
                      formData.asset === asset && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => { handleInputChange('asset', asset); setCustomAsset(''); }}
                  >
                    {asset}
                    <button
                      type="button"
                      className="ml-1"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(asset); }}
                    >
                      <Star className={cn("w-3 h-3", isFavorite(asset) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Custom Asset */}
        <Input
          placeholder={language === 'fr' ? 'Ou saisir un actif personnalisé...' : 'Or enter custom asset...'}
          value={customAsset}
          onChange={(e) => { setCustomAsset(e.target.value); if (e.target.value) handleInputChange('asset', ''); }}
          className="mt-3"
        />
      </div>

      {/* Dates & Times */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">
          {language === 'fr' ? 'Date & Heure' : 'Date & Time'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Entry Date */}
          <div>
            <Label className="text-xs text-muted-foreground">{language === 'fr' ? 'Entrée' : 'Entry'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'dd/MM/yyyy', { locale })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} locale={locale} />
              </PopoverContent>
            </Popover>
            <Input type="time" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} className="mt-2" />
          </div>
          {/* Exit Date */}
          <div>
            <Label className="text-xs text-muted-foreground">{language === 'fr' ? 'Sortie' : 'Exit'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {exitDate ? format(exitDate, 'dd/MM/yyyy', { locale }) : (language === 'fr' ? 'Optionnel' : 'Optional')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={exitDate} onSelect={(d) => setExitDate(d || undefined)} locale={locale} />
              </PopoverContent>
            </Popover>
            <Input type="time" value={exitTime} onChange={(e) => setExitTime(e.target.value)} className="mt-2" />
          </div>
        </div>
        {/* Duration estimate */}
        {estimatedDuration && (
          <div className={cn("mt-2 flex items-center gap-2 text-xs", estimatedDuration.isValid ? "text-muted-foreground" : "text-loss")}>
            <Clock className="w-3 h-3" />
            {estimatedDuration.isValid
              ? `${language === 'fr' ? 'Durée estimée' : 'Estimated duration'}: ${estimatedDuration.formatted}`
              : (language === 'fr' ? 'Date de sortie antérieure à l\'entrée' : 'Exit date is before entry')}
          </div>
        )}
      </div>

      {/* Prices */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">
          {language === 'fr' ? 'Prix' : 'Prices'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('entryPrice')} * <HelpTooltip tooltip={tradeFormTooltips.entryPrice} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.entryPrice} onChange={(e) => handleInputChange('entryPrice', e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('exitPrice')} <HelpTooltip tooltip={tradeFormTooltips.exitPrice} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.exitPrice} onChange={(e) => handleInputChange('exitPrice', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Stop Loss <HelpTooltip tooltip={tradeFormTooltips.stopLoss} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.stopLoss} onChange={(e) => handleInputChange('stopLoss', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Take Profit <HelpTooltip tooltip={tradeFormTooltips.takeProfit} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.takeProfit} onChange={(e) => handleInputChange('takeProfit', e.target.value)} />
          </div>
        </div>
        {/* Exit Method */}
        {(formData.stopLoss || formData.takeProfit) && (
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground mb-2 block">{language === 'fr' ? 'Méthode de sortie' : 'Exit Method'}</Label>
            <div className="flex gap-2">
              {(['manual', 'sl', 'tp'] as const).map(method => (
                <Button
                  key={method}
                  type="button"
                  size="sm"
                  variant={exitMethod === method ? 'default' : 'outline'}
                  onClick={() => setExitMethod(method)}
                >
                  {method === 'manual' ? (language === 'fr' ? 'Manuel' : 'Manual') : method.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lot Size & PnL */}
      <div className="glass-card p-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('lotSize')} * <HelpTooltip tooltip={tradeFormTooltips.lotSize} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.lotSize} onChange={(e) => handleInputChange('lotSize', e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              PnL ({getCurrencySymbol()}) <HelpTooltip tooltip={tradeFormTooltips.pnl} size="sm" />
            </Label>
            <Input type="number" step="any" value={formData.pnl} onChange={(e) => handleInputChange('pnl', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">
          {language === 'fr' ? 'Gestion du risque' : 'Risk Management'}
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">{language === 'fr' ? 'Capital' : 'Capital'}</Label>
            <Input type="number" step="any" value={formData.capital} onChange={(e) => handleCapitalChange(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{language === 'fr' ? 'Risque %' : 'Risk %'}</Label>
            <Input type="number" step="any" value={formData.risk} onChange={(e) => handleRiskPercentChange(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{language === 'fr' ? 'Risque $' : 'Risk $'}</Label>
            <Input type="number" step="any" value={formData.riskCash} onChange={(e) => handleRiskCashChange(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Setup & Timeframe */}
      <div className="glass-card p-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Setup</Label>
            <Select value={formData.setup} onValueChange={(v) => handleInputChange('setup', v)}>
              <SelectTrigger><SelectValue placeholder={language === 'fr' ? 'Choisir...' : 'Select...'} /></SelectTrigger>
              <SelectContent>
                {suggestedSetups.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={language === 'fr' ? 'Setup personnalisé...' : 'Custom setup...'} value={customSetup} onChange={(e) => setCustomSetup(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Timeframe</Label>
            <Select value={formData.timeframe} onValueChange={(v) => handleInputChange('timeframe', v)}>
              <SelectTrigger><SelectValue placeholder={language === 'fr' ? 'Choisir...' : 'Select...'} /></SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map(tf => (
                  <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={language === 'fr' ? 'TF personnalisé...' : 'Custom TF...'} value={customTimeframe} onChange={(e) => setCustomTimeframe(e.target.value)} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Emotions */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">{t('emotions')}</Label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(emotion => (
            <Badge
              key={emotion.value}
              variant={formData.emotion === emotion.value ? 'default' : 'outline'}
              className={cn("cursor-pointer transition-all", formData.emotion === emotion.value && "bg-primary text-primary-foreground")}
              onClick={() => handleInputChange('emotion', formData.emotion === emotion.value ? '' : emotion.value)}
            >
              {emotion.emoji} {language === 'fr' ? emotion.labelFr : emotion.labelEn}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <Badge
              key={tag.value}
              variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
              className={cn("cursor-pointer transition-all text-xs", selectedTags.includes(tag.value) && "bg-primary text-primary-foreground")}
              onClick={() => toggleTag(tag.value)}
            >
              {language === 'fr' ? tag.labelFr : tag.labelEn}
            </Badge>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">{t('notes')}</Label>
        <Textarea
          placeholder={language === 'fr' ? 'Notes sur ce trade...' : 'Trade notes...'}
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Media */}
      <div className="glass-card p-4 animate-fade-in">
        <Label className="text-foreground font-medium mb-3 block">
          {language === 'fr' ? 'Médias' : 'Media'}
        </Label>
        <TradeMediaUploader
          mediaItems={mediaItems}
          onMediaChange={setMediaItems}
          onError={handleMediaError}
        />
      </div>

      {/* Quality Score */}
      {(formData.setup || formData.stopLoss || selectedTags.length > 0) && (
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{language === 'fr' ? 'Score qualité' : 'Quality Score'}</span>
            <span className={cn(
              "font-display font-bold text-lg",
              calculateQualityScore() >= 70 ? "text-profit" : calculateQualityScore() >= 40 ? "text-primary" : "text-loss"
            )}>
              {calculateQualityScore()}/100
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-gradient-primary hover:opacity-90 font-display text-lg py-6"
        disabled={isSubmitting || (!formData.asset && !customAsset) || !formData.entryPrice || !formData.lotSize}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Save className="w-5 h-5 mr-2" />
        )}
        {isSubmitting ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') : t('saveTrade')}
      </Button>
    </form>
  );
};

export default AddTrade;