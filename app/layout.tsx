import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import InstallPwaBanner from "@/components/pwa/InstallPwaBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "Perpustakaan Digital - SMK Negeri 1 Beringin",
  description: "Sistem informasi perpustakaan digital resmi dan katalog e-book SMK Negeri 1 Beringin",
  authors: [{ name: "Dika Armadana (@dprxz_)", url: "https://instagram.com/dprxz_" }],
  creator: "Dika Armadana (@dprxz_)",
  publisher: "SMK Negeri 1 Beringin",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Perpus SMKN1",
  },
  other: {
    copyright: "Hak Cipta (c) 2026 Dika Armadana (@dprxz_ / boxdik089-ctrl). Seluruh Hak Cipta Dilindungi Undang-Undang.",
  },
  icons: {
    icon: [
      { url: "/assets/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased overflow-x-hidden`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400;1,6..72,600&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#020617" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('perpus_theme');
                  var isDark = saved ? (saved === 'dark') : true;
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.setAttribute('data-theme', 'dark');
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}


                // Register Service Worker
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <Providers>{children}</Providers>
        <InstallPwaBanner />
      </body>
    </html>
  );
}
