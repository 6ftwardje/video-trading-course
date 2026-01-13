'use client';

import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";

export default function TermsPage() {
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
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">Terms of Service</h1>
            <p className="text-sm text-slate-400">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </header>

          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-slate-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">1. Acceptatie van de voorwaarden</h2>
              <p>
                Door gebruik te maken van Het Trade Platform, ga je akkoord met deze Terms of Service. Als je niet
                akkoord gaat met deze voorwaarden, gebruik dan ons platform niet.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">2. Gebruik van het platform</h2>
              <p>Je stemt ermee in om:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Accurate en complete informatie te verstrekken bij registratie</li>
                <li>Je accountgegevens vertrouwelijk te houden</li>
                <li>Het platform alleen te gebruiken voor legale doeleinden</li>
                <li>Geen content te kopiëren of te verspreiden zonder toestemming</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">3. Intellectueel eigendom</h2>
              <p>
                Alle content op Het Trade Platform, inclusief maar niet beperkt tot video's, tekst, afbeeldingen en
                software, is eigendom van Cryptoriez en is beschermd door auteursrechten en andere intellectuele
                eigendomsrechten.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">4. Toegangsniveaus</h2>
              <p>
                Je toegangsniveau wordt bepaald door je mentor. Basis toegang geeft beperkte toegang tot content. Full
                toegang geeft toegang tot alle video's en examens.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">5. Aansprakelijkheid</h2>
              <p>
                Het Trade Platform wordt aangeboden "zoals het is". We zijn niet aansprakelijk voor eventuele schade
                voortvloeiend uit het gebruik of het onvermogen om het platform te gebruiken.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">6. Wijzigingen</h2>
              <p>
                We behouden ons het recht voor om deze Terms of Service op elk moment te wijzigen. Wijzigingen worden
                effectief zodra ze op deze pagina worden gepubliceerd.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">7. Contact</h2>
              <p>
                Voor vragen over deze Terms of Service, neem contact op met ons via:{' '}
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
