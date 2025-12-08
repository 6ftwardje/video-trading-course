'use client';

import Link from "next/link";
import Image from "next/image";
import { BRAND, BrandLogo } from "@/components/ui/Brand";
import { ArrowRight } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#1a1f2e] to-[#0B0F17] text-white font-sans flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-1000">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BrandLogo className="text-white" />
        </div>

        {/* Coming Soon Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#4670db] to-[#6b8af0] bg-clip-text text-transparent">
            Binnenkort beschikbaar
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-xl mx-auto">
            We werken hard aan een geweldige nieuwe ervaring voor je.
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#4670db] to-transparent mx-auto my-8" />

        {/* Existing Students Section */}
        <div className="space-y-6">
          <p className="text-lg text-slate-400">
            Ben je al student? Log in om toegang te krijgen tot je dashboard.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#4670db] text-white font-semibold hover:bg-[#3a5fc7] transition-all duration-200 shadow-lg shadow-[#4670db]/20 hover:shadow-[#4670db]/40 hover:scale-105"
          >
            Inloggen
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {BRAND.name} / Cryptoriez
          </p>
        </div>
      </div>
    </div>
  );
}
