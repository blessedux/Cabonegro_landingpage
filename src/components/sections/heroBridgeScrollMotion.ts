import type { MotionValue } from 'framer-motion'

/** Scroll-linked motion for hero → content bridge: media zooms + blur; foreground parallax. */
export interface HeroBridgeScrollMotion {
  mediaScale: MotionValue<number>
  /** Keep at 0 for a “fixed” background; optional nudge if needed */
  mediaY: MotionValue<string>
  contentY: MotionValue<number>
  /** Blur on media (px), e.g. 0 → 10 */
  mediaBlur: MotionValue<number>
}
