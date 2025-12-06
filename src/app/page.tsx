import Link from "next/link";
import { BRAND } from "@/components/ui/Brand";

export default function LandingPage() {
  const modules = [
    {
      title: "Module 1 – Basis van technische analyse",
      description: "De fundamenten van prijsactie, candlesticks en structuur.",
    },
    {
      title: "Module 2 – Markstructuur & trends",
      description: "Leer marktfases herkennen en structureren.",
    },
    {
      title: "Module 3 – Entries & exits",
      description: "Concreet weten waar je in- en uitstapt.",
    },
    {
      title: "Module 4 – Risk & money management",
      description: "Bescherm je kapitaal en denk in probabiliteit.",
    },
    {
      title: "Module 5 – Praktijkcases",
      description: "Echte marktsituaties stap voor stap ontleed.",
    },
    {
      title: "Module 6 – Mentale kant van traden",
      description: "Mindset, discipline en emotionele controle.",
    },
  ];

  const features = [
    {
      title: "Diepgaande videolessen",
      description: "Geen oppervlakkige tips, maar fundamentele kennis met duidelijke voorbeelden.",
    },
    {
      title: "Praktische cases",
      description: "Realistische marktsituaties die stap voor stap doorlopen worden.",
    },
    {
      title: "PDF's & naslagwerk",
      description: "Structuur, checklists en schema's om op terug te vallen.",
    },
    {
      title: "Examen per module",
      description: "Test of je de materie écht begrijpt voordat je verder gaat.",
    },
    {
      title: "Mentorship voor premium leden",
      description: "Toegang tot ervaren traders voor vragen en begeleiding.",
    },
    {
      title: "Progress tracking",
      description: "Zie exact waar je staat en wat je volgende stap is.",
    },
  ];

  const mentors = [
    {
      name: "Rousso",
      role: "Trader & mentor",
      bio: "Meer dan 10 jaar echte marktervaring, met focus op structuur en risico.",
      // TODO: Replace with actual image asset from /public/images/mentors/rousso.jpg
      imageSrc: "/images/mentors/rousso.jpg",
    },
    {
      name: "Jason",
      role: "Trader & mentor",
      bio: "Combineert technische analyse met praktische toepassingen.",
      // TODO: Replace with actual image asset from /public/images/mentors/jason.jpg
      imageSrc: "/images/mentors/jason.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Sticky Topbar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              {BRAND.name}
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 transition"
          >
            Login / Registreer
          </Link>
        </div>
      </header>

      {/* Main Content - with padding to account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Leer traden met structuur en echte expertise
              </h1>
              <p className="text-lg md:text-xl text-slate-600">
                Het complete Nederlandstalige leerplatform voor traders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Maak gratis account
                </Link>
                <a
                  href="#modules"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Bekijk modules
                </a>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {/* TODO: Replace with actual dashboard screenshot from /public/images/dashboard-hero.png */}
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                Dashboard preview
                <br />
                <span className="text-xs">(Image placeholder)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Overview Section */}
        <section id="modules" className="max-w-5xl mx-auto px-4 py-16 md:py-24 bg-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wat je gaat leren
            </h2>
            <p className="text-lg text-slate-600">
              Een complete opleiding in 6 modules
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-slate-600 text-sm">{module.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wat je krijgt in Het Trade Platform
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mentors Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 bg-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Leer van ervaren traders
            </h2>
            <p className="text-lg text-slate-600">
              Persoonlijke begeleiding van professionals met jarenlange marktervaring
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center">
                  {/* TODO: Replace with actual mentor images from /public/images/mentors/ */}
                  <span className="text-2xl font-semibold text-slate-500">
                    {mentor.name[0]}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  {mentor.name}
                </h3>
                <p className="text-sm text-slate-500 mb-3">{mentor.role}</p>
                <p className="text-slate-600 text-sm">{mentor.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Volledige toegang tot Het Trade Platform
              </h2>
              <p className="text-lg text-slate-600">
                Een serieuze, volledige opleiding die je van beginner naar zelfverzekerde trader brengt.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              {/* TODO: Replace placeholder text with actual pricing logic when pricing system is implemented */}
              <div className="text-2xl font-bold text-slate-900 mb-2">
                Éénmalige investering
              </div>
              <p className="text-sm text-slate-500 mb-6">
                (Prijzen worden na inloggen getoond)
              </p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-slate-900 mt-0.5">✓</span>
                  <span className="text-slate-700">Alle modules en videolessen</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-900 mt-0.5">✓</span>
                  <span className="text-slate-700">Praktijkcases & updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-900 mt-0.5">✓</span>
                  <span className="text-slate-700">Examens per module</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-900 mt-0.5">✓</span>
                  <span className="text-slate-700">Toegang tot mentorship (voor premium leden)</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Log in om te upgraden
              </Link>
              <p className="text-xs text-slate-500 mt-4">
                Na inloggen kun je upgraden naar volledige toegang
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                © {BRAND.name} / Cryptoriez – {new Date().getFullYear()}
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Voorwaarden
                </Link>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Dit is geen financieel advies
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
