import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScriptFlow — AI Script Workspace for Short Video Creators" },
      {
        name: "description",
        content:
          "Turn ideas into short-video scripts with AI. Organize your library and rehearse with a built-in teleprompter — all in one workspace.",
      },
      { property: "og:title", content: "ScriptFlow — AI Script Workspace for Short Video Creators" },
      {
        property: "og:description",
        content:
          "The AI workspace for TikTok, Reels and Shorts creators. Idea → Script → Edit → Practice.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ScriptFlow",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description:
            "AI script workspace for short-form video creators. Generate, organize, and rehearse scripts in one place.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesBento />
        <ProductShowcase />
        <HowItWorks />
        <Benefits />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
