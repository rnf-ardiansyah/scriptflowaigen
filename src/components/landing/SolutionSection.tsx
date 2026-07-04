import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const points = [
  "Mikir, nulis, edit, rapikan, dan latihan di satu tempat",
  "Didesain sesuai cara kerja kreator sebenarnya",
  "Dibangun khusus untuk short-form: TikTok, Reels, Shorts",
];

export function SolutionSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Solusinya"
          title="Satu workspace. Satu alur. Semuanya nyambung."
          description="ScriptFlow ganti tumpukan tools yang biasa dipakai kreator jadi satu workspace fokus yang dibangun untuk video pendek."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-electric/10 blur-3xl" />
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-elevated">
              <div className="grid grid-cols-3 gap-3">
                {["Ide", "Generate", "Edit"].map((s) => (
                  <Tile key={s} title={s} />
                ))}
                {["Simpan", "Latihan", "Rekam"].map((s) => (
                  <Tile key={s} title={s} muted />
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-electric/30 bg-electric/5 p-4">
                <p className="text-sm text-foreground">
                  <span className="text-electric">●</span> Live · 3 skrip terakhir kamu sudah
                  auto-sync dan siap di library.
                </p>
              </div>
            </div>
          </div>

          <div>
            <ul className="space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-electric/15 text-electric">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base text-foreground">{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Dibuat buat kreator pemula, freelancer, pemilik UMKM, dan personal brand yang mau
              nge-publish lebih banyak — tanpa burnout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ title, muted = false }: { title: string; muted?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-4 text-center text-sm font-medium ${
        muted
          ? "border-border bg-background text-muted-foreground"
          : "border-electric/30 bg-electric/5 text-foreground"
      }`}
    >
      {title}
    </div>
  );
}
