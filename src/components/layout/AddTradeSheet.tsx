import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowRight } from 'lucide-react';

interface AddTradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTradeSheet: React.FC<AddTradeSheetProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleAddTrade = () => {
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    navigate('/add-trade');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "rounded-t-3xl pb-[env(safe-area-inset-bottom)]",
          "bg-background/95 backdrop-blur-xl",
          "border-t border-primary/20"
        )}
      >
        <SheetHeader className="pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-primary/10 border-2 border-primary"
            )}>
              <PlusCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <SheetTitle className="text-xl font-semibold">
            {t('addTrade')}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {t('registerNewTrade')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          <Button
            onClick={handleAddTrade}
            className={cn(
              "w-full h-14 text-base font-medium",
              "bg-primary hover:bg-primary/90",
              "shadow-lg shadow-primary/20"
            )}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {t('addTrade')}
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-12"
          >
            {t('cancel')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddTradeSheet;
