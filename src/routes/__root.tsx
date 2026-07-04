import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ThemeProvider } from "../components/theme/ThemeProvider";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-electric px-4 py-2 text-sm font-medium text-electric-foreground transition-colors hover:opacity-90"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Halaman ini gagal dimuat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ada masalah di sisi kami. Coba refresh atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-electric px-4 py-2 text-sm font-medium text-electric-foreground transition-colors hover:opacity-90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            Kembali ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0f1c" },
      { title: "Script Flow — Workspace AI untuk Kreator Video Pendek" },
      {
        name: "description",
        content:
          "Script Flow mengubah ide jadi skrip video pendek. Generate pakai AI, rapikan library, dan latihan dengan teleprompter bawaan — semua di satu workspace.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Script Flow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@scriptflow" },
      { property: "og:title", content: "Script Flow — Workspace AI untuk Kreator Video Pendek" },
      { name: "twitter:title", content: "Script Flow — Workspace AI untuk Kreator Video Pendek" },
      { property: "og:description", content: "Workspace bertenaga AI untuk kreator video pendek — generate, rapikan, dan latihan skrip dalam satu tempat." },
      { name: "twitter:description", content: "Workspace bertenaga AI untuk kreator video pendek — generate, rapikan, dan latihan skrip dalam satu tempat." },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeInitScript = `(function(){try{var t=localStorage.getItem('scriptflow-theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { routeAfterAuth } = await import("@/lib/profile-helpers");
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT") {
          router.invalidate();
          return;
        }
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          router.invalidate();
          queryClient.invalidateQueries();
          // After OAuth full-page redirect, send the user from public landing/auth pages to their app.
          const path = window.location.pathname;
          if (path === "/" || path === "/login" || path === "/register") {
            routeAfterAuth().then((dest) => {
              router.navigate({ to: dest, replace: true });
            });
          }
        }
      });
      subscription = data.subscription;
    })();
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
        <Toaster position="bottom-right" richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

