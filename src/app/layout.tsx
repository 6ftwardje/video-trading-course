import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentGate from "@/components/StudentGate";
import { BRAND } from "@/components/ui/Brand";

export const metadata: Metadata = {
  title: "Cryptoriez Learning Platform",
  description: "Leer traden via video modules van Cryptoriez",
  icons: {
    icon: BRAND.logoUrl,
    shortcut: BRAND.logoUrl,
    apple: BRAND.logoUrl,
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
        <StudentGate />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
