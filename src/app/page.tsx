import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";
import { Header } from "@/components/ui/header-2";
import { Gallery4, type Gallery4Item } from "@/components/ui/gallery4";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Footer } from "@/components/ui/footer";
import { 
  Video, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Users, 
  TrendingUp,
  Youtube,
  Instagram
} from "lucide-react";

export default function LandingPage() {
  const modules: Gallery4Item[] = [
    {
      id: "module-1",
      title: "Module 1 – Basis van technische analyse",
      description: "De fundamenten van prijsactie, candlesticks en structuur.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "module-2",
      title: "Module 2 – Markstructuur & trends",
      description: "Leer marktfases herkennen en structureren.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "module-3",
      title: "Module 3 – Entries & exits",
      description: "Concreet weten waar je in- en uitstapt.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "module-4",
      title: "Module 4 – Risk & money management",
      description: "Bescherm je kapitaal en denk in probabiliteit.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "module-5",
      title: "Module 5 – Praktijkcases",
      description: "Echte marktsituaties stap voor stap ontleed.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "module-6",
      title: "Module 6 – Mentale kant van traden",
      description: "Mindset, discipline en emotionele controle.",
      href: "#modules",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    },
  ];

  const features = [
    {
      Icon: Video,
      name: "Diepgaande videolessen",
      description: "Geen oppervlakkige tips, maar fundamentele kennis met duidelijke voorbeelden.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#4670db]/30 via-[#5a7de8]/20 to-[#0e1b4d]/40"
        />
      ),
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: Briefcase,
      name: "Praktische cases",
      description: "Realistische marktsituaties die stap voor stap doorlopen worden.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#0e1b4d]/40 via-[#4670db]/30 to-[#6b8af0]/20"
        />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: FileText,
      name: "PDF's & naslagwerk",
      description: "Structuur, checklists en schema's om op terug te vallen.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-[#4670db]/25 to-[#0e1b4d]/35"
        />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: GraduationCap,
      name: "Examen per module",
      description: "Test of je de materie écht begrijpt voordat je verder gaat.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#0e1b4d]/35 via-[#4670db]/30 to-[#5a7de8]/25"
        />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Users,
      name: "Mentorship voor premium leden",
      description: "Toegang tot ervaren traders voor vragen en begeleiding.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-tl from-[#4670db]/30 via-[#0e1b4d]/40 to-[#4670db]/30"
        />
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
    {
      Icon: TrendingUp,
      name: "Progress tracking",
      description: "Zie exact waar je staat en wat je volgende stap is.",
      background: (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#0e1b4d]/40 via-[#4670db]/35 via-[#5a7de8]/30 to-[#0e1b4d]/40"
        />
      ),
      className: "lg:col-span-3 lg:row-start-4 lg:row-end-5",
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
    <div 
      className="min-h-screen bg-white text-slate-900 font-sans"
      style={{
        '--background': '255 255 255',
        '--foreground': '15 23 42',
        '--border': '226 232 240',
        '--primary': '70 112 219',
        '--primary-foreground': '255 255 255',
        '--secondary': '241 245 249',
        '--secondary-foreground': '15 23 42',
        '--accent': '241 245 249',
        '--accent-foreground': '15 23 42',
        '--ring': '70 112 219',
        '--input': '226 232 240',
      } as React.CSSProperties}
    >
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 font-sans">
                Leer traden met structuur en echte expertise
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-sans">
                Het complete Nederlandstalige leerplatform voor traders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#4670db] text-white font-semibold hover:bg-[#3a5fc7] transition font-sans"
                >
                  Maak gratis account
                </Link>
                <a
                  href="#modules"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-[#4670db] text-[#4670db] font-medium hover:bg-[#4670db]/10 transition font-sans"
                >
                  Bekijk modules
                </a>
              </div>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg">
              <Image
                src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/dashboard_main_new.webp"
                alt="Het Trade Platform Dashboard"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Modules Overview Section */}
        <section id="modules" className="bg-slate-50">
          <Gallery4
            title="Wat je gaat leren"
            description="Een complete opleiding in 6 modules"
            items={modules}
          />
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-sans">
              Wat je krijgt in Het Trade Platform
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-sans">
              Een compleet leerplatform met alles wat je nodig hebt om succesvol te leren traden
            </p>
          </div>
          <BentoGrid className="lg:grid-rows-5">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </section>

        {/* Mentors Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 bg-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-sans">
              Leer van ervaren traders
            </h2>
            <p className="text-lg text-slate-600 font-sans">
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
                <h3 className="text-xl font-semibold text-slate-900 mb-1 font-sans">
                  {mentor.name}
                </h3>
                <p className="text-sm text-slate-500 mb-3 font-sans">{mentor.role}</p>
                <p className="text-slate-600 text-sm font-sans">{mentor.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-sans">
                Volledige toegang tot Het Trade Platform
              </h2>
              <p className="text-lg text-slate-600 font-sans">
                Een serieuze, volledige opleiding die je van beginner naar zelfverzekerde trader brengt.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              {/* TODO: Replace placeholder text with actual pricing logic when pricing system is implemented */}
              <div className="text-2xl font-bold text-slate-900 mb-2 font-sans">
                Éénmalige investering
              </div>
              <p className="text-sm text-slate-500 mb-6 font-sans">
                (Prijzen worden na inloggen getoond)
              </p>
              <ul className="space-y-3 text-left mb-8 font-sans">
                <li className="flex items-start gap-3">
                  <span className="text-[#4670db] mt-0.5 font-sans">✓</span>
                  <span className="text-slate-700 font-sans">Alle modules en videolessen</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4670db] mt-0.5 font-sans">✓</span>
                  <span className="text-slate-700 font-sans">Praktijkcases & updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4670db] mt-0.5 font-sans">✓</span>
                  <span className="text-slate-700 font-sans">Examens per module</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4670db] mt-0.5 font-sans">✓</span>
                  <span className="text-slate-700 font-sans">Toegang tot mentorship (voor premium leden)</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-[#4670db] text-white font-semibold hover:bg-[#3a5fc7] transition font-sans"
              >
                Log in om te upgraden
              </Link>
              <p className="text-xs text-slate-500 mt-4 font-sans">
                Na inloggen kun je upgraden naar volledige toegang
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer
          logo={
            <Image
              src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The%20Trade%20Platform.webp"
              alt="Het Trade Platform"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          }
          brandName={BRAND.name}
          socialLinks={[
            {
              icon: <Youtube className="h-5 w-5" />,
              href: "https://youtube.com",
              label: "Youtube",
            },
            {
              icon: <Instagram className="h-5 w-5" />,
              href: "https://instagram.com",
              label: "Instagram",
            },
          ]}
          mainLinks={[
            { href: "#modules", label: "Modules" },
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
          ]}
          legalLinks={[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Voorwaarden" },
          ]}
          copyright={{
            text: `© ${new Date().getFullYear()} ${BRAND.name} / Cryptoriez`,
            license: "Dit is geen financieel advies",
          }}
        />
      </main>
    </div>
  );
}
