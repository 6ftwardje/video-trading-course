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
  "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/1.webp",
  "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/2.webp",
  "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/3.webp",
  "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/4.webp",
];

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
    copy: "Behaal het examen om de volgende module vrij te spelen.",
  },
];

const floatingModules = [
  { number: 1, title: "Module 1", subtitle: "Introductie en basisbegrippen", progress: 94 },
  { number: 2, title: "Module 2", subtitle: "Wat is traden echt?", progress: 76 },
  { number: 3, title: "Module 3", subtitle: "Mindset deel I", progress: 58 },
];

const lockedModules = [
  { number: 4, title: "Marktbewegingen en price action", progress: 34 },
  { number: 5, title: "Technische analyse deel I", progress: 18 },
  { number: 6, title: "Technische analyse deel II", progress: 7 },
];

const WHY_IT_WORKS_PHOTO_PLACEHOLDER =
  "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/section_human.webp";

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/login?mode=register"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7C99E3] px-5 py-3 text-sm font-bold text-[#05070c] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C99E3] focus:ring-offset-2 focus:ring-offset-[#0B0F17] active:scale-[0.99] sm:px-6 ${className}`}
    >
      Maak gratis account
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

function FloatingModuleCard({
  number,
  title,
  subtitle,
  progress,
  badge = "Gratis",
  decorative = false,
}: {
  number: number;
  title: string;
  subtitle: string;
  progress: number;
  badge?: string;
  decorative?: boolean;
}) {
  return (
    <div
      className={`w-[220px] rounded-2xl border border-[rgba(130,160,255,0.2)] bg-[rgba(11,16,28,0.72)] p-3 shadow-[0_12px_30px_rgba(49,91,212,0.18)] backdrop-blur-xl ${
        decorative ? "opacity-30 blur-[1px]" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7C99E3]/20 text-[11px] font-semibold text-[#c5d3ff]">
          {number}
        </span>
        <p className="text-xs font-semibold text-white">{title}</p>
      </div>
      <p className="text-[11px] text-white/70">{subtitle}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
          {badge}
        </span>
        <span className="text-[10px] font-semibold text-white/80">{progress}%</span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#7C99E3]" style={{ width: `${progress}%` }} />
      </div>
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
              Start gratis
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate overflow-hidden">

          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 pb-8 pt-10 sm:px-6 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(520px,1.05fr)] lg:gap-10 lg:px-8 lg:py-14">
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
                  <span className="block">Start gratis</span>
                  <span className="block">met de eerste</span>
                  <span className="block text-[#7C99E3]">{FREE_MODULE_ORDER_LIMIT} modules.</span>
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                  Maak een gratis account en krijg direct toegang tot de basis van traden,
                  inclusief lessen, praktijkvoorbeelden en examens. Geen creditcard nodig.
                </p>
              </div>

              <div className="space-y-3">
                <PrimaryCta className="w-full sm:w-auto" />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-white/60 sm:text-sm">
                  <TrustPoint>Direct toegang</TrustPoint>
                  <TrustPoint>Geen creditcard</TrustPoint>
                  <TrustPoint>Examens inbegrepen</TrustPoint>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-4 sm:max-w-lg sm:gap-4">
                <StatItem value={`${FREE_MODULE_ORDER_LIMIT}`} label="gratis modules" />
                <StatItem value="0 euro" label="om te starten" />
                <StatItem value="75%" label="examen target" />
              </div>
            </motion.div>

            <div className="relative hidden h-full min-h-[560px] items-center lg:flex" aria-hidden>
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-10 top-24 h-56 w-56 rounded-full bg-[#3764d8]/22 blur-[78px]" />
                <div className="absolute left-44 top-52 h-72 w-72 rounded-full bg-[#3f6de6]/18 blur-[96px]" />
                <div className="absolute left-24 top-[23.5rem] h-64 w-64 rounded-full bg-[#2f57c0]/14 blur-[88px]" />
              </div>

              {floatingModules.map((item, index) => {
                const positions = [
                  "left-0 top-12",
                  "left-40 top-40",
                  "left-16 top-[17.8rem]",
                ];
                return (
                  <motion.div
                    key={item.number}
                    className={`pointer-events-none absolute z-10 ${positions[index]}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            opacity: 1,
                            y: [0, -7, 0],
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? {}
                        : {
                            opacity: { duration: 0.35, delay: 0.1 + index * 0.08 },
                            y: {
                              duration: 4.8 + index * 0.45,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.25,
                            },
                          }
                    }
                  >
                    <FloatingModuleCard
                      number={item.number}
                      title={item.title}
                      subtitle={item.subtitle}
                      progress={item.progress}
                    />
                  </motion.div>
                );
              })}

              {lockedModules.map((item, index) => {
                const positions = [
                  "left-44 top-[20.5rem]",
                  "left-[17.5rem] top-[27rem]",
                  "left-10 top-[31rem]",
                ];
                return (
                  <motion.div
                    key={item.title}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1 }}
                    transition={{ delay: 0.24 + index * 0.08, duration: 0.4 }}
                    className={`pointer-events-none absolute z-0 ${positions[index]}`}
                  >
                    <div className="relative">
                      <FloatingModuleCard
                        number={item.number}
                        title={`Module ${item.number}`}
                        subtitle={item.title}
                        progress={item.progress}
                        badge="Preview"
                        decorative
                      />
                      <LockKeyhole className="absolute right-3 top-3 h-3.5 w-3.5 text-white/40" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
              className="h-full w-full bg-cover bg-center opacity-[0.2] lg:bg-fixed"
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
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="space-y-5">
              <SectionLabel className="text-[#F79939]">Gemaakt met Cryptoriez</SectionLabel>
              <h2 className="max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                Trading educatie voor NL en BE.
              </h2>
              <p className="max-w-xl text-base leading-7 text-white/70">
                Het Trade Platform is ontwikkeld in samenwerking met Cryptoriez:
                een educatief kanaal dat trading helder en praktisch uitlegt.
              </p>
              <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                <div>
                  <p className="text-2xl font-bold text-[#F79939]">4600+</p>
                  <p className="text-xs text-white/50">abonnees</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#F79939]">400+</p>
                  <p className="text-xs text-white/50">video's</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#F79939]">NL/BE</p>
                  <p className="text-xs text-white/50">focus</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/lUIUlcHAr1o"
                  title="Cryptoriez video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
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
                <button
                  key={testimonial}
                  type="button"
                  className="group relative min-w-[78%] snap-center overflow-hidden rounded-lg border border-white/10 bg-[#101722] text-left transition hover:border-[#7C99E3]/40 sm:min-w-0"
                  onClick={() => setSelectedImage(testimonial)}
                  aria-label={`Open testimonial ${index + 1}`}
                >
                  <Image
                    src={testimonial}
                    alt={`Testimonial ${index + 1}`}
                    width={900}
                    height={1200}
                    className="h-auto w-full object-cover transition group-hover:opacity-90"
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 22vw"
                    unoptimized
                  />
                </button>
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
          <p>&copy; {new Date().getFullYear()} {BRAND.name} / Cryptoriez</p>
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
