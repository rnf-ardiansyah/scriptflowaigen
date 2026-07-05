// Client-side error reporting. This used to forward errors to Lovable's
// preview overlay (window.__lovableEvents); now it just logs to the console
// so you can still see them in devtools / your hosting provider's function
// logs. Swap the console.error below for Sentry, LogRocket, etc. if you want
// real error tracking in production.

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[app error]", error, {
    route: window.location.pathname,
    ...context,
  });
}
