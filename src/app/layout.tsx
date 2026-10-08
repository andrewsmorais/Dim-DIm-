import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Grana Smart | Controle Financeiro Automático pelo WhatsApp",
  description: "Cuidar das contas dava trabalho. Agora é automático. O Grana Smart importa, categoriza e avisa no WhatsApp sobre faturas, assinaturas e saldos.",
  openGraph: {
    title: "Grana Smart | Controle Financeiro Automático",
    description: "O Grana Smart importa, categoriza e avisa no WhatsApp sobre faturas, assinaturas e saldos.",
    url: "https://granasmart.com.br",
    siteName: "Grana Smart",
    images: [{ url: "https://granasmart.com.br/og-image.jpg", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grana Smart | Controle Financeiro Automático",
    description: "Cuidar das contas dava trabalho. Agora é automático.",
    images: ["https://granasmart.com.br/twitter-card.jpg"],
  },
  manifest: "/manifest.webmanifest",
  authors: [{ name: "Grana Capital", url: "https://granasmart.com.br" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
