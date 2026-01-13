import Container from '@/components/ui/Container'

export const metadata = {
  title: 'Refund & Cancellation Policy | Het Trade Platform',
  description: 'Refund & Cancellation Policy voor Het Trade Platform',
}

export default function RefundsPage() {
  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Refund & Cancellation Policy</h1>
          <p className="text-sm text-[var(--text-dim)]">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[var(--text-dim)]">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Annulering</h2>
            <p>
              Je kunt je account op elk moment annuleren door contact op te nemen met support. Annulering heeft geen
              invloed op je toegang tot reeds gekochte content, tenzij anders vermeld.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Restitutiebeleid</h2>
            <p>
              Restituties worden beoordeeld op case-by-case basis. Neem contact op met support binnen 14 dagen na
              aankoop om een restitutieverzoek in te dienen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Restitutievoorwaarden</h2>
            <p>Restituties kunnen worden verleend in de volgende gevallen:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Technische problemen die het gebruik van het platform verhinderen</li>
              <li>Onjuiste informatie over de dienst</li>
              <li>Andere omstandigheden zoals bepaald door support</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Verwerkingstijd</h2>
            <p>
              Goedgekeurde restituties worden binnen 5-10 werkdagen verwerkt. De tijd die nodig is om het bedrag op je
              rekening te zien, kan variëren afhankelijk van je bank.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Contact</h2>
            <p>
              Voor vragen over restituties of annuleringen, neem contact op met ons via:{' '}
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






