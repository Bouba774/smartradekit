 import { defineConfig, loadEnv } from "vite";
 import react from "@vitejs/plugin-react-swc";
 import path from "path";
 import { componentTagger } from "lovable-tagger";
 import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://trkhpxxylnjxasigcxqj.supabase.co";
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2hweHh5bG5qeGFzaWdjeHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTczODIsImV4cCI6MjA4NDEzMzM4Mn0.U_3wCHaVh0uVShpirk_FDlreDDmYJ-MCikG_qFT1ts4";

  return ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
  },
  // Keep console logs in production for Android WebView diagnostics
  esbuild: {
    drop: mode === 'production' ? ['debugger'] : [],
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
