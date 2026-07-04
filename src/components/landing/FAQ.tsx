import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  {
    q: "Apa itu ScriptFlow?",
    a: "ScriptFlow adalah workspace AI untuk kreator video pendek. Generate skrip, rapikan library, dan latihan pakai teleprompter bawaan — semuanya di satu tempat.",
  },
  {
    q: "Cocok buat siapa?",
    a: "Kreator pemula, kreator TikTok / Reels / Shorts, freelancer, pemilik UMKM, dan personal brand yang mau nge-publish lebih banyak video tanpa burnout.",
  },
  {
    q: "Bisa pakai ScriptFlow gratis?",
    a: "Bisa banget. Paket Free membolehkan kamu generate sampai 5 skrip per hari, menyimpan 20 skrip, dan pakai teleprompter selamanya.",
  },
  {
    q: "Gimana cara kerja AI-nya?",
    a: "Kamu tinggal masukin ide. ScriptFlow pakai template khusus dan model AI yang ditune buat video pendek — hook kuat, alur padat, CTA jelas.",
  },
  {
    q: "Skrip hasil AI bisa diedit?",
    a: "Tentu. Setiap skrip terbuka di editor bersih di mana kamu bisa rewrite, ubah tone, atau minta AI nulis ulang bagian tertentu.",
  },
  {
    q: "Ada teleprompter-nya?",
    a: "Ada — teleprompter built-in dengan kecepatan dan ukuran font yang bisa diatur, jadi kamu bisa latihan dan rekam tanpa keluar aplikasi.",
  },
  {
    q: "Bisa dirapikan pakai folder?",
    a: "Bisa. Ada folder, favorit, pencarian, dan auto-save biar seluruh library skrip kamu tetap rapi dan gampang ditemukan.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Pertanyaan yang sering ditanya." />
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
