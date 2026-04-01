import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';
import type { PeriodType } from '@/hooks/usePeriodFilter';

interface PeriodFilterProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  customStart?: Date;
  customEnd?: Date;
  setCustomStart: (d: Date | undefined) => void;
  setCustomEnd: (d: Date | undefined) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  period, setPeriod, customStart, customEnd, setCustomStart, setCustomEnd,
}) => {
  const { language } = useLanguage();
  const locale = language === 'fr' ? frLocale : enUS;

  const periods: { key: PeriodType; label: string }[] = [
    { key: 'day', label: language === 'fr' ? 'Jour' : 'Day' },
    { key: 'week', label: language === 'fr' ? 'Semaine' : 'Week' },
    { key: 'month', label: language === 'fr' ? 'Mois' : 'Month' },
    { key: 'all', label: language === 'fr' ? 'Tout' : 'All' },
    { key: 'custom', label: language === 'fr' ? 'Personnalisé' : 'Custom' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
        {periods.map(p => (
          <Button
            key={p.key}
            variant={period === p.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPeriod(p.key)}
            className={cn(
              'text-xs h-7 px-2.5',
              period === p.key && 'bg-primary text-primary-foreground'
            )}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                <CalendarIcon className="w-3 h-3" />
                {customStart ? format(customStart, 'dd/MM/yy', { locale }) : (language === 'fr' ? 'Début' : 'Start')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={setCustomStart}
                locale={locale}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-xs">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                <CalendarIcon className="w-3 h-3" />
                {customEnd ? format(customEnd, 'dd/MM/yy', { locale }) : (language === 'fr' ? 'Fin' : 'End')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={setCustomEnd}
                locale={locale}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
