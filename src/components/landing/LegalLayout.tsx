import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Terakhir diperbarui: {updated}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gradient md:text-5xl">
          {title}
        </h1>
        <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
