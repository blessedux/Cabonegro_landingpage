'use client'

import { useEffect, useRef, useState } from 'react'

/** Duration of the CSS opacity transition on the preloader surface (ms). */
const FADE_OUT_MS = 1000

/** Shortest time the preloader stays fully visible before fading (ms). */
const MIN_DISPLAY_MS = 200

/** Upper bound for the "waiting on parent" branch: parent never called hide (ms). */
const EXTERNAL_HIDE_SAFETY_MS = 5000

export interface UsePreloaderFadeOptions {
  /** Hydration-only boot; parent unmounts us, no internal timers. */
  bootOnly: boolean
  /** Inline variant (page-scoped, not full-screen). Parent controls lifetime. */
  inline: boolean
  /**
   * true  → auto-hide after `duration`, fade out, then call onComplete.
   * false → just run a safety timer and call onComplete so parent can hide us.
   */
  shouldAutoHide: boolean
  /** Intended display time in seconds (applies when shouldAutoHide=true). */
  duration: number
  onComplete?: () => void
}

export interface UsePreloaderFadeState {
  isVisible: boolean
  isFadingOut: boolean
}

/**
 * Owns the preloader overlay lifecycle (visible → fading → hidden + onComplete).
 * Consolidates what used to be four overlapping timers inside `preloader-b.tsx`
 * so cleanup is trivially correct and branches are easy to reason about.
 */
export function usePreloaderFade({
  bootOnly,
  inline,
  shouldAutoHide,
  duration,
  onComplete,
}: UsePreloaderFadeOptions): UsePreloaderFadeState {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const hasStartedFadeRef = useRef(false)
  // Latest onComplete without re-running the timer effect.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (bootOnly || inline) return

    const timers: number[] = []
    const rafs: number[] = []

    const callComplete = () => {
      const cb = onCompleteRef.current
      if (!cb) return
      rafs.push(requestAnimationFrame(cb))
    }

    const triggerFade = () => {
      if (hasStartedFadeRef.current) return
      hasStartedFadeRef.current = true
      setIsFadingOut(true)
      timers.push(
        window.setTimeout(() => {
          setIsVisible(false)
          callComplete()
        }, FADE_OUT_MS),
      )
    }

    if (!shouldAutoHide) {
      // Parent decides when to hide. Safety timer just nudges onComplete so
      // we never leave the parent stuck waiting forever.
      timers.push(
        window.setTimeout(() => {
          if (!hasStartedFadeRef.current) callComplete()
        }, EXTERNAL_HIDE_SAFETY_MS),
      )
    } else {
      const displayMs = Math.max(MIN_DISPLAY_MS, duration * 1000)
      const safetyMs = Math.max(3000, duration * 1000 + FADE_OUT_MS)

      timers.push(window.setTimeout(triggerFade, displayMs))
      timers.push(window.setTimeout(triggerFade, safetyMs))
    }

    return () => {
      timers.forEach(clearTimeout)
      rafs.forEach(cancelAnimationFrame)
    }
  }, [bootOnly, inline, shouldAutoHide, duration])

  return { isVisible, isFadingOut }
}
