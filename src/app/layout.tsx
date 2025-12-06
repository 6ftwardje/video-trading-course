import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/components/ui/Brand";

export const metadata: Metadata = {
  title: "Cryptoriez Learning Platform",
  description: "Leer traden via video modules van Cryptoriez",
  icons: {
    icon: BRAND.logoIconUrl,
    shortcut: BRAND.logoIconUrl,
    apple: BRAND.logoIconUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="bg-[var(--bg)] text-white font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
