'use client'

import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'

/**
 * Animated topographic lines — viewport-fixed so the pattern reaches y=0 and sits under the navbar.
 */
export default function ContactTopographicBackground() {
  return (
    <PreloaderTopographicBackdrop isFadingOut={false} fullPage />
  )
}
