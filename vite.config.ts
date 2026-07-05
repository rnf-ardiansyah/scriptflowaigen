import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Plain Vite config — no more @lovable.dev/vite-tanstack-config wrapper.
// This app now only depends on official TanStack / Vite / Vercel tooling.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Route TanStack Start's server entry through our SSR error wrapper.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // "vercel" preset makes `npm run build` produce output Vercel understands.
    // Change to "node-server" if you ever self-host instead.
    nitro({ preset: "vercel" }),
    viteReact(),
  ],
  server: {
    host: true, // listen on 0.0.0.0 + ::, works on every OS/local network
    port: 8080,
  },
});
