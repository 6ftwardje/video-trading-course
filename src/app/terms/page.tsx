import Container from '@/components/ui/Container'

export const metadata = {
  title: 'Terms of Service | Het Trade Platform',
  description: 'Terms of Service voor Het Trade Platform',
}

export default function TermsPage() {
  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="text-sm text-[var(--text-dim)]">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[var(--text-dim)]">
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
              <a href="mailto:info@hettradeplatform.be" className="text-[var(--accent)] hover:underline">
                info@hettradeplatform.be
              </a>
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
