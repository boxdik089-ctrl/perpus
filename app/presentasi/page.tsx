import { Metadata } from "next";
import PresentationViewer from "@/components/presentasi/PresentationViewer";

export const metadata: Metadata = {
  title: "Presentasi Profil & Keunggulan - Perpustakaan SMKN 1 Beringin",
  description:
    "Presentasi resmi sistem informasi perpustakaan digital SMK Negeri 1 Beringin. Menampilkan katalog 7 jurusan, modul e-book, kartu anggota digital NISN, dan kiosk presensi mandiri.",
};

export default function PresentasiPage() {
  return <PresentationViewer />;
}
