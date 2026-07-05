import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(), // wajib ada, dan harus SEBELUM react()
    react(),
    tailwindcss(),
    nitro(), // karena "server.ts" custom kamu jalan di atas Nitro
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Izinkan akses lewat tunnel ngrok pas testing webhook lokal.
    // ".ngrok-free.dev" & ".ngrok-free.app" nge-cover semua subdomain acak
    // yang ngrok generate tiap kali restart (bukan cuma subdomain sekarang).
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app"],
  },
  environments: {
    ssr: {
      build: {
        rollupOptions: { input: "./src/server.ts" },
      },
    },
  },
});