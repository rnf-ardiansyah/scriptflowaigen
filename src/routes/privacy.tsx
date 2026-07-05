import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/landing/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Kebijakan Privasi — ScriptFlow" },
      {
        name: "description",
        content:
          "Kebijakan privasi ScriptFlow: data apa yang kami kumpulkan, bagaimana kami menyimpannya, dan hak kamu.",
      },
      { property: "og:title", content: "Kebijakan Privasi — ScriptFlow" },
      { property: "og:url", content: "https://scriptflow.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://scriptflow.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" updated="4 Juli 2026">
      <p>
        Halaman ini dipelihara oleh tim ScriptFlow untuk menjelaskan bagaimana kami
        menangani data kamu ketika menggunakan workspace kami. Bahasa di sini
        sengaja dibuat ringkas dan jelas.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Data yang kami kumpulkan</h2>
      <ul className="list-disc pl-6">
        <li>Data akun: nama, email, dan password ter-hash (dikelola provider auth).</li>
        <li>Data profil: niche, level pengalaman, dan tujuan yang kamu isi saat onboarding.</li>
        <li>Konten yang kamu buat: skrip, ide, folder, dan preferensi editor.</li>
        <li>Metadata teknis: log aktivitas, kuota generate AI, dan error diagnostik.</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">Cara kami menggunakannya</h2>
      <ul className="list-disc pl-6">
        <li>Menyediakan dan menjaga kualitas layanan ScriptFlow.</li>
        <li>Menerapkan batas kuota dan mencegah penyalahgunaan.</li>
        <li>Memberi notifikasi produk yang relevan.</li>
      </ul>
      <p>
        Kami <strong>tidak menjual</strong> data pribadi kamu, dan tidak menggunakan
        skrip yang kamu buat untuk melatih model AI publik.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Cookie</h2>
      <p>
        Kami hanya menggunakan cookie yang diperlukan untuk sesi login dan preferensi
        tampilan (misalnya tema gelap/terang). Tidak ada cookie iklan pihak ketiga.
      </p>

      <h2 className="text-xl font-semibold text-foreground">Hak kamu</h2>
      <ul className="list-disc pl-6">
        <li>Mengakses dan memperbarui data kamu dari halaman Profil.</li>
        <li>Meminta penghapusan akun beserta seluruh skrip yang tersimpan.</li>
        <li>Meminta salinan data yang kami simpan.</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground">Kontak</h2>
      <p>
        Pertanyaan seputar privasi? Hubungi kami di{" "}
        <a href="mailto:support@scriptflow.app" className="text-electric hover:underline">
          support@scriptflow.app
        </a>
        .
      </p>
    </LegalLayout>
  );
}
