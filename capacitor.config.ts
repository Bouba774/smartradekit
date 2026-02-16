import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c083a032f07147138f072f3c0dc36e56',
  appName: 'Smart Trade Kit',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a1929',
    appendUserAgent: 'SmartTradeKit/Native',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1929',
      showSpinner: false,
      launchAutoHide: true,
      splashImmersive: true,
      splashFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1929',
    },
    Filesystem: {
      directory: 'Documents',
    },
  },
};

export default config;
