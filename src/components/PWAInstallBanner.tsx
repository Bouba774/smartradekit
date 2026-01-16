import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const translations = {
  en: {
    title: "Install the app",
    description: "Get quick access from your home screen",
    install: "Install",
    learnMore: "Learn more",
  },
  fr: {
    title: "Installer l'application",
    description: "Accès rapide depuis l'écran d'accueil",
    install: "Installer",
    learnMore: "En savoir plus",
  },
  es: {
    title: "Instalar la app",
    description: "Acceso rápido desde la pantalla de inicio",
    install: "Instalar",
    learnMore: "Más info",
  },
  pt: {
    title: "Instalar o app",
    description: "Acesso rápido na tela inicial",
    install: "Instalar",
    learnMore: "Saiba mais",
  },
  ar: {
    title: "تثبيت التطبيق",
    description: "وصول سريع من الشاشة الرئيسية",
    install: "تثبيت",
    learnMore: "معرفة المزيد",
  },
  de: {
    title: "App installieren",
    description: "Schneller Zugang vom Startbildschirm",
    install: "Installieren",
    learnMore: "Mehr erfahren",
  },
  tr: {
    title: "Uygulamayı yükle",
    description: "Ana ekrandan hızlı erişim",
    install: "Yükle",
    learnMore: "Daha fazla",
  },
  it: {
    title: "Installa l'app",
    description: "Accesso rapido dalla schermata Home",
    install: "Installa",
    learnMore: "Scopri di più",
  },
};

export const PWAInstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, isStandalone, isIOS, promptInstall } = usePWAInstall();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = translations[language as keyof typeof translations] || translations.en;

  // Check if banner was dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  const handleInstall = async () => {
    if (isIOS) {
      navigate("/install");
    } else {
      const installed = await promptInstall();
      if (!installed) {
        navigate("/install");
      }
    }
  };

  const handleLearnMore = () => {
    navigate("/install");
  };

  // Don't show if already installed, dismissed, or not installable (for non-iOS)
  if (isInstalled || isStandalone || dismissed) {
    return null;
  }

  // Show for iOS (manual install) or when installable (Android/Desktop)
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card border border-primary/30 rounded-xl p-4 shadow-lg shadow-primary/10">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">{t.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {t.install}
          </Button>
          <Button
            onClick={handleLearnMore}
            variant="outline"
            size="sm"
          >
            {t.learnMore}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
