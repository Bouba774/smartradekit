import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from './useTrades';
import { DisciplineAnalysis } from './useDisciplineScore';
import { SessionAnalysis } from './useSessionAnalysis';
import { PerformanceHeatmap } from './usePerformanceHeatmap';
import { AdvancedStats } from './useAdvancedStats';

export interface ValidationCorrection {
  field: string;
  issue: string;
  suggestion: string;
}

export interface ValidationResult {
  isValid: boolean;
  corrections: ValidationCorrection[];
  insights: string[];
  aiSummary: string;
}

export const useAIValidation = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCalculations = useCallback(async (
    stats: AdvancedStats,
    discipline: DisciplineAnalysis,
    sessions: SessionAnalysis,
    heatmap: PerformanceHeatmap,
    sabotageScore: number,
    language: string = 'fr'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('validate-calculations', {
        body: {
          trades: {
            totalTrades: stats.totalTrades,
            winningTrades: stats.winningTrades,
            losingTrades: stats.losingTrades,
            pendingTrades: stats.pendingTrades,
            buyPositions: stats.buyPositions,
            sellPositions: stats.sellPositions,
            totalPnL: stats.netProfit,
            bestProfit: stats.bestProfit,
            worstLoss: stats.worstLoss,
            winrate: stats.winrate,
          },
          discipline: {
            slRespect: discipline.metrics.slRespect,
            tpRespect: discipline.metrics.tpRespect,
            planRespect: discipline.metrics.planRespect,
            riskManagement: discipline.metrics.riskManagement,
            noOvertrading: discipline.metrics.noOvertrading,
            overallScore: discipline.overallScore,
          },
          sessions: {
            sessions: sessions.sessions.map(s => ({
              session: s.session,
              trades: s.trades,
              winRate: s.winRate,
              pnl: s.pnl,
            })),
          },
          heatmap: {
            bestDay: heatmap.bestDay,
            worstDay: heatmap.worstDay,
            bestHour: heatmap.bestHour,
            worstHour: heatmap.worstHour,
          },
          sabotageScore,
          language,
        },
      });

      if (fnError) throw fnError;

      setValidationResult(data as ValidationResult);
      return data as ValidationResult;
    } catch (err) {
      console.error('Validation error:', err);
      setError(err instanceof Error ? err.message : 'Validation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    validationResult,
    isLoading,
    error,
    validateCalculations,
  };
};
