import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface HelpButtonProps {
  className?: string;
  variant?: 'floating' | 'inline';
}

export const HelpButton = ({ className = '', variant = 'floating' }: HelpButtonProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    navigate('/aide');
  };

  if (variant === 'inline') {
    return (
      <Button
        onClick={handleClick}
        className={`bg-profit hover:bg-profit/90 text-profit-foreground ${className}`}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        {t('help') || 'Aide'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className={`fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-profit hover:bg-profit/90 text-profit-foreground shadow-profit transition-all hover:scale-110 ${className}`}
      title={t('help') || 'Aide'}
    >
      <HelpCircle className="h-6 w-6" />
    </Button>
  );
};

export default HelpButton;
