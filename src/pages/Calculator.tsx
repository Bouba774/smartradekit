import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calculator as CalcIcon, Construction } from 'lucide-react';

/**
 * Calculatrice de lot - Page temporairement vide
 * En attente de reconstruction complète avec un moteur de calcul fiable
 * 
 * Tout le code de calcul a été supprimé pour une reconstruction propre.
 */
const Calculator: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Calculatrice' : 'Calculator'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' 
              ? 'Calcul précis de la taille de position' 
              : 'Precise position size calculation'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <CalcIcon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Message temporaire */}
      <div className="glass-card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          {language === 'fr' 
            ? 'Calculatrice en reconstruction' 
            : 'Calculator under reconstruction'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'fr' 
            ? 'La calculatrice de lot est temporairement indisponible. Une nouvelle version plus fiable et précise sera bientôt disponible.'
            : 'The lot calculator is temporarily unavailable. A new, more reliable and accurate version will be available soon.'}
        </p>
      </div>
    </div>
  );
};

export default Calculator;
