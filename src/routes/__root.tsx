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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-electric px-4 py-2 text-sm font-medium text-electric-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-electric px-4 py-2 text-sm font-medium text-electric-foreground transition-colors hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            Go home
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
      { title: "ScriptFlow — AI Script Workspace for Short Video Creators" },
      {
        name: "description",
        content:
          "ScriptFlow turns ideas into short-video scripts. Generate with AI, organize your library, and rehearse with a built-in teleprompter — all in one workspace.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ScriptFlow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@scriptflow" },
      { property: "og:title", content: "ScriptFlow — AI Script Workspace for Short Video Creators" },
      { name: "twitter:title", content: "ScriptFlow — AI Script Workspace for Short Video Creators" },
      { name: "description", content: "ScriptFlow is an AI-powered workspace for short-form video creators to generate, organize, and rehearse scripts." },
      { property: "og:description", content: "ScriptFlow is an AI-powered workspace for short-form video creators to generate, organize, and rehearse scripts." },
      { name: "twitter:description", content: "ScriptFlow is an AI-powered workspace for short-form video creators to generate, organize, and rehearse scripts." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c0e1bab9-988a-4adf-8556-f68f205b94af/id-preview-08977b0d--33fd0f6e-c650-4ea0-a888-7d810d2cda28.lovable.app-1782807838809.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c0e1bab9-988a-4adf-8556-f68f205b94af/id-preview-08977b0d--33fd0f6e-c650-4ea0-a888-7d810d2cda28.lovable.app-1782807838809.png" },
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

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
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
      <Outlet />
    </QueryClientProvider>
  );
}
