import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTrades } from '@/hooks/useAdminTrades';
import { useCurrency } from '@/hooks/useCurrency';
import AdminPagePlaceholder from '@/components/admin/AdminPagePlaceholder';
import { ConfidentialValue } from '@/components/ConfidentialValue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  History,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  X,
  ArrowUpDown,
} from 'lucide-react';

type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
type SortField = 'date' | 'pnl' | 'asset';
type SortOrder = 'asc' | 'desc';

const AdminHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedUser } = useAdmin();
  const { trades, isLoading } = useAdminTrades();
  const { formatAmount } = useCurrency();
  const locale = language === 'fr' ? fr : enUS;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [setupFilter, setSetupFilter] = useState<string>('all');
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<Period>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

  if (!selectedUser) {
    return <AdminPagePlaceholder pageName="historique" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get unique values for filters
  const uniqueAssets = [...new Set(trades.map(t => t.asset))].sort();
  const uniqueSetups = [...new Set(trades.map(t => t.setup).filter(Boolean))].sort();
  const uniqueEmotions = [...new Set(trades.map(t => t.emotions).filter(Boolean))].sort();

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let filtered = [...trades];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trade =>
        trade.asset.toLowerCase().includes(query) ||
        trade.notes?.toLowerCase().includes(query) ||
        trade.setup?.toLowerCase().includes(query)
      );
    }

    // Direction filter
    if (directionFilter !== 'all') {
      filtered = filtered.filter(trade => trade.direction === directionFilter);
    }

    // Result filter
    if (resultFilter !== 'all') {
      filtered = filtered.filter(trade => trade.result === resultFilter);
    }

    // Asset filter
    if (assetFilter !== 'all') {
      filtered = filtered.filter(trade => trade.asset === assetFilter);
    }

    // Setup filter
    if (setupFilter !== 'all') {
      filtered = filtered.filter(trade => trade.setup === setupFilter);
    }

    // Emotion filter
    if (emotionFilter !== 'all') {
      filtered = filtered.filter(trade => trade.emotions === emotionFilter);
    }

    // Period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      let start: Date, end: Date;

      switch (periodFilter) {
        case 'today':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'week':
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'month':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'year':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          start = new Date(0);
          end = now;
      }

      filtered = filtered.filter(trade => {
        const tradeDate = parseISO(trade.trade_date);
        return isWithinInterval(tradeDate, { start, end });
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime();
          break;
        case 'pnl':
          comparison = (a.profit_loss || 0) - (b.profit_loss || 0);
          break;
        case 'asset':
          comparison = a.asset.localeCompare(b.asset);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [trades, searchQuery, directionFilter, resultFilter, assetFilter, setupFilter, emotionFilter, periodFilter, sortField, sortOrder]);

  // Summary stats
  const totalGains = filteredTrades.filter(t => (t.profit_loss || 0) > 0).reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const totalLosses = Math.abs(filteredTrades.filter(t => (t.profit_loss || 0) < 0).reduce((sum, t) => sum + (t.profit_loss || 0), 0));
  const totalBreakeven = filteredTrades.filter(t => t.result === 'breakeven').length;

  const clearFilters = () => {
    setSearchQuery('');
    setDirectionFilter('all');
    setResultFilter('all');
    setAssetFilter('all');
    setSetupFilter('all');
    setEmotionFilter('all');
    setPeriodFilter('all');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleExpanded = (tradeId: string) => {
    setExpandedTrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tradeId)) {
        newSet.delete(tradeId);
      } else {
        newSet.add(tradeId);
      }
      return newSet;
    });
  };

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-orange-500" />
            <Badge variant="outline" className="border-orange-500/50 text-orange-500">
              {language === 'fr' ? 'Mode consultation' : 'View Mode'}
            </Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Historique de' : 'History of'} {selectedUser.nickname}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{selectedUser.email}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
          <History className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('totalGains')}</p>
          <p className="font-display text-xl font-bold text-profit">
            <ConfidentialValue>{formatAmount(totalGains, true)}</ConfidentialValue>
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('totalLosses')}</p>
          <p className="font-display text-xl font-bold text-loss">
            <ConfidentialValue>{formatAmount(totalLosses, true)}</ConfidentialValue>
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('breakeven')}</p>
          <p className="font-display text-xl font-bold text-muted-foreground">{totalBreakeven}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t('filters')}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            {language === 'fr' ? 'Effacer' : 'Clear'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as Period)}>
            <SelectTrigger>
              <SelectValue placeholder={t('period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="today">{language === 'fr' ? "Aujourd'hui" : 'Today'}</SelectItem>
              <SelectItem value="week">{t('week')}</SelectItem>
              <SelectItem value="month">{t('month')}</SelectItem>
              <SelectItem value="year">{language === 'fr' ? 'Année' : 'Year'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('direction')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('result')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="win">{t('win')}</SelectItem>
              <SelectItem value="loss">{t('loss')}</SelectItem>
              <SelectItem value="breakeven">{t('breakeven')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('asset')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {uniqueAssets.map(asset => (
                <SelectItem key={asset} value={asset}>{asset}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={setupFilter} onValueChange={setSetupFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('setup')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {uniqueSetups.map(setup => (
                <SelectItem key={setup} value={setup!}>{setup}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={emotionFilter} onValueChange={setEmotionFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('emotions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {uniqueEmotions.map(emotion => (
                <SelectItem key={emotion} value={emotion!}>{emotion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{language === 'fr' ? 'Trier par:' : 'Sort by:'}</span>
        {(['date', 'pnl', 'asset'] as SortField[]).map(field => (
          <Button
            key={field}
            variant={sortField === field ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort(field)}
            className="gap-1 text-xs"
          >
            {field === 'date' ? t('date') : field === 'pnl' ? 'PnL' : t('asset')}
            {sortField === field && (
              sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
            )}
          </Button>
        ))}
      </div>

      {/* Trades List */}
      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              {language === 'fr' ? 'Aucun trade trouvé' : 'No trades found'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          filteredTrades.map((trade) => {
            const isExpanded = expandedTrades.has(trade.id);
            const tradeDate = parseISO(trade.trade_date);

            return (
              <div
                key={trade.id}
                className="glass-card overflow-hidden animate-fade-in"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => toggleExpanded(trade.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        trade.direction === 'long' ? "bg-profit/20" : "bg-loss/20"
                      )}>
                        {trade.direction === 'long' ? (
                          <TrendingUp className="w-5 h-5 text-profit" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-loss" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-foreground">{trade.asset}</span>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            trade.result === 'win' && "border-profit/50 text-profit",
                            trade.result === 'loss' && "border-loss/50 text-loss",
                            trade.result === 'breakeven' && "border-muted-foreground/50"
                          )}>
                            {trade.result === 'win' ? 'WIN' : trade.result === 'loss' ? 'LOSS' : 'BE'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(tradeDate, 'PPP', { locale })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                          "font-display font-bold text-lg",
                          (trade.profit_loss || 0) >= 0 ? "text-profit" : "text-loss"
                        )}>
                          <ConfidentialValue>{formatAmount(trade.profit_loss || 0, true)}</ConfidentialValue>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trade.lot_size} lot{trade.lot_size !== 1 && 's'}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-secondary/10 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">{t('entryPrice')}</p>
                        <p className="font-medium text-foreground">{trade.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('exitPrice')}</p>
                        <p className="font-medium text-foreground">{trade.exit_price || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('stopLoss')}</p>
                        <p className="font-medium text-foreground">{trade.stop_loss || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('takeProfit')}</p>
                        <p className="font-medium text-foreground">{trade.take_profit || '-'}</p>
                      </div>
                    </div>

                    {(trade.setup || trade.emotions || trade.notes) && (
                      <div className="space-y-2 text-sm">
                        {trade.setup && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('setup')}</p>
                            <Badge variant="secondary">{trade.setup}</Badge>
                          </div>
                        )}
                        {trade.emotions && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('emotions')}</p>
                            <Badge variant="outline">{trade.emotions}</Badge>
                          </div>
                        )}
                        {trade.notes && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('notes')}</p>
                            <p className="text-foreground">{trade.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-muted-foreground">
        {filteredTrades.length} {language === 'fr' ? 'trade(s) trouvé(s)' : 'trade(s) found'}
      </div>
    </div>
  );
};

export default AdminHistory;
