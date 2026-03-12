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
       includeAssets: ["favicon.ico", "assets/app-logo.png"],
       manifest: {
         name: "Smart Trade Kit",
         short_name: "STT",
         description: "Journal de trading professionnel avec analyses avancées",
         theme_color: "#0a1929",
         background_color: "#0a1929",
         display: "standalone",
         orientation: "portrait-primary",
         start_url: "/",
         icons: [
           {
             src: "/assets/app-logo.png",
             sizes: "192x192",
             type: "image/png",
             purpose: "any maskable",
           },
           {
             src: "/assets/app-logo.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "any maskable",
           },
         ],
       },
      workbox: {
          navigateFallbackDenylist: [/^\/~oauth/],
          globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff2,mp3,mp4}"],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
         runtimeCaching: [
           {
             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
             handler: "CacheFirst",
             options: {
               cacheName: "google-fonts-cache",
               expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
             },
           },
           {
             urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
             handler: "CacheFirst",
             options: {
               cacheName: "gstatic-fonts-cache",
               expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
             },
           },
           {
             // Cache Supabase REST API responses (trades, journal, settings, etc.)
             urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
             handler: "NetworkFirst",
             options: {
               cacheName: "supabase-api-cache",
               expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
               networkTimeoutSeconds: 5,
               cacheableResponse: { statuses: [0, 200] },
             },
           },
           {
             // Cache Supabase storage (user images, media)
             urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
             handler: "CacheFirst",
             options: {
               cacheName: "supabase-storage-cache",
               expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
               cacheableResponse: { statuses: [0, 200] },
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
