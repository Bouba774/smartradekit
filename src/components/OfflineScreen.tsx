import { useState, useEffect, useCallback } from "react";
import { WifiOff, RefreshCw, CheckCircle, Database, History, Calculator, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  en: {
    title: "You're Offline",
    subtitle: "No internet connection detected",
    retry: "Try Again",
    retrying: "Checking...",
    availableOffline: "Available Offline",
    features: {
      viewTrades: "View your cached trades",
      history: "Browse trade history",
      calculator: "Use the calculator",
      journal: "Read journal entries",
    },
    notAvailable: "Not Available Offline",
    notAvailableList: {
      sync: "Syncing new trades",
      ai: "AI Assistant",
      updates: "Real-time updates",
    },
    tip: "Your data will sync automatically when you're back online.",
  },
  fr: {
    title: "Vous êtes hors ligne",
    subtitle: "Aucune connexion internet détectée",
    retry: "Réessayer",
    retrying: "Vérification...",
    availableOffline: "Disponible hors ligne",
    features: {
      viewTrades: "Consulter vos trades en cache",
      history: "Parcourir l'historique",
      calculator: "Utiliser la calculatrice",
      journal: "Lire les entrées du journal",
    },
    notAvailable: "Non disponible hors ligne",
    notAvailableList: {
      sync: "Synchronisation des nouveaux trades",
      ai: "Assistant IA",
      updates: "Mises à jour en temps réel",
    },
    tip: "Vos données se synchroniseront automatiquement une fois reconnecté.",
  },
  es: {
    title: "Estás sin conexión",
    subtitle: "No se detecta conexión a internet",
    retry: "Reintentar",
    retrying: "Verificando...",
    availableOffline: "Disponible sin conexión",
    features: {
      viewTrades: "Ver trades en caché",
      history: "Navegar historial",
      calculator: "Usar calculadora",
      journal: "Leer entradas del diario",
    },
    notAvailable: "No disponible sin conexión",
    notAvailableList: {
      sync: "Sincronización de nuevos trades",
      ai: "Asistente IA",
      updates: "Actualizaciones en tiempo real",
    },
    tip: "Tus datos se sincronizarán automáticamente cuando vuelvas a estar en línea.",
  },
  pt: {
    title: "Você está offline",
    subtitle: "Nenhuma conexão com a internet detectada",
    retry: "Tentar novamente",
    retrying: "Verificando...",
    availableOffline: "Disponível offline",
    features: {
      viewTrades: "Ver trades em cache",
      history: "Navegar histórico",
      calculator: "Usar calculadora",
      journal: "Ler entradas do diário",
    },
    notAvailable: "Não disponível offline",
    notAvailableList: {
      sync: "Sincronização de novos trades",
      ai: "Assistente IA",
      updates: "Atualizações em tempo real",
    },
    tip: "Seus dados serão sincronizados automaticamente quando você voltar a ficar online.",
  },
  ar: {
    title: "أنت غير متصل",
    subtitle: "لم يتم اكتشاف اتصال بالإنترنت",
    retry: "حاول مرة أخرى",
    retrying: "جارٍ التحقق...",
    availableOffline: "متاح بدون اتصال",
    features: {
      viewTrades: "عرض الصفقات المخزنة",
      history: "تصفح السجل",
      calculator: "استخدام الآلة الحاسبة",
      journal: "قراءة إدخالات اليومية",
    },
    notAvailable: "غير متاح بدون اتصال",
    notAvailableList: {
      sync: "مزامنة الصفقات الجديدة",
      ai: "المساعد الذكي",
      updates: "التحديثات الفورية",
    },
    tip: "ستتم مزامنة بياناتك تلقائيًا عند الاتصال.",
  },
  de: {
    title: "Sie sind offline",
    subtitle: "Keine Internetverbindung erkannt",
    retry: "Erneut versuchen",
    retrying: "Überprüfung...",
    availableOffline: "Offline verfügbar",
    features: {
      viewTrades: "Gecachte Trades anzeigen",
      history: "Verlauf durchsuchen",
      calculator: "Rechner verwenden",
      journal: "Tagebucheinträge lesen",
    },
    notAvailable: "Offline nicht verfügbar",
    notAvailableList: {
      sync: "Neue Trades synchronisieren",
      ai: "KI-Assistent",
      updates: "Echtzeit-Updates",
    },
    tip: "Ihre Daten werden automatisch synchronisiert, sobald Sie wieder online sind.",
  },
  tr: {
    title: "Çevrimdışısınız",
    subtitle: "İnternet bağlantısı algılanmadı",
    retry: "Tekrar Dene",
    retrying: "Kontrol ediliyor...",
    availableOffline: "Çevrimdışı Kullanılabilir",
    features: {
      viewTrades: "Önbellekteki işlemleri görüntüle",
      history: "Geçmişe göz at",
      calculator: "Hesap makinesini kullan",
      journal: "Günlük girişlerini oku",
    },
    notAvailable: "Çevrimdışı Kullanılamaz",
    notAvailableList: {
      sync: "Yeni işlemleri senkronize etme",
      ai: "AI Asistanı",
      updates: "Gerçek zamanlı güncellemeler",
    },
    tip: "Tekrar çevrimiçi olduğunuzda verileriniz otomatik olarak senkronize edilecek.",
  },
  it: {
    title: "Sei offline",
    subtitle: "Nessuna connessione internet rilevata",
    retry: "Riprova",
    retrying: "Verifica...",
    availableOffline: "Disponibile offline",
    features: {
      viewTrades: "Visualizza trade in cache",
      history: "Sfoglia cronologia",
      calculator: "Usa calcolatrice",
      journal: "Leggi voci del diario",
    },
    notAvailable: "Non disponibile offline",
    notAvailableList: {
      sync: "Sincronizzazione nuovi trade",
      ai: "Assistente IA",
      updates: "Aggiornamenti in tempo reale",
    },
    tip: "I tuoi dati si sincronizzeranno automaticamente quando tornerai online.",
  },
};

export const OfflineScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a small resource to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      // If successful, reload the page
      window.location.reload();
    } catch {
      // Still offline
      setIsRetrying(false);
    }
  }, []);

  // Auto-retry when online event fires
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const availableFeatures = [
    { icon: Database, label: t.features.viewTrades },
    { icon: History, label: t.features.history },
    { icon: Calculator, label: t.features.calculator },
    { icon: BookOpen, label: t.features.journal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Retry Button */}
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          size="lg"
          className="w-full max-w-xs"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? t.retrying : t.retry}
        </Button>

        {/* Available Offline */}
        <Card className="text-left">
          <CardContent className="pt-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t.availableOffline}
            </h3>
            <ul className="space-y-2">
              {availableFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="h-4 w-4" />
                  {feature.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Not Available */}
        <Card className="text-left border-destructive/20">
          <CardContent className="pt-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <WifiOff className="h-4 w-4 text-destructive" />
              {t.notAvailable}
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t.notAvailableList.sync}</li>
              <li>• {t.notAvailableList.ai}</li>
              <li>• {t.notAvailableList.updates}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Tip */}
        <p className="text-xs text-muted-foreground">{t.tip}</p>
      </div>
    </div>
  );
};

export default OfflineScreen;
