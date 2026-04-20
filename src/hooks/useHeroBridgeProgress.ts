'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'

/**
 * Framer `useScroll({ target })` is unreliable on some client navigations.
 * Derives 0→1 progress while the bridge element spans the scroll range (same geometry as `["start start","end start"]`).
 */
export function useHeroBridgeProgress(
  bridgeRef: RefObject<HTMLDivElement | null>,
  active: boolean,
  /** Remeasure after client-side navigations (same ref instance can persist). */
  layoutKey: string
): MotionValue<number> {
  const progress = useMotionValue(0)

  useLayoutEffect(() => {
    if (!active) {
      progress.set(0)
      return
    }

    const update = () => {
      const node = bridgeRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const sy = window.scrollY
      const topDocument = rect.top + sy
      const h = node.offsetHeight
      if (h <= 0) return
      const p = (sy - topDocument) / h
      progress.set(Math.min(1, Math.max(0, p)))
    }

    update()
    const raf = requestAnimationFrame(update)

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    const el = bridgeRef.current
    if (el) ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [active, bridgeRef, progress, layoutKey])

  return progress
}
