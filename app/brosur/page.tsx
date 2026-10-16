import { Metadata } from "next";
import { BrosurSmartSchoolClient } from "@/components/brosur/BrosurSmartSchoolClient";

export const metadata: Metadata = {
  title: "Brosur Acara Smart School - SMK Negeri 1 Beringin",
  description: "Brosur resmi ekosistem Smart School digital SMK Negeri 1 Beringin. Menampilkan SIDATA, Presensi Online, Perpustakaan Digital, Siswapay, dan E-Jurnal.",
  authors: [{ name: "Dika Armadana (@dprxz_)", url: "https://instagram.com/dprxz_" }],
  creator: "Dika Armadana (@dprxz_)",
  openGraph: {
    title: "Brosur Smart School SMK Negeri 1 Beringin",
    description: "Ekosistem digital terpadu sekolah vokasi unggul Sumatera Utara.",
    images: ["/assets/showcase/portal-smartschool.png"],
  },
};

export default function BrosurPage() {
  return <BrosurSmartSchoolClient />;
}
