'use client'

import { memo } from 'react'

/** Softens topographic lines in the viewport center via masked backdrop-filter */
function PreloaderTopographicCenterBlurImpl({ isFadingOut }: { isFadingOut: boolean }) {
  return (
    <div
      aria-hidden
      className="preloader-topo-radial-blur pointer-events-none absolute inset-0 z-[1] transition-opacity duration-1000 ease-in-out"
      style={{ opacity: isFadingOut ? 0 : 1 }}
    />
  )
}

const PreloaderTopographicCenterBlur = memo(PreloaderTopographicCenterBlurImpl)
export default PreloaderTopographicCenterBlur
