import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminJournal } from '@/hooks/useAdminJournal';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  BookOpen,
  CheckCircle2,
  Target,
  Lightbulb,
  AlertTriangle,
  Award,
  Star,
  Loader2,
  AlertCircle,
  CalendarIcon,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const AdminJournal: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedUser } = useAdmin();
  const { entries, isLoading } = useAdminJournal();
  const locale = language === 'fr' ? fr : enUS;

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">
          {language === 'fr' ? 'Sélectionnez un utilisateur pour voir son journal' : 'Select a user to view their journal'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getEntryByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(entry => entry.entry_date === dateStr);
  };

  const selectedEntry = getEntryByDate(selectedDate);
  const datesWithEntries = entries.map(e => new Date(e.entry_date));

  // Parse notes JSON
  let mistakes = '';
  let strengths = '';
  if (selectedEntry?.notes) {
    try {
      const notesData = JSON.parse(selectedEntry.notes);
      mistakes = notesData.mistakes || '';
      strengths = notesData.strengths || '';
    } catch {
      // Ignore parse errors
    }
  }

  const completedItems = selectedEntry?.checklist?.filter((item: ChecklistItem) => item.checked).length || 0;
  const totalItems = selectedEntry?.checklist?.length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Journal de Trading' : 'Trading Journal'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? `Journal de ${selectedUser.nickname}` : `${selectedUser.nickname}'s journal`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{entries.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Entrées totales' : 'Total entries'}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-primary">{entries.filter(e => e.rating && e.rating >= 4).length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Bonnes journées' : 'Good days'}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-loss">{entries.filter(e => e.rating && e.rating <= 2).length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Journées difficiles' : 'Difficult days'}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-profit">
              {entries.length > 0 ? (entries.reduce((sum, e) => sum + (e.rating || 0), 0) / entries.length).toFixed(1) : 0}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Note moyenne' : 'Average rating'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {language === 'fr' ? 'Calendrier' : 'Calendar'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={locale}
              className="rounded-lg border border-border mx-auto"
              modifiers={{
                hasEntry: datesWithEntries,
              }}
              modifiersStyles={{
                hasEntry: {
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  fontWeight: 'bold',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Entry Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEntry ? (
                <div className="space-y-6">
                  {/* Rating */}
                  {selectedEntry.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Évaluation:' : 'Rating:'}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-5 h-5",
                              star <= selectedEntry.rating! ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  {selectedEntry.checklist && selectedEntry.checklist.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            {language === 'fr' ? 'Check-list' : 'Checklist'}
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          completionPercentage === 100 ? "text-profit" : "text-muted-foreground"
                        )}>
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedEntry.checklist.map((item: ChecklistItem) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg text-sm",
                              item.checked ? "bg-profit/10 text-profit" : "bg-secondary/30 text-muted-foreground"
                            )}
                          >
                            <CheckCircle2 className={cn("w-4 h-4", item.checked ? "text-profit" : "text-muted-foreground")} />
                            <span className={item.checked ? "line-through" : ""}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objectives */}
                  {selectedEntry.daily_objective && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="font-medium">
                          {language === 'fr' ? 'Objectifs' : 'Objectives'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg">
                        {selectedEntry.daily_objective}
                      </p>
                    </div>
                  )}

                  {/* Lessons */}
                  {selectedEntry.lessons && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-profit" />
                        <span className="font-medium">
                          {language === 'fr' ? 'Leçons apprises' : 'Lessons learned'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-profit/10 p-3 rounded-lg">
                        {selectedEntry.lessons}
                      </p>
                    </div>
                  )}

                  {/* Mistakes */}
                  {mistakes && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-loss" />
                        <span className="font-medium">
                          {language === 'fr' ? 'Erreurs' : 'Mistakes'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-loss/10 p-3 rounded-lg">
                        {mistakes}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {strengths && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-profit" />
                        <span className="font-medium">
                          {language === 'fr' ? 'Points forts' : 'Strengths'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-profit/10 p-3 rounded-lg">
                        {strengths}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'fr' ? 'Aucune entrée pour cette date' : 'No entry for this date'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJournal;
