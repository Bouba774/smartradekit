import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c083a032f07147138f072f3c0dc36e56',
  appName: 'Smart Trade Kit',
  webDir: 'dist',
  server: {
    url: 'https://c083a032-f071-4713-8f07-2f3c0dc36e56.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a1929',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1929',
      showSpinner: false,
      launchAutoHide: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1929',
    },
  },
};

export default config;
