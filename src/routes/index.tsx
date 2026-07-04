import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
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
      { title: "ScriptFlow — Workspace AI untuk Kreator Video Pendek" },
      {
        name: "description",
        content:
          "Ubah ide jadi skrip video pendek pakai AI. Rapikan library dan latihan dengan teleprompter bawaan — semua di satu workspace.",
      },
      { property: "og:title", content: "ScriptFlow — Workspace AI untuk Kreator Video Pendek" },
      {
        property: "og:description",
        content:
          "Workspace AI untuk kreator TikTok, Reels, dan Shorts. Ide → Skrip → Edit → Latihan.",
      },
      { property: "og:url", content: "https://scriptflowaigen.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://scriptflowaigen.lovable.app/" }],
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
            "Workspace AI untuk kreator video pendek. Generate, rapikan, dan latihan skrip di satu tempat.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
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
        <SocialProof />
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
