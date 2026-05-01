'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/components/ui/Brand";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers3,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import ImageModal from "@/components/ImageModal";
import { FREE_MODULE_ORDER_LIMIT } from "@/lib/access";

const testimonials = [
  // Replace the quote, name, detail and image with real student proof.
  {
    image: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/1.webp",
    quote: "De modules brengen eindelijk structuur in alles wat ik los op YouTube zag.",
    name: "Voornaam Achternaam",
    detail: "Student module 1-6",
  },
  {
    image: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/2.webp",
    quote: "Door de examens wist ik meteen waar ik nog moest bijsturen.",
    name: "Voornaam Achternaam",
    detail: "Student technische analyse",
  },
  {
    image: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/3.webp",
    quote: "Geen hype, maar duidelijke uitleg over risico, mindset en probability.",
    name: "Voornaam Achternaam",
    detail: "Student riskmanagement",
  },
  {
    image: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/4.webp",
    quote: "Ik kon meteen starten zonder eerst te betalen en zag snel of het bij mij paste.",
    name: "Voornaam Achternaam",
    detail: "Gratis account",
  },
];

const landingMedia = {
  // Replace these URLs with the final hero intro, platform demo and poster images.
  heroHostVideoPoster: "/assets/landing/free-modules-hero.png",
  heroHostVideoSrc: "",
  dashboardIntroVimeoEmbed: "https://player.vimeo.com/video/1144453792?badge=0&autopause=0&player_id=0&app_id=58479",
  module10VimeoEmbed: "https://player.vimeo.com/video/1188443112?badge=0&autopause=0&player_id=0&app_id=58479",
};

const modules = [
  {
    id: 1,
    title: "Introductie en basisbegrippen",
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
    title: "Wat is traden echt?",
    lessons: [
      "Risk to Reward Ratio",
      "The Game of Probability",
      "Riskmanagement",
      "De Gouden Formule",
    ],
  },
  {
    id: 3,
    title: "Mindset deel I",
    lessons: [
      "Inleiding tot de Juiste Trade Mindset",
      "Traden als een Beroep",
      "De Zes Essentials voor een Traders Mindset",
      "Why & Doelen",
    ],
  },
  {
    id: 4,
    title: "Marktbewegingen en price action",
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
    title: "Technische analyse deel I",
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
    title: "Technische analyse deel II",
    lessons: [
      "Double Tops",
      "Double Bottoms",
      "Head & Shoulders",
      "Inverse Head & Shoulders",
    ],
  },
  {
    id: 7,
    title: "Supply en Demand deel I",
    lessons: [
      "Basisprincipes",
      "Hoe identificeer je Supply- en Demand Zones?",
    ],
  },
];

const freeHighlights = [
  {
    icon: Layers3,
    title: `${FREE_MODULE_ORDER_LIMIT} modules gratis`,
    copy: "Start met de basis en bouw stap voor stap verder zonder betaalmuur in je eerste traject.",
  },
  {
    icon: PlayCircle,
    title: "Video's, praktijk en examens",
    copy: "Je krijgt de lessen, praktijkvoorbeelden en examens die bij module 1 t/m 6 horen.",
  },
  {
    icon: ShieldCheck,
    title: "Geen creditcard nodig",
    copy: "Maak een gratis account aan en begin meteen. Je kiest later zelf of je verder wil upgraden.",
  },
];

const steps = [
  {
    title: "Maak je account",
    copy: "Registreer gratis en kom direct in het platform terecht.",
  },
  {
    title: "Start module 1",
    copy: "Volg de lessen op volgorde zodat je niet overspoeld raakt.",
  },
  {
    title: "Slaag voor je examen",
    copy: "Haal 75% of meer om de volgende module vrij te spelen. Je kunt opnieuw oefenen en herkansen.",
  },
];

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/login?mode=register"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7C99E3] px-5 py-3 text-sm font-bold text-[#05070c] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C99E3] focus:ring-offset-2 focus:ring-offset-[#0B0F17] active:scale-[0.99] sm:px-6 ${className}`}
    >
      Begin gratis met module 1
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function TrustPoint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="h-4 w-4 text-[#7C99E3]" aria-hidden />
      {children}
    </span>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function SectionLabel({
  children,
  className = "text-[#7C99E3]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>
      {children}
    </p>
  );
}

function VideoPlaceholder({
  poster,
  videoSrc,
  embedSrc,
  title,
  eyebrow,
  duration,
}: {
  poster: string;
  videoSrc?: string;
  embedSrc?: string;
  title: string;
  eyebrow: string;
  duration: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_24px_70px_rgba(3,8,18,0.42)]">
      <div className="group relative aspect-video w-full">
        {embedSrc ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedSrc}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : videoSrc ? (
          <video
            className="h-full w-full object-cover"
            src={videoSrc}
            poster={poster}
            controls
            playsInline
          />
        ) : (
          <Image
            src={poster}
            alt=""
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 1024px) 92vw, 46vw"
            priority={poster === landingMedia.heroHostVideoPoster}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,13,0.04),rgba(3,7,13,0.82))]" />
        {!videoSrc && !embedSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md">
              <PlayCircle className="h-8 w-8 text-white" aria-hidden />
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-col items-start gap-2 transition-opacity duration-200 group-hover:opacity-0 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9c8ff]">
              {eyebrow}
            </p>
            <p className="mt-1 text-lg font-bold leading-tight text-white">{title}</p>
          </div>
          <span className="shrink-0 rounded bg-black/45 px-2 py-1 text-xs font-semibold text-white/80">
            {duration}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Set<number>>(() => new Set([1]));
  const prefersReducedMotion = useReducedMotion();

  const toggleModule = (moduleId: number) => {
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080b11]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Het Trade Platform home">
            <Image
              src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The Trade Platform white.png"
              alt="Het Trade Platform"
              width={168}
              height={34}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white/70 transition hover:text-white sm:inline"
            >
              Inloggen
            </Link>
            <Link
              href="/login?mode=register"
              className="inline-flex min-h-10 items-center rounded-lg border border-[#7C99E3]/50 bg-[#7C99E3]/10 px-3 py-2 text-xs font-bold text-[#b9c8ff] transition hover:bg-[#7C99E3]/20 sm:text-sm"
            >
              Start module 1
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-9 px-4 pb-10 pt-9 sm:px-6 sm:pb-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:gap-12 lg:px-8 lg:py-12">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative z-10 max-w-[34rem] space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7C99E3]/30 bg-[#7C99E3]/10 px-3 py-1.5 text-xs font-semibold text-[#c7d3ff]">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Module 1-{FREE_MODULE_ORDER_LIMIT} gratis
              </div>

              <div className="space-y-4">
                <h1 className="text-[2.6rem] font-bold leading-[0.95] sm:text-6xl lg:text-[4.1rem]">
                  <span className="block">Leer traden</span>
                  <span className="block">vanaf nul.</span>
                  <span className="block text-[#7C99E3]">Gratis gestart.</span>
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                  Volg een gestructureerd Nederlands traject met lessen, praktijkvoorbeelden en
                  examens. Je krijgt module 1 t/m {FREE_MODULE_ORDER_LIMIT} gratis, zonder creditcard.
                </p>
              </div>

              <div className="space-y-3">
                <PrimaryCta className="w-full sm:w-auto" />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-white/60 sm:text-sm">
                  <TrustPoint>Direct toegang</TrustPoint>
                  <TrustPoint>Geen creditcard</TrustPoint>
                  <TrustPoint>Educatief traject</TrustPoint>
                </div>
                <p className="max-w-xl text-xs leading-5 text-white/45">
                  Educatief platform. Geen beleggingsadvies. Traden brengt risico's met zich mee en
                  resultaten zijn nooit gegarandeerd.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-4 sm:max-w-lg sm:gap-4">
                <StatItem value="4600+" label="abonnees" />
                <StatItem value="400+" label="video's" />
                <StatItem value={`${FREE_MODULE_ORDER_LIMIT}`} label="gratis modules" />
              </div>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.58, ease: "easeOut", delay: 0.08 }}
              className="relative"
            >
              <VideoPlaceholder
                poster={landingMedia.heroHostVideoPoster}
                videoSrc={landingMedia.heroHostVideoSrc}
                embedSrc={landingMedia.dashboardIntroVimeoEmbed}
                eyebrow="Het Trade Platform"
                title="Hoe het platform tot stand kwam"
                duration="Korte uitleg"
              />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d1119] px-4 pb-10 pt-7 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-7 md:grid-cols-3">
              {freeHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="border-t border-white/10 pt-5 md:border-t-0 md:pt-0">
                    <Icon className="h-6 w-6 text-[#7C99E3]" aria-hidden />
                    <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/60">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 z-0">
            <div
              className="h-full w-full bg-cover bg-center opacity-[0.1] lg:bg-fixed"
              style={{ backgroundImage: "url(https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/section_human.webp)" }}
            />
          </div>
          <div className="absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(8,12,20,0.48)_0%,rgba(8,12,20,0.26)_46%,rgba(8,12,20,0.54)_100%)]" />
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_76%_48%,rgba(124,153,227,0.16),transparent_56%)]" />

          <div className="relative z-20 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="space-y-5">
              <SectionLabel>Waarom dit werkt</SectionLabel>
              <h2 className="max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                Geen losse video's. Een pad dat je vooruit duwt.
              </h2>
              <p className="max-w-xl text-base leading-7 text-white/70">
                Je start bij de basis, bekijkt elke les in volgorde en gebruikt examens als
                checkpoint. Zo weet je precies wanneer je klaar bent voor de volgende module.
              </p>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 border-t border-white/10 pt-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C99E3] text-sm font-bold text-[#060914]">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/60">{step.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-5">
                <h3 className="font-semibold text-white">Examen zonder onduidelijkheid</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  De 75% is een checkpoint, geen eindstation. Haal je het niet, dan zie je waar
                  je moet bijsturen en kun je opnieuw proberen voor je doorgaat.
                </p>
              </div>
            </div>

            <div className="hidden lg:block" aria-hidden>
              <div className="rounded-2xl border border-white/10 bg-[#0c1422]/78 p-3 shadow-[0_24px_60px_rgba(5,10,20,0.45)] backdrop-blur-xl">
                <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
                  <div className="rounded-xl border border-white/10 bg-[#09101b] p-2">
                    <div className="relative overflow-hidden rounded-lg border border-white/10">
                      <Image
                        src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/lesson-thumbnails/lesson-1.jpg"
                        alt=""
                        width={1600}
                        height={900}
                        className="h-[220px] w-full object-cover opacity-78"
                        sizes="(max-width: 1280px) 56vw, 420px"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.1),rgba(7,11,18,0.72))]" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/80">
                        <span className="rounded bg-black/45 px-2 py-1">Introductie</span>
                        <span className="rounded bg-black/45 px-2 py-1">06:19</span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-white/10 bg-[#0d1624] px-3 py-2">
                      <p className="text-sm font-semibold text-white">Introductie</p>
                      <p className="mt-1 text-xs text-white/65">
                        In deze les leer je wat trading inhoudt, hoe markten werken en waarom psychologie cruciaal is.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0a121f] p-3">
                    <h3 className="mb-2 text-sm font-semibold text-white">Lessen in deze module</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Introductie", active: true },
                        { label: "Bullish & Bearish", active: false },
                        { label: "Long & Short", active: false },
                        { label: "Spot VS Leverage", active: false },
                        { label: "Onderdelen van een trade", active: false },
                      ].map(item => (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between rounded-lg border px-2.5 py-2 ${
                            item.active
                              ? "border-[#7C99E3]/45 bg-[#7C99E3]/12"
                              : "border-white/10 bg-[#0d1624]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-12 rounded bg-white/10" />
                            <span className="text-xs text-white/85">{item.label}</span>
                          </div>
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#7C99E3]" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-white/10 bg-[#0d1624] p-2.5">
                      <p className="text-xs font-semibold text-white/90">Praktijklessen</p>
                      <p className="mt-1 text-xs text-white/65">
                        TradingView correct instellen en je eerste setup professioneel opzetten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0d1119] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 space-y-3 sm:mb-10">
              <SectionLabel>Curriculum</SectionLabel>
              <h2 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
                De eerste {FREE_MODULE_ORDER_LIMIT} modules zitten in je gratis account.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-white/70">
                Module 7 en verder blijven zichtbaar als preview, zodat je weet wat er
                achter de volledige cursus zit.
              </p>
            </div>

            <div className="space-y-3">
              {modules.map((module) => {
                const isFree = module.id <= FREE_MODULE_ORDER_LIMIT;
                const isOpen = openModules.has(module.id);

                return (
                  <div
                    key={module.id}
                    className={`overflow-hidden rounded-lg border transition ${
                      isFree
                        ? "border-[#7C99E3]/30 bg-[#101722]"
                        : "border-white/10 bg-white/[0.035]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase text-white/50">
                            Module {module.id}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                              isFree
                                ? "bg-[#7C99E3]/15 text-[#bfd0ff]"
                                : "bg-white/10 text-white/50"
                            }`}
                          >
                            {isFree ? "Gratis inbegrepen" : "Volledige toegang"}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-white sm:text-lg">
                          {module.title}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-white/50 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10 px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="grid gap-2 pt-4 sm:grid-cols-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson}
                              className="flex items-start gap-2 text-sm leading-6 text-white/70"
                            >
                              <CheckCircle2
                                className={`mt-1 h-4 w-4 shrink-0 ${
                                  isFree ? "text-[#7C99E3]" : "text-white/30"
                                }`}
                                aria-hidden
                              />
                              <span>{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryCta className="w-full sm:w-auto" />
              <p className="text-sm text-white/60">
                Je begint gratis. Upgraden kan later, wanneer je verder wil dan module {FREE_MODULE_ORDER_LIMIT}.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_24px_70px_rgba(3,8,18,0.42)]">
              <div className="group relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={landingMedia.module10VimeoEmbed}
                  title="Module 10 preview: Supply & Demand deel 2"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(3,7,13,0),rgba(3,7,13,0.82))] p-4 transition-opacity duration-200 group-hover:opacity-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9c8ff]">
                    Module 10 preview
                  </p>
                  <p className="mt-1 text-lg font-bold leading-tight text-white">
                    Supply & Demand deel 2
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <SectionLabel>Module 10 · Supply & Demand deel 2</SectionLabel>
                <h2 className="max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                  Leer kijken met de ogen van de market maker.
                </h2>
                <p className="max-w-xl text-base leading-7 text-white/70">
                  In deze module ontdek je waarom prijs vaak eerst naar stoplosses beweegt
                  voordat de echte move begint. Je leert hoe instituten liquiditeit zoeken,
                  hoe accumulatie eruitziet op de chart en hoe je order flow leest zonder
                  te vertrouwen op lagging indicators.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0d1119] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <SectionLabel>Reviews</SectionLabel>
                <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
                  Studenten over het platform.
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="flex items-center gap-0.5 text-[#7C99E3]" aria-hidden>
                  {[...Array(4)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                  <Star className="h-4 w-4 text-white/20" />
                </div>
                <span>Geverifieerde reviews</span>
              </div>
            </div>

            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.image}
                  className="group min-w-[78%] snap-center overflow-hidden rounded-lg border border-white/10 bg-[#101722] text-left transition hover:border-[#7C99E3]/40 sm:min-w-0"
                >
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setSelectedImage(testimonial.image)}
                    aria-label={`Open testimonial ${index + 1}`}
                  >
                    <Image
                      src={testimonial.image}
                      alt={`Testimonial ${index + 1}`}
                      width={900}
                      height={1200}
                      className="aspect-[4/5] w-full object-cover transition group-hover:opacity-90"
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 22vw"
                      unoptimized
                    />
                  </button>
                  <div className="border-t border-white/10 p-4">
                    <p className="text-sm leading-6 text-white/80">"{testimonial.quote}"</p>
                    <p className="mt-4 text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="mt-1 text-xs text-white/45">{testimonial.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#7C99E3]/30 bg-[#7C99E3]/10">
              <GraduationCap className="h-6 w-6 text-[#b9c8ff]" aria-hidden />
            </div>
            <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
              Begin vandaag met module 1.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">
              Je gratis account geeft toegang tot module 1 t/m {FREE_MODULE_ORDER_LIMIT}.
              Na je registratie kun je later ook een gratis kennismakingscall inplannen.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCta className="w-full sm:w-auto" />
              <Link
                href="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white sm:w-auto"
              >
                Ik heb al een account
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
                Geen creditcard
              </span>
              <span>Module 1-{FREE_MODULE_ORDER_LIMIT} gratis</span>
              <span>Volledige cursus optioneel</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p>&copy; {new Date().getFullYear()} {BRAND.name} / Cryptoriez</p>
            <p className="max-w-2xl text-xs leading-5 text-white/40">
              Educatieve content, geen financieel of beleggingsadvies. Traden brengt risico's met
              zich mee; resultaten uit het verleden bieden geen garantie voor de toekomst.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Voorwaarden
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Inloggen
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
