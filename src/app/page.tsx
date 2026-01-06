'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";
import { ArrowRight, PlayCircle, BookOpen, Users, CheckCircle2, ChevronDown, Star } from "lucide-react";
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
      <section className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-6 lg:space-y-8">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-white">
              Maak een gratis account en{' '}
            </span>
            <span className="text-white">
              ontdek de strategie.
            </span>
          </h1>

          {/* iPhone Image - Under Title */}
          <div className="flex items-center justify-center pt-1 sm:pt-2">
            <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm">
              <div className="relative">
                {/* Glow effect behind phone */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C99E3]/20 to-[#6b8af0]/20 blur-3xl rounded-full transform scale-110"></div>
                
                {/* iPhone Image */}
                <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
                  <Image
                    src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/hand%20mockup%20small.webp"
                    alt="Het Trade Platform op iPhone - Leer traden waar en wanneer je wilt"
                    width={800}
                    height={800}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    priority
                    sizes="(max-width: 640px) 320px, 384px"
                  />
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-2 sm:-bottom-4 right-0 sm:right-2 lg:right-4 bg-gradient-to-r from-[#7C99E3] to-[#6b8af0] text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl shadow-xl transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 border border-white/20 sm:border-2">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-bold whitespace-nowrap flex items-center gap-1 sm:gap-1.5">
                    <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">module 1 gratis bekijken</span>
                    <span className="sm:hidden">module 1 gratis</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subheadline - Pain Points */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-2xl mx-auto leading-snug sm:leading-relaxed px-2 py-[10px]">
            Stop met gissen en start met leren. Ontdek een bewezen methode die je stap voor stap begeleidt van beginner naar zelfverzekerde trader.
          </p>

          {/* 4 Star Review - Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 pt-1 sm:pt-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#7C99E3] text-[#7C99E3]" />
                ))}
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-white">4.0 uit 5 sterren</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Geverifieerde reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#7C99E3]/10 border border-[#7C99E3]/30">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#7C99E3]" />
              <p className="text-[10px] sm:text-xs font-medium text-[#7C99E3]">Geen creditcard • 100% gratis</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4 pt-2 sm:pt-3 lg:pt-4">
            <div className="relative inline-block mx-auto">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 lg:py-5 rounded-xl text-white font-bold text-base sm:text-lg lg:text-xl relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                style={{ 
                  background: 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                  backgroundSize: '200% auto',
                  animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
                }}
              >
                <span className="relative z-20">Maak gratis een account</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative z-20" />
              </Link>
              <div 
                className="absolute inset-0 bg-[rgba(70,112,219,0.2)] blur-xl rounded-xl -z-0"
                style={{
                  animation: 'pulse-glow-bg 2s ease-in-out infinite',
                }}
              ></div>
            </div>
            <div className="space-y-1 sm:space-y-2 px-2">
              <p className="text-xs sm:text-sm text-slate-400 leading-tight">
                <span className="text-[#7C99E3] font-medium">✓ Volledig gratis</span> • <span className="text-[#7C99E3] font-medium">✓ Geen creditcard</span> • Direct toegang
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 italic leading-tight">
                Start direct zonder betalingsgegevens. 100% gratis en vrijblijvend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Video Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-[27px] sm:py-16 lg:py-20" style={{ backgroundColor: 'rgba(20, 20, 20, 1)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Social Proof */}
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-sm sm:text-xl md:text-2xl text-slate-300 mb-0">
              Ontwikkeld in samenwerking met
            </p>
            <p className="text-[39px] sm:text-3xl md:text-4xl font-black text-[#F79939]">
              Cryptoriez
            </p>
            <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl mx-auto">
              Cryptoriez is één van de meest bekeken trading-kanalen op YouTube voor iedereen die de markt serieus wil leren begrijpen. Wekelijks kijken duizenden traders naar hun marktupdates, analyses en educatieve video's waarin crypto en traditionele markten helder worden uitgelegd.
            </p>
            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#F79939]">4600</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">abbonees</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#F79939]">400+</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">videos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#F79939]">NL / BE</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">focus</p>
              </div>
            </div>
          </div>

          {/* YouTube Video */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/5DjxIjcPoKc?si=_R_tcKxzcm4iQrPT"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontSize: '27px' }}>
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
                  style={{
                    color: 'rgba(255, 255, 255, 1)',
                    background: 'linear-gradient(90deg, rgba(63, 78, 115, 0.4) 0%, rgba(21, 26, 39, 1) 100%)',
                  }}
                >
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl text-white mb-1">
                      <span className="font-bold">MODULE {module.id}:</span> <span className="font-normal">{module.title}</span>
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
      <section className="px-4 sm:px-6 lg:px-8 py-0">
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
