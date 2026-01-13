'use client';

import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#1a1f2e] to-[#0B0F17] text-white font-sans">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-800/50 bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Image 
                src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The Trade Platform white.png"
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

      {/* Content Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-400">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </header>

          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-slate-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">1. Inleiding</h2>
              <p>
                Deze Privacy Policy beschrijft hoe Het Trade Platform ("wij", "ons", "onze") persoonlijke gegevens
                verzamelt, gebruikt en beschermt wanneer je gebruik maakt van ons platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">2. Gegevens die we verzamelen</h2>
              <p>We verzamelen de volgende soorten gegevens:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Accountgegevens (naam, e-mailadres)</li>
                <li>Gebruiksgegevens (voortgang, bekeken lessen)</li>
                <li>Technische gegevens (IP-adres, browser type)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">3. Hoe we je gegevens gebruiken</h2>
              <p>We gebruiken je gegevens om:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Je account te beheren en je toegang te verlenen</li>
                <li>Je voortgang bij te houden</li>
                <li>Je te informeren over belangrijke updates</li>
                <li>Onze diensten te verbeteren</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">4. Gegevensbescherming</h2>
              <p>
                We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen tegen
                ongeautoriseerde toegang, verlies of vernietiging.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">5. Je rechten</h2>
              <p>Je hebt het recht om:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Toegang te krijgen tot je persoonlijke gegevens</li>
                <li>Je gegevens te corrigeren</li>
                <li>Verwijdering van je gegevens te verzoeken</li>
                <li>Bezwaar te maken tegen verwerking</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">6. Contact</h2>
              <p>
                Voor vragen over deze Privacy Policy, neem contact op met ons via:{' '}
                <a href="mailto:info@hettradeplatform.be" className="text-[#7C99E3] hover:underline">
                  info@hettradeplatform.be
                </a>
              </p>
            </section>
          </div>
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
