'use client'

import { memo, useEffect, useState } from 'react'

interface PreloaderTopographicBackdropProps {
  isFadingOut: boolean
  /** Pause expensive stroke-dash animations (last moments before overlay hides). */
  pauseLineAnimation?: boolean
  /**
   * Stretch the SVG to the full scroll height of the page (top-aligned).
   * Default preloader mode centers a ~100vh-tall graphic — that leaves white gaps on long pages.
   */
  fullPage?: boolean
}

const TOPO_SVG_URL = '/topo-preloader.svg'

// Module-level promise + markup cache so every mount across the app shares a single
// network request. The SVG is ~65 KB so we keep it out of the JS bundle entirely;
// the browser caches the response per normal HTTP rules.
let svgMarkupPromise: Promise<string> | null = null
let svgMarkupCache: string | null = null

function loadTopoSvg(): Promise<string> {
  if (svgMarkupCache) return Promise.resolve(svgMarkupCache)
  if (svgMarkupPromise) return svgMarkupPromise
  svgMarkupPromise = fetch(TOPO_SVG_URL, { cache: 'force-cache' })
    .then((r) => (r.ok ? r.text() : ''))
    .then((text) => {
      svgMarkupCache = text
      return text
    })
    .catch(() => {
      // Soft-fail: empty string renders a blank backdrop (preloader still has globe + ring).
      svgMarkupCache = ''
      return ''
    })
  return svgMarkupPromise
}

/** CodePen coffeecircle/YqdWpW topographic line animation — adapted for a white preloader canvas */
function PreloaderTopographicBackdropImpl({
  isFadingOut,
  pauseLineAnimation = false,
  fullPage = false,
}: PreloaderTopographicBackdropProps) {
  const [markup, setMarkup] = useState<string>(() => svgMarkupCache ?? '')

  useEffect(() => {
    if (markup) return
    let mounted = true
    loadTopoSvg().then((text) => {
      if (mounted && text) setMarkup(text)
    })
    return () => {
      mounted = false
    }
  }, [markup])

  return (
    <div
      className={`preloader-topographic pointer-events-none z-0 transition-opacity duration-1000 ease-in-out isolate ${
        pauseLineAnimation ? 'preloader-topographic--drain ' : ''
      }${
        fullPage
          ? 'preloader-topographic--full-page fixed'
          : 'absolute inset-0 flex items-center justify-center overflow-hidden'
      }`}
      style={{ opacity: isFadingOut ? 0 : 1 }}
      aria-hidden
      // eslint-disable-next-line react/no-danger -- SVG is a static public asset fetched once and cached.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

const PreloaderTopographicBackdrop = memo(PreloaderTopographicBackdropImpl)
export default PreloaderTopographicBackdrop
