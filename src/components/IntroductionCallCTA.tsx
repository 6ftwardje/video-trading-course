'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function IntroductionCallCTA() {
  const handleCallClick = () => {
    window.open('https://calendly.com/hettradeplatform/30min', '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold text-white">Gratis kennismakingscall</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">
          Wil je extra uitleg of even sparren?
          <br />
          Je kan een gratis kennismakingscall inplannen met een mentor.
        </p>
        <Button
          onClick={handleCallClick}
          className="w-full bg-[var(--accent)] text-black hover:opacity-90"
        >
          Plan mijn gratis call
        </Button>
      </CardContent>
    </Card>
  )
}
