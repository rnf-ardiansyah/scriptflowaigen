import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route → /generator
export const Route = createFileRoute("/_authenticated/new-script")({
  beforeLoad: () => {
    throw redirect({ to: "/generator" });
  },
  component: () => null,
});
