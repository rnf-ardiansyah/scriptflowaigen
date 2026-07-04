// TanStack Start configuration wrapper.
// Keeps the project-specific Vite/TanStack defaults in one place.
import { defineConfig } from "@tanstack/start-config/vite";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
