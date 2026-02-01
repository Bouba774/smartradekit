import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Smartphone, Share, Plus, CheckCircle2, Wifi, WifiOff, Zap, Shield } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const translations = {
  en: {
    title: "Install Smart Trade Tracker",
    subtitle: "Get the full app experience on your device",
    installButton: "Install App",
    installedTitle: "App Installed!",
    installedDesc: "Smart Trade Tracker is already installed on your device.",
    openApp: "Open App",
    iosTitle: "Install on iPhone/iPad",
    iosStep1: "Tap the Share button",
    iosStep2: "Scroll down and tap 'Add to Home Screen'",
    iosStep3: "Tap 'Add' to confirm",
    androidTitle: "Install on Android",
    androidDesc: "Tap the button below to install the app",
    desktopTitle: "Install on Desktop",
    desktopDesc: "Click the button below to install the app",
    benefits: "App Benefits",
    benefit1: "Works offline",
    benefit2: "Fast loading",
    benefit3: "Home screen access",
    benefit4: "Secure & private",
    notSupported: "Installation not supported",
    notSupportedDesc: "Your browser doesn't support app installation. Try using Chrome, Safari, or Edge.",
    goToDashboard: "Go to Dashboard",
  },
  fr: {
    title: "Installer Smart Trade Tracker",
    subtitle: "Profitez de l'expérience complète sur votre appareil",
    installButton: "Installer l'application",
    installedTitle: "Application installée !",
    installedDesc: "Smart Trade Tracker est déjà installé sur votre appareil.",
    openApp: "Ouvrir l'application",
    iosTitle: "Installer sur iPhone/iPad",
    iosStep1: "Appuyez sur le bouton Partager",
    iosStep2: "Faites défiler et appuyez sur 'Sur l'écran d'accueil'",
    iosStep3: "Appuyez sur 'Ajouter' pour confirmer",
    androidTitle: "Installer sur Android",
    androidDesc: "Appuyez sur le bouton ci-dessous pour installer l'application",
    desktopTitle: "Installer sur ordinateur",
    desktopDesc: "Cliquez sur le bouton ci-dessous pour installer l'application",
    benefits: "Avantages de l'application",
    benefit1: "Fonctionne hors ligne",
    benefit2: "Chargement rapide",
    benefit3: "Accès depuis l'écran d'accueil",
    benefit4: "Sécurisé et privé",
    notSupported: "Installation non supportée",
    notSupportedDesc: "Votre navigateur ne supporte pas l'installation. Essayez Chrome, Safari ou Edge.",
    goToDashboard: "Aller au Dashboard",
  },
  es: {
    title: "Instalar Smart Trade Tracker",
    subtitle: "Obtén la experiencia completa en tu dispositivo",
    installButton: "Instalar aplicación",
    installedTitle: "¡Aplicación instalada!",
    installedDesc: "Smart Trade Tracker ya está instalado en tu dispositivo.",
    openApp: "Abrir aplicación",
    iosTitle: "Instalar en iPhone/iPad",
    iosStep1: "Toca el botón Compartir",
    iosStep2: "Desplázate y toca 'Añadir a pantalla de inicio'",
    iosStep3: "Toca 'Añadir' para confirmar",
    androidTitle: "Instalar en Android",
    androidDesc: "Toca el botón de abajo para instalar la aplicación",
    desktopTitle: "Instalar en escritorio",
    desktopDesc: "Haz clic en el botón de abajo para instalar la aplicación",
    benefits: "Beneficios de la app",
    benefit1: "Funciona sin conexión",
    benefit2: "Carga rápida",
    benefit3: "Acceso desde pantalla de inicio",
    benefit4: "Seguro y privado",
    notSupported: "Instalación no soportada",
    notSupportedDesc: "Tu navegador no soporta la instalación. Prueba Chrome, Safari o Edge.",
    goToDashboard: "Ir al Dashboard",
  },
  pt: {
    title: "Instalar Smart Trade Tracker",
    subtitle: "Tenha a experiência completa no seu dispositivo",
    installButton: "Instalar aplicativo",
    installedTitle: "Aplicativo instalado!",
    installedDesc: "Smart Trade Tracker já está instalado no seu dispositivo.",
    openApp: "Abrir aplicativo",
    iosTitle: "Instalar no iPhone/iPad",
    iosStep1: "Toque no botão Compartilhar",
    iosStep2: "Role e toque em 'Adicionar à Tela Inicial'",
    iosStep3: "Toque em 'Adicionar' para confirmar",
    androidTitle: "Instalar no Android",
    androidDesc: "Toque no botão abaixo para instalar o aplicativo",
    desktopTitle: "Instalar no desktop",
    desktopDesc: "Clique no botão abaixo para instalar o aplicativo",
    benefits: "Benefícios do app",
    benefit1: "Funciona offline",
    benefit2: "Carregamento rápido",
    benefit3: "Acesso pela tela inicial",
    benefit4: "Seguro e privado",
    notSupported: "Instalação não suportada",
    notSupportedDesc: "Seu navegador não suporta instalação. Tente Chrome, Safari ou Edge.",
    goToDashboard: "Ir para o Dashboard",
  },
  ar: {
    title: "تثبيت Smart Trade Tracker",
    subtitle: "احصل على التجربة الكاملة على جهازك",
    installButton: "تثبيت التطبيق",
    installedTitle: "تم تثبيت التطبيق!",
    installedDesc: "Smart Trade Tracker مثبت بالفعل على جهازك.",
    openApp: "فتح التطبيق",
    iosTitle: "التثبيت على iPhone/iPad",
    iosStep1: "اضغط على زر المشاركة",
    iosStep2: "قم بالتمرير واضغط على 'إضافة إلى الشاشة الرئيسية'",
    iosStep3: "اضغط على 'إضافة' للتأكيد",
    androidTitle: "التثبيت على Android",
    androidDesc: "اضغط على الزر أدناه لتثبيت التطبيق",
    desktopTitle: "التثبيت على سطح المكتب",
    desktopDesc: "انقر على الزر أدناه لتثبيت التطبيق",
    benefits: "مميزات التطبيق",
    benefit1: "يعمل بدون اتصال",
    benefit2: "تحميل سريع",
    benefit3: "الوصول من الشاشة الرئيسية",
    benefit4: "آمن وخاص",
    notSupported: "التثبيت غير مدعوم",
    notSupportedDesc: "متصفحك لا يدعم التثبيت. جرب Chrome أو Safari أو Edge.",
    goToDashboard: "الذهاب إلى لوحة التحكم",
  },
  de: {
    title: "Smart Trade Tracker installieren",
    subtitle: "Holen Sie sich das volle App-Erlebnis auf Ihrem Gerät",
    installButton: "App installieren",
    installedTitle: "App installiert!",
    installedDesc: "Smart Trade Tracker ist bereits auf Ihrem Gerät installiert.",
    openApp: "App öffnen",
    iosTitle: "Auf iPhone/iPad installieren",
    iosStep1: "Tippen Sie auf die Teilen-Taste",
    iosStep2: "Scrollen Sie und tippen Sie auf 'Zum Home-Bildschirm'",
    iosStep3: "Tippen Sie auf 'Hinzufügen' zur Bestätigung",
    androidTitle: "Auf Android installieren",
    androidDesc: "Tippen Sie auf die Schaltfläche unten, um die App zu installieren",
    desktopTitle: "Auf Desktop installieren",
    desktopDesc: "Klicken Sie auf die Schaltfläche unten, um die App zu installieren",
    benefits: "App-Vorteile",
    benefit1: "Funktioniert offline",
    benefit2: "Schnelles Laden",
    benefit3: "Home-Bildschirm-Zugang",
    benefit4: "Sicher und privat",
    notSupported: "Installation nicht unterstützt",
    notSupportedDesc: "Ihr Browser unterstützt die Installation nicht. Versuchen Sie Chrome, Safari oder Edge.",
    goToDashboard: "Zum Dashboard",
  },
  tr: {
    title: "Smart Trade Tracker Yükle",
    subtitle: "Cihazınızda tam uygulama deneyimini yaşayın",
    installButton: "Uygulamayı Yükle",
    installedTitle: "Uygulama Yüklendi!",
    installedDesc: "Smart Trade Tracker cihazınıza zaten yüklü.",
    openApp: "Uygulamayı Aç",
    iosTitle: "iPhone/iPad'e Yükle",
    iosStep1: "Paylaş düğmesine dokunun",
    iosStep2: "Aşağı kaydırın ve 'Ana Ekrana Ekle'ye dokunun",
    iosStep3: "Onaylamak için 'Ekle'ye dokunun",
    androidTitle: "Android'e Yükle",
    androidDesc: "Uygulamayı yüklemek için aşağıdaki düğmeye dokunun",
    desktopTitle: "Masaüstüne Yükle",
    desktopDesc: "Uygulamayı yüklemek için aşağıdaki düğmeye tıklayın",
    benefits: "Uygulama Avantajları",
    benefit1: "Çevrimdışı çalışır",
    benefit2: "Hızlı yükleme",
    benefit3: "Ana ekran erişimi",
    benefit4: "Güvenli ve özel",
    notSupported: "Yükleme desteklenmiyor",
    notSupportedDesc: "Tarayıcınız yüklemeyi desteklemiyor. Chrome, Safari veya Edge deneyin.",
    goToDashboard: "Dashboard'a Git",
  },
  it: {
    title: "Installa Smart Trade Tracker",
    subtitle: "Ottieni l'esperienza completa dell'app sul tuo dispositivo",
    installButton: "Installa App",
    installedTitle: "App Installata!",
    installedDesc: "Smart Trade Tracker è già installato sul tuo dispositivo.",
    openApp: "Apri App",
    iosTitle: "Installa su iPhone/iPad",
    iosStep1: "Tocca il pulsante Condividi",
    iosStep2: "Scorri e tocca 'Aggiungi alla schermata Home'",
    iosStep3: "Tocca 'Aggiungi' per confermare",
    androidTitle: "Installa su Android",
    androidDesc: "Tocca il pulsante qui sotto per installare l'app",
    desktopTitle: "Installa su Desktop",
    desktopDesc: "Clicca il pulsante qui sotto per installare l'app",
    benefits: "Vantaggi dell'App",
    benefit1: "Funziona offline",
    benefit2: "Caricamento veloce",
    benefit3: "Accesso dalla schermata Home",
    benefit4: "Sicuro e privato",
    notSupported: "Installazione non supportata",
    notSupportedDesc: "Il tuo browser non supporta l'installazione. Prova Chrome, Safari o Edge.",
    goToDashboard: "Vai alla Dashboard",
  },
};

const Install = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isInstallable, isInstalled, isIOS, isAndroid, isStandalone, promptInstall } = usePWAInstall();

  const t = translations[language as keyof typeof translations] || translations.en;

  // If already installed and running standalone, redirect to dashboard
  useEffect(() => {
    if (isStandalone) {
      // Don't redirect immediately, show success message first
    }
  }, [isStandalone]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      // Installation accepted
    }
  };

  const benefits = [
    { icon: WifiOff, text: t.benefit1 },
    { icon: Zap, text: t.benefit2 },
    { icon: Smartphone, text: t.benefit3 },
    { icon: Shield, text: t.benefit4 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src={appLogo}
            alt="Smart Trade Tracker"
            className="w-24 h-24 mx-auto rounded-2xl shadow-lg shadow-primary/20 mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>

        {/* Already Installed */}
        {isInstalled || isStandalone ? (
          <Card className="border-profit/50 bg-profit/10">
            <CardHeader className="text-center pb-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-profit mb-2" />
              <CardTitle className="text-profit">{t.installedTitle}</CardTitle>
              <CardDescription>{t.installedDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
                size="lg"
              >
                {t.goToDashboard}
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          /* iOS Instructions */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {t.iosTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">1. {t.iosStep1}</p>
                  <p className="text-sm text-muted-foreground">
                    (en bas de Safari)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <p className="font-medium">2. {t.iosStep2}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="font-medium">3. {t.iosStep3}</p>
              </div>
            </CardContent>
          </Card>
        ) : isInstallable ? (
          /* Android / Desktop Install Button */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {isAndroid ? t.androidTitle : t.desktopTitle}
              </CardTitle>
              <CardDescription>
                {isAndroid ? t.androidDesc : t.desktopDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInstall}
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {t.installButton}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Not Supported */
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="text-yellow-600">{t.notSupported}</CardTitle>
              <CardDescription>{t.notSupportedDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                {t.goToDashboard}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.benefits}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                >
                  <benefit.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        {!isInstalled && !isStandalone && (
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full"
          >
            {t.goToDashboard}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Install;
