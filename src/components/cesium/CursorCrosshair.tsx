'use client'

interface CursorCrosshairProps {
  clientX: number
  clientY: number
  visible: boolean
}

/**
 * Full-viewport crosshair at pointer position (use with cursor: none).
 */
export default function CursorCrosshair({ clientX, clientY, visible }: CursorCrosshairProps) {
  if (!visible) return null
  return (
    <>
      <div
        className="pointer-events-none fixed z-[15]"
        style={{
          left: clientX,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'linear-gradient(180deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.35) 20%, rgba(0,229,255,0.55) 50%, rgba(0,229,255,0.35) 80%, rgba(0,229,255,0) 100%)',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed z-[15]"
        style={{
          left: 0,
          right: 0,
          top: clientY,
          height: 1,
          background: 'linear-gradient(90deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.35) 20%, rgba(0,229,255,0.55) 50%, rgba(0,229,255,0.35) 80%, rgba(0,229,255,0) 100%)',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)',
        }}
        aria-hidden
      />
    </>
  )
}
