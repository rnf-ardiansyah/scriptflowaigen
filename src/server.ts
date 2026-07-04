import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      
      // TanStack Start server functions use internal URL patterns for RPC calls.
      // These patterns vary by version but commonly include /_server, /api, or
      // query params like ?_serverFnId=. We must re-throw errors for these paths
      // so TanStack Start can serialize them properly for the client.
      const url = new URL(request.url);
      const isServerFnCall =
        url.pathname.startsWith("/_server") ||
        url.pathname.startsWith("/api/") ||
        url.searchParams.has("_serverFnId") ||
        url.searchParams.has("_data");

      // Let TanStack Start handle server function errors - it serializes them
      // with proper structure for client-side error handling
      if (isServerFnCall) {
        throw error;
      }

      // For page requests, return friendly HTML error page
      const acceptsHTML = request.headers.get("accept")?.includes("text/html") ?? false;
      
      if (acceptsHTML) {
        return new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      // Fallback for other requests (static assets, etc)
      const err = error as { message?: string } | undefined;
      return new Response(
        JSON.stringify({
          error: true,
          message: err?.message || "Server error",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }
  },
};
