    'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Check icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#7C99E3]/20 border border-[#7C99E3]/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#7C99E3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#7C99E3] mb-3">
          Je e-mailadres is bevestigd!
        </h1>

        {/* Text */}
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Bedankt voor je bevestiging.  
          Je account is nu actief en klaar om in te loggen.  
          Gebruik je e-mailadres om toegang te krijgen tot het Trade Platform.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#7C99E3] text-black font-semibold rounded-md hover:opacity-90 transition"
          >
            Ga naar login
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#7C99E3]/90 transition"
          >
            Terug naar homepagina
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

