"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { useStudent } from "@/components/StudentProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";

const includedItems = [
  "Alle modules na de gratis startmodules",
  "Volledige video course op jouw tempo",
  "Examens en praktijklessen om stap voor stap te advancen",
  "Cursusmateriaal en platform updates zodra ze beschikbaar zijn",
];

const unlockItems = [
  {
    icon: Video,
    title: "Volledige course",
    text: "Ga verder dan de gratis modules en volg het complete traject in de juiste volgorde.",
  },
  {
    icon: BookOpenCheck,
    title: "Examens blijven de route",
    text: "Je behoudt dezelfde structuur: lessen bekijken, examen maken en pas dan verder.",
  },
  {
    icon: MessageCircle,
    title: "Duidelijke vervolgstap",
    text: "Wil je naast de course extra begeleiding? Dan kan je nog steeds een gratis call inplannen.",
  },
];

const faqItems = [
  {
    question: "Is dit een abonnement?",
    answer: "Nee. De upgrade is een eenmalige betaling voor volledige toegang tot de video course.",
  },
  {
    question: "Wat gebeurt er met mijn gratis voortgang?",
    answer: "Je account en voortgang blijven behouden. Na betaling wordt je toegang opgewaardeerd.",
  },
  {
    question: "Is dit hetzelfde als mentorship?",
    answer: "Nee. Dit ontgrendelt de volledige zelfstandige course. Voor persoonlijke begeleiding kan je een gratis call plannen.",
  },
];

export default function UpgradePage() {
  const { student, status } = useStudent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessLevel = student?.access_level ?? 1;
  const hasFullAccess = accessLevel >= 2;
  const firstName = (student?.name || student?.email || "Student").split("@")[0].split(" ")[0];

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setLoading(false);
    }
  };

  const handleCallClick = () => {
    window.open("https://calendly.com/hettradeplatform/30min", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] px-4 pb-20 pt-6 text-white sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/65 transition hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Terug naar dashboard
          </Link>
          <ThemeToggle className="w-full max-w-[220px] sm:w-[220px]" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start">
          <main className="space-y-8">
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101722]/80 p-5 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="theme-logo-plate">
                    <Image
                      src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The Trade Platform white.png"
                      alt="The Trade Platform"
                      width={220}
                      height={44}
                      className="h-auto w-44 sm:w-56"
                      priority
                      unoptimized
                    />
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#7C99E3]/35 bg-[#7C99E3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b9c8ff]">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Upgrade naar volledige toegang
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {hasFullAccess ? (
                      <>Je volledige cursus is actief, {firstName}.</>
                    ) : (
                      <>
                        Ontgrendel de volledige video course.
                      </>
                    )}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
                    Je gratis modules geven je de start. Met volledige toegang ga je verder door de rest van
                    het traject, inclusief alle modules, examens en praktijklessen binnen Het Trade Platform.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-2xl font-semibold text-white">1x</p>
                    <p className="mt-1 text-xs text-white/50">betaling</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-2xl font-semibold text-white">Alle</p>
                    <p className="mt-1 text-xs text-white/50">modules</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-2xl font-semibold text-white">Stripe</p>
                    <p className="mt-1 text-xs text-white/50">veilig betalen</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {unlockItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-[#101722]/70 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C99E3]/12 text-[#b9c8ff]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
                  </div>
                );
              })}
            </section>

            <section className="rounded-xl border border-white/10 bg-[#101722]/70 p-5 sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Wat je ontgrendelt</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    Van gratis start naar volledig leertraject.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    De manier van werken blijft hetzelfde: eerst begrijpen, dan toepassen, daarna pas door naar de volgende stap.
                  </p>
                </div>
                <div className="grid gap-3 sm:min-w-[360px]">
                  {includedItems.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-white/[0.03] p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9fb5ff]" aria-hidden />
                      <span className="text-sm leading-6 text-white/72">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {faqItems.map((item) => (
                <div key={item.question} className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{item.answer}</p>
                </div>
              ))}
            </section>
          </main>

          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-xl border border-[#7C99E3]/30 bg-[#101722] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
              <div className="border-b border-white/10 bg-[#7C99E3]/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9c8ff]">Volledige toegang</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">The Trade Platform</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#7C99E3]/15 text-[#b9c8ff]">
                    <LockKeyhole className="h-5 w-5" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div>
                  <p className="text-sm text-white/55">Eenmalige betaling</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight text-white">€999</span>
                    <span className="pb-2 text-sm text-white/45">incl. btw</span>
                  </div>
                  <p className="mt-2 text-sm text-white/50">Geen abonnement. Geen verborgen kosten.</p>
                </div>

                <div className="mt-6 space-y-3">
                  {includedItems.slice(0, 3).map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9fb5ff]" aria-hidden />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {hasFullAccess ? (
                  <Link
                    href="/dashboard"
                    className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
                  >
                    Ga naar je dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : status === "unauthenticated" ? (
                  <Link
                    href="/login?redirectedFrom=%2Fupgrade"
                    className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
                  >
                    Log in om te upgraden
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={loading || status === "loading"}
                    className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(90deg,#4670db_0%,#7c99e3_50%,#4670db_100%)] bg-[length:200%_auto] px-5 py-3 text-sm font-bold text-white shadow-[0_0_34px_rgba(70,112,219,0.42)] transition hover:scale-[1.01] hover:shadow-[0_0_46px_rgba(124,153,227,0.58)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ animation: loading ? "none" : "shine 3s linear infinite, pulse-glow 2.4s ease-in-out infinite" }}
                  >
                    <CreditCard className="h-4 w-4" aria-hidden />
                    {loading ? "Checkout openen..." : "Ontgrendel volledige toegang"}
                  </button>
                )}

                {error && (
                  <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                    {error}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-white/48">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  <span>Veilig betalen via Stripe</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#b9c8ff]">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Twijfel je tussen course en mentorship?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Plan gratis een call en bespreek welke route het best bij je ervaring past.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCallClick}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#7C99E3]/35 bg-[#7C99E3]/10 px-4 py-2.5 text-sm font-semibold text-[#b9c8ff] transition hover:bg-[#7C99E3]/20"
              >
                Plan gratis call
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
