import Container from '@/components/ui/Container'

export const metadata = {
  title: 'Cookie Policy | Het Trade Platform',
  description: 'Cookie Policy voor Het Trade Platform',
}

export default function CookiesPage() {
  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cookie Policy</h1>
          <p className="text-sm text-[var(--text-dim)]">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[var(--text-dim)]">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Wat zijn cookies?</h2>
            <p>
              Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je een website bezoekt.
              Ze helpen websites om te onthouden wie je bent en je voorkeuren.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Hoe gebruiken we cookies?</h2>
            <p>We gebruiken cookies voor de volgende doeleinden:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-white">Essentiële cookies:</strong> Noodzakelijk voor het functioneren van het
                platform (bijv. authenticatie)
              </li>
              <li>
                <strong className="text-white">Functionele cookies:</strong> Onthouden je voorkeuren en instellingen
              </li>
              <li>
                <strong className="text-white">Analytische cookies:</strong> Helpen ons begrijpen hoe gebruikers het
                platform gebruiken
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Cookies van derden</h2>
            <p>
              We gebruiken diensten van derden die cookies kunnen plaatsen, zoals Supabase voor authenticatie en
              Vimeo voor video streaming. Deze partijen hebben hun eigen privacy- en cookiebeleid.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Cookie-instellingen</h2>
            <p>
              Je kunt cookies beheren via de instellingen van je browser. Houd er rekening mee dat het uitschakelen van
              essentiële cookies het functioneren van het platform kan beïnvloeden.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Contact</h2>
            <p>
              Voor vragen over deze Cookie Policy, neem contact op met ons via:{' '}
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





