'use client'

import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'
import PreloaderTopographicCenterBlur from '@/components/ui/PreloaderTopographicCenterBlur'

/**
 * Animated topographic lines — viewport-fixed so the pattern reaches y=0 and sits under the navbar.
 */
export default function ContactTopographicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <PreloaderTopographicBackdrop isFadingOut={false} fullPage />
      <PreloaderTopographicCenterBlur isFadingOut={false} />
    </div>
  )
}
