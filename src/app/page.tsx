'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";
import { ArrowRight, PlayCircle, BookOpen, Users, CheckCircle2, ChevronDown } from "lucide-react";
import ImageModal from "@/components/ImageModal";

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Set<number>>(new Set());

  const testimonials = [
    "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/1.webp",
    "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/2.webp",
    "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/3.webp",
    "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/4.webp",
  ];

  const modules = [
    {
      id: 1,
      title: "INTRODUCTIE EN BASISBEGRIPPEN",
      lessons: [
        "Bullish en Bearish",
        "Long en Short",
        "Spot vs. Leverage Traden",
        "De Onderdelen van een Trade",
        "Soorten Orders",
      ],
    },
    {
      id: 2,
      title: "WAT IS TRADEN ECHT?",
      lessons: [
        "Risk to Reward Ratio",
        "The Game of Probability",
        "Riskmanagement",
        "De Gouden Formule",
      ],
    },
    {
      id: 3,
      title: "MINDSET DEEL I",
      lessons: [
        "Inleiding tot de Juiste Trade Mindset",
        "Traden als een Beroep",
        "De Zes Essentials voor een Traders Mindset",
        "Why & Doelen",
      ],
    },
    {
      id: 4,
      title: "MARKTBEWEGINGEN EN PRICE ACTION",
      lessons: [
        "Inleiding tot Candlesticks",
        "Anatomie van Candlesticks",
        "Candle Closures + Timeframes",
        "De Soorten en Context van Candles",
        "Marktstructuur",
        "Verandering van Structuur",
      ],
    },
    {
      id: 5,
      title: "TECHNISCHE ANALYSE DEEL I - TREND IDENTIFICATIE",
      lessons: [
        "Support en Resistance",
        "Trendlines",
        "Counter Trendlines",
        "Channels",
        "Wedges",
      ],
    },
    {
      id: 6,
      title: "TECHNISCHE ANALYSE DEEL II – PATRONEN",
      lessons: [
        "Double Tops",
        "Double Bottoms",
        "Head & Shoulders",
        "Inverse Head & Shoulders",
      ],
    },
    {
      id: 7,
      title: "SUPPLY EN DEMAND DEEL I",
      lessons: [
        "Basisprincipes",
        "Hoe Identificeer je Supply- en Demand Zones?",
      ],
    },
  ];

  const toggleModule = (moduleId: number) => {
    const newOpenModules = new Set(openModules);
    if (newOpenModules.has(moduleId)) {
      newOpenModules.delete(moduleId);
    } else {
      newOpenModules.add(moduleId);
    }
    setOpenModules(newOpenModules);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#1a1f2e] to-[#0B0F17] text-white font-sans">
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
      {/* Navigation */}
      <nav className="w-full border-b border-slate-800/50 bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Image 
                src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The%20Trade%20Platform%20white.png"
                alt="Het Trade Platform"
                width={160}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#7C99E3] via-[#6b8af0] to-[#7C99E3] bg-clip-text text-transparent">
              Leer professioneel traden
            </span>
            <br />
            <span className="text-white">met een gestructureerde aanpak</span>
          </h1>

          {/* Subheadline - Pain Points */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop met gissen en start met leren. Ontdek een bewezen methode die je stap voor stap begeleidt van beginner naar zelfverzekerde trader.
          </p>

          {/* CTA Section */}
          <div className="space-y-4 pt-4">
            <div className="relative inline-block mx-auto">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-xl text-white font-bold text-lg sm:text-xl relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                style={{ 
                  background: 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                  backgroundSize: '200% auto',
                  animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
                }}
              >
                <span className="relative z-20">Maak gratis een account</span>
                <ArrowRight className="h-5 w-5 relative z-20" />
              </Link>
              <div 
                className="absolute inset-0 bg-[rgba(70,112,219,0.2)] blur-xl rounded-xl -z-0"
                style={{
                  animation: 'pulse-glow-bg 2s ease-in-out infinite',
                }}
              ></div>
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-[#7C99E3] font-medium">✓ Gratis & vrijblijvend</span> • Bekijk direct een gratis introductievideo in het dashboard
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Benefit 1 */}
            <div className="bg-[#121826]/50 border border-slate-800/50 rounded-xl p-6 sm:p-8 hover:border-[#7C99E3]/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-[#7C99E3]/10 flex items-center justify-center mb-4">
                <PlayCircle className="h-6 w-6 text-[#7C99E3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Video-gebaseerd leren
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Volg modules met praktische video-lessen die je direct kunt toepassen. Leer in je eigen tempo, wanneer het jou uitkomt.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#121826]/50 border border-slate-800/50 rounded-xl p-6 sm:p-8 hover:border-[#7C99E3]/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-[#7C99E3]/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-[#7C99E3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Gestructureerd curriculum
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Van basisbegrippen tot geavanceerde strategieën. Elke module bouwt voort op de vorige, zodat je solide fundamenten legt.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#121826]/50 border border-slate-800/50 rounded-xl p-6 sm:p-8 hover:border-[#7C99E3]/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-[#7C99E3]/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#7C99E3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Praktijkgericht
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Test je kennis met examens en oefen met praktijkcases. Leer niet alleen theorie, maar pas het ook direct toe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Het Trade Platform
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[#7C99E3] text-white">
                Curriculum
              </span>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-2">
              Een stap-voor-stap cursus die je van beginner naar expert brengt.
            </p>
            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              Het programma wordt continu vernieuwd en we voegen regelmatig nieuw materiaal toe.
            </p>
          </div>

          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-[#121826]/50 border border-slate-800/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700/50"
              >
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-[#121826]/70 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                      MODULE {module.id}: {module.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 ml-4 transition-transform duration-200 ${
                      openModules.has(module.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openModules.has(module.id) && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="pt-2 space-y-2 border-t border-slate-800/50">
                      {module.lessons.map((lesson, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 py-2 text-slate-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7C99E3] flex-shrink-0" />
                          <span className="text-sm sm:text-base">{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-8 py-5 rounded-xl text-white font-bold text-lg sm:text-xl relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
              style={{ 
                background: 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                backgroundSize: '200% auto',
                animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
              }}
            >
              <span className="relative z-20">Maak gratis een account</span>
              <ArrowRight className="h-5 w-5 relative z-20" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Wat onze studenten zeggen
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Lees wat anderen ervaren met Het Trade Platform
            </p>
          </div>
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-[#121826]/30 border border-slate-800/50 hover:border-[#7C99E3]/50 transition-all duration-200"
                onClick={() => setSelectedImage(testimonial)}
              >
                <div className="relative w-full">
                  <Image
                    src={testimonial}
                    alt={`Testimonial ${index + 1}`}
                    width={1200}
                    height={1600}
                    className="w-full h-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
                    sizes="100vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#121826]/30 border border-slate-800/50 rounded-xl p-8 sm:p-10 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Serieuze educatie, geen hype
            </h2>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Het Trade Platform is ontwikkeld door ervaren traders die begrijpen wat het betekent om te leren traden. 
              We focussen op solide fundamenten, risicomanagement en een realistische kijk op trading.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-5 w-5 text-[#7C99E3]" />
                <span className="text-sm">Geen get-rich-quick beloftes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-5 w-5 text-[#7C99E3]" />
                <span className="text-sm">Professionele begeleiding</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-5 w-5 text-[#7C99E3]" />
                <span className="text-sm">Bewezen methodologie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300">
            Maak nu een gratis account aan en bekijk direct de introductievideo in je dashboard.
          </p>
          <div className="relative inline-block">
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-8 py-5 rounded-xl text-white font-bold text-lg sm:text-xl relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
              style={{ 
                background: 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                backgroundSize: '200% auto',
                animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
              }}
            >
              <span className="relative z-20">Maak gratis een account</span>
              <ArrowRight className="h-5 w-5 relative z-20" />
            </Link>
            <div 
              className="absolute inset-0 bg-[rgba(70,112,219,0.2)] blur-xl rounded-xl -z-0"
              style={{
                animation: 'pulse-glow-bg 2s ease-in-out infinite',
              }}
            ></div>
          </div>
          <p className="text-sm text-slate-500">
            Geen creditcard nodig • Direct toegang • Vrijblijvend
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {BRAND.name} / Cryptoriez
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Voorwaarden
              </Link>
              <Link href="/login" className="hover:text-slate-300 transition-colors">
                Inloggen
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
