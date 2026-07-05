import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/landing/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Ketentuan Layanan — ScriptFlow" },
      {
        name: "description",
        content:
          "Ketentuan layanan ScriptFlow: aturan penggunaan akun, konten, pembayaran, dan pemutusan layanan.",
      },
      { property: "og:title", content: "Ketentuan Layanan — ScriptFlow" },
      { property: "og:url", content: "https://scriptflow.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://scriptflow.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Ketentuan Layanan" updated="4 Juli 2026">
      <p>
        Dengan membuat akun atau menggunakan ScriptFlow, kamu setuju dengan
        ketentuan berikut. Kami sengaja membuatnya singkat.
      </p>

      <h2 className="text-xl font-semibold text-foreground">1. Akun</h2>
      <p>
        Kamu bertanggung jawab menjaga kerahasiaan password dan seluruh aktivitas yang
        terjadi di akun kamu. Satu akun untuk satu orang.
      </p>

      <h2 className="text-xl font-semibold text-foreground">2. Konten kamu</h2>
      <p>
        Skrip dan ide yang kamu buat di ScriptFlow adalah milik kamu. Kami hanya
        menyimpan dan memprosesnya untuk menjalankan layanan.
      </p>

      <h2 className="text-xl font-semibold text-foreground">3. Penggunaan yang dilarang</h2>
      <ul className="list-disc pl-6">
        <li>Menggunakan ScriptFlow untuk konten ilegal, kebencian, atau spam.</li>
        <li>Melakukan reverse-engineering atau scraping otomatis pada layanan.</li>
        <li>Menyalahgunakan kuota AI (mis. membagikan API/akses secara massal).</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">4. Paket & pembayaran</h2>
      <p>
        Paket Free memiliki batas skrip dan generate AI harian. Paket Premium
        diperpanjang bulanan; kamu bisa membatalkan kapan saja dan akses tetap
        berjalan sampai akhir periode berjalan.
      </p>

      <h2 className="text-xl font-semibold text-foreground">5. Penghentian</h2>
      <p>
        Kami dapat membekukan akun yang melanggar ketentuan ini. Kamu juga bisa
        menutup akun kapan saja dari halaman Profil.
      </p>

      <h2 className="text-xl font-semibold text-foreground">6. Perubahan</h2>
      <p>
        Kami dapat memperbarui ketentuan ini seiring perkembangan produk. Perubahan
        material akan diumumkan lewat email atau notifikasi in-app.
      </p>
    </LegalLayout>
  );
}
