'use client'

import { useEffect, useRef } from 'react'

interface CursorCrosshairProps {
  /** Scope pointer listeners to this element. If omitted, listens on document. */
  containerRef?: React.RefObject<HTMLElement | null>
  /** When false the crosshair is hidden and no listeners are attached. */
  enabled: boolean
}

/**
 * Full-viewport crosshair that manages its own position via direct DOM
 * manipulation — no React state, no parent re-renders on pointer move.
 */
export default function CursorCrosshair({ containerRef, enabled }: CursorCrosshairProps) {
  const vLineRef = useRef<HTMLDivElement>(null) // vertical bar (full height, x = pointer.x)
  const hLineRef = useRef<HTMLDivElement>(null) // horizontal bar (full width, y = pointer.y)

  useEffect(() => {
    const vLine = vLineRef.current
    const hLine = hLineRef.current
    if (!vLine || !hLine) return

    if (!enabled) {
      vLine.style.display = 'none'
      hLine.style.display = 'none'
      return
    }

    const show = () => {
      vLine.style.display = 'block'
      hLine.style.display = 'block'
    }
    const hide = () => {
      vLine.style.display = 'none'
      hLine.style.display = 'none'
    }
    const onMove = (e: PointerEvent) => {
      show()
      vLine.style.left = `${e.clientX}px`
      hLine.style.top = `${e.clientY}px`
    }

    hide() // start hidden until first pointer move

    const target: EventTarget = containerRef?.current ?? document
    target.addEventListener('pointermove', onMove as EventListener)
    target.addEventListener('pointerleave', hide as EventListener)

    return () => {
      target.removeEventListener('pointermove', onMove as EventListener)
      target.removeEventListener('pointerleave', hide as EventListener)
    }
  }, [containerRef, enabled])

  return (
    <>
      <div
        ref={vLineRef}
        className="pointer-events-none fixed z-[15]"
        style={{
          left: 0,
          top: 0,
          bottom: 0,
          width: 1,
          display: 'none',
          background: 'linear-gradient(180deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.35) 20%, rgba(0,229,255,0.55) 50%, rgba(0,229,255,0.35) 80%, rgba(0,229,255,0) 100%)',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)',
        }}
        aria-hidden
      />
      <div
        ref={hLineRef}
        className="pointer-events-none fixed z-[15]"
        style={{
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          display: 'none',
          background: 'linear-gradient(90deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.35) 20%, rgba(0,229,255,0.55) 50%, rgba(0,229,255,0.35) 80%, rgba(0,229,255,0) 100%)',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)',
        }}
        aria-hidden
      />
    </>
  )
}
