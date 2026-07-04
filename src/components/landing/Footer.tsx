import { Twitter, Github, Youtube, Linkedin } from "lucide-react";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#features" },
      { label: "Harga", href: "#pricing" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Sumber Daya",
    links: [
      { label: "Blog", href: "#" },
      { label: "Dokumentasi", href: "#" },
      { label: "Komunitas", href: "#" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Privasi", href: "#" },
      { label: "Ketentuan", href: "#" },
      { label: "Kontak", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Workspace AI untuk kreator video pendek. Ide → Skrip → Edit → Latihan.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Twitter, Youtube, Github, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="sosial"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-electric"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {c.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Script Flow. Semua hak dilindungi.</p>
          <p>Dibuat untuk kreator.</p>
        </div>
      </div>
    </footer>
  );
}
