import Container from '@/components/ui/Container'

export const metadata = {
  title: 'Privacy Policy | Het Trade Platform',
  description: 'Privacy Policy voor Het Trade Platform',
}

export default function PrivacyPage() {
  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-[var(--text-dim)]">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[var(--text-dim)]">
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
