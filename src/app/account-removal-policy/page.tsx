import Container from '@/components/ui/Container'

export const metadata = {
  title: 'Account Removal Policy | Het Trade Platform',
  description: 'Account Removal Policy voor Het Trade Platform',
}

export default function AccountRemovalPolicyPage() {
  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Account Removal Policy</h1>
          <p className="text-sm text-[var(--text-dim)]">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[var(--text-dim)]">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Accountverwijdering verzoek</h2>
            <p>
              Je kunt op elk moment een verzoek indienen om je account te verwijderen via de Account & Security Center
              of door rechtstreeks contact op te nemen met support.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Soft Delete proces</h2>
            <p>
              Accountverwijdering is een "soft delete" proces. Dit betekent dat je account wordt gedeactiveerd, maar
              bepaalde gegevens kunnen worden bewaard voor administratieve, juridische of fraudepreventie doeleinden.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Behouden gegevens</h2>
            <p>De volgende gegevens kunnen worden bewaard na accountverwijdering:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Voortgangsgegevens (voor administratieve doeleinden)</li>
              <li>Examenresultaten (voor certificering en verificatie)</li>
              <li>Transactiegegevens (voor boekhouding en belastingdoeleinden)</li>
              <li>Communicatiegeschiedenis (voor klantenservice doeleinden)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Verwerkingstijd</h2>
            <p>
              Accountverwijderingsverzoeken worden binnen 48 uur beoordeeld. Je ontvangt een bevestiging zodra je
              account is gedeactiveerd. Volledige verwijdering van alle gegevens kan tot 30 dagen duren, afhankelijk van
              de complexiteit van je account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Gevolgen van verwijdering</h2>
            <p>
              Na accountverwijdering verlies je toegang tot alle content en diensten. Je kunt je account niet
              herstellen na verwijdering. Als je later opnieuw toegang wilt, moet je een nieuw account aanmaken.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Contact</h2>
            <p>
              Voor vragen over accountverwijdering, neem contact op met ons via:{' '}
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






