"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Er ging iets mis");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full space-y-12">
        <div className="flex justify-center mb-8">
          <Image
            src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The Trade Platform white.png"
            alt="The Trade Platform Logo"
            width={300}
            height={60}
            className="h-auto w-auto max-w-full"
            priority
            unoptimized
          />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Leer zelfstandig profitable traden
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dit platform is ontworpen om beginners te helpen bij het opbouwen van consistentie,
            structuur en vertrouwen, zonder afhankelijk te zijn van signalen of giswerk.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Wat krijg je bij volledige toegang?
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base">Toegang tot alle premium updates en marktinzichten</span>
            </li>
            <li className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base">Volledige video course met een duidelijk stappenplan</span>
            </li>
            <li className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base">Praktische trading tools die je dagelijks gebruikt</span>
            </li>
            <li className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base">Mentorship en begeleiding zodat je niet alleen staat</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Eenmalige betaling
              </p>
              <p className="text-5xl font-bold">
                €999
                <span className="text-2xl font-normal text-muted-foreground ml-2">incl. btw</span>
              </p>
              <p className="text-sm text-muted-foreground pt-2">
                Geen abonnement, geen verborgen kosten
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Veilig betalen via Stripe</span>
                <img
                  src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/stripe_logo.png"
                  alt="Stripe"
                  className="h-5 w-auto ml-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-5 px-6 rounded-xl text-primary-foreground font-bold text-xl relative z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
              style={{ 
                background: loading 
                  ? 'rgba(70, 112, 219, 1)' 
                  : 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                backgroundSize: '200% auto',
                animation: loading 
                  ? 'none' 
                  : 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
                boxShadow: loading 
                  ? '0 0 20px rgba(70, 112, 219, 0.4)' 
                  : undefined,
              }}
            >
              <span className="relative z-20">{loading ? "Even geduld…" : "Ontgrendel volledige toegang"}</span>
            </button>
            <div 
              className="absolute inset-0 bg-primary/20 blur-xl rounded-xl -z-0"
              style={{
                animation: loading ? 'none' : 'pulse-glow-bg 2s ease-in-out infinite',
              }}
            ></div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Misschien later, terug naar dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

