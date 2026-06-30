import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  {
    q: "What is ScriptFlow?",
    a: "ScriptFlow is the AI workspace for short-video creators. Generate scripts, organize a library, and rehearse with a built-in teleprompter — all in one place.",
  },
  {
    q: "Who is it for?",
    a: "Beginner creators, TikTok / Reels / Shorts creators, freelancers, UMKM owners, and personal brands who want to ship more video without burning out.",
  },
  {
    q: "Can I use ScriptFlow for free?",
    a: "Yes. The Free plan lets you generate up to 5 scripts a day, save 20 scripts, and use the built-in teleprompter forever.",
  },
  {
    q: "How does the AI work?",
    a: "You enter an idea. ScriptFlow uses purpose-built templates and AI models tuned for short-form video — strong hooks, tight beats, clear CTA.",
  },
  {
    q: "Can I edit the generated scripts?",
    a: "Of course. Every script opens in a clean editor where you can rewrite, tweak tone, or ask the AI to rewrite specific lines.",
  },
  {
    q: "Does it include a teleprompter?",
    a: "Yes — a built-in teleprompter with adjustable speed and font size so you can rehearse and record without leaving the app.",
  },
  {
    q: "Can I organize my scripts?",
    a: "Yes. Use folders, favorites, search, and auto-save to keep your entire script library organized and findable.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow="FAQ" title="Questions, answered." />
        <div className="mt-12 rounded-2xl border border-border bg-surface px-2 md:px-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
