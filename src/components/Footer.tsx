import Container from "@/components/ui/Container";
import { BRAND } from "@/components/ui/Brand";
import Image from "next/image";
import Link from "next/link";

export default function Footer(){
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg)]">
      <Container className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <div className="flex items-center">
            <Image src={BRAND.logoWithTextUrl} alt="Het Trade Platform Logo" width={232} height={40} className="h-10 w-auto"/>
          </div>
          <p className="text-[var(--text-dim)]">Professioneel leerplatform voor traders.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white/90">Platform</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/" className="hover:text-[var(--accent)]">Dashboard</Link></li>
            <li><Link href="/module/1" className="hover:text-[var(--accent)]">Modules</Link></li>
            <li><Link href="/mentorship" className="hover:text-[var(--accent)]">Mentorship</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white/90">Hulp</h4>
          <ul className="space-y-2 text-white/80">
            <li>
              <a href="mailto:info@hettradeplatform.be" className="hover:text-[var(--accent)]">
                info@hettradeplatform.be
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white/90">Legal</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/terms" className="hover:text-[var(--accent)]">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--accent)]">Privacy</Link></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-[var(--border)]">
        <Container className="py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-dim)]">
          <span>© {new Date().getFullYear()} Cryptoriez. Alle rechten voorbehouden.</span>
        </Container>
      </div>
    </footer>
  );
}

