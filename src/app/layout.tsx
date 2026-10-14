import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/PWA";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Jakash | Controle Financeiro Automático pelo WhatsApp",
  description: "Cuidar das contas dava trabalho. Agora é automático. O Jakash importa, categoriza e avisa no WhatsApp sobre faturas, assinaturas e saldos.",
  openGraph: {
    title: "Jakash | Controle Financeiro Automático",
    description: "O Jakash importa, categoriza e avisa no WhatsApp sobre faturas, assinaturas e saldos.",
    url: "https://www.jakash.app",
    siteName: "Jakash",
    images: [{ url: "https://www.jakash.app/og-image.jpg", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jakash | Controle Financeiro Automático",
    description: "Cuidar das contas dava trabalho. Agora é automático.",
    images: ["https://www.jakash.app/twitter-card.jpg"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Jakash", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  authors: [{ name: "Jakash", url: "https://www.jakash.app" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5B5BF0" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
