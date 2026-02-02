import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calculator as CalcIcon, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Calculator Page - Temporarily Disabled
 * 
 * All calculation logic has been removed for a complete rebuild.
 * This page serves as a placeholder maintaining navigation structure.
 */
const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  return (
    <div className="py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {isFr ? 'Calculatrice' : 'Calculator'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isFr 
              ? 'Calcul de taille de position' 
              : 'Position size calculation'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <CalcIcon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Placeholder Card */}
      <Card className="glass-card">
        <CardContent className="py-16 text-center">
          <Construction className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isFr ? 'Calculatrice en reconstruction' : 'Calculator under reconstruction'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isFr 
              ? 'La calculatrice est temporairement désactivée pour une refonte complète. Une nouvelle version fiable et précise sera bientôt disponible.'
              : 'The calculator is temporarily disabled for a complete rebuild. A new reliable and accurate version will be available soon.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;
