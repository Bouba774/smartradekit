import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Drop console.log/warn/error in production builds for security
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.jpg",
        "favicon.ico",
        "assets/app-logo.jpg"
      ],
      manifest: false, // We use our own manifest.json in public folder
      devOptions: {
        enabled: true, // Enable SW in development for testing
        type: "module",
      },
      workbox: {
        // Avoid build failures on larger assets and keep precache focused on the app shell
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        globPatterns: ["**/*.{js,css,html,ico,jpg,jpeg,png,svg,woff,woff2,json}"],
        // Clean up old caches on new service worker activation
        cleanupOutdatedCaches: true,
        // Take control of all clients immediately when new SW activates
        clientsClaim: true,
        skipWaiting: true,
        // Navigation fallback for SPA
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
        // Cache static assets aggressively
        runtimeCaching: [
          // Cache the app shell and static assets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          // Cache media (cached after first load)
          {
            urlPattern: /\.(?:mp4)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "video-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:mp3)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Cache API calls with network-first strategy
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache AI gateway calls
          {
            urlPattern: /^https:\/\/ai\.gateway\.lovable\.dev\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "ai-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 30,
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
