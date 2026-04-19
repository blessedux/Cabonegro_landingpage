'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type TimeDialProps = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (next: number) => void
  label?: string
  disabled?: boolean
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function snap(n: number, step: number): number {
  if (step <= 0) return n
  return Math.round(n / step) * step
}

/** Map angle (radians) where -PI/2 = top, clockwise positive, to [0, 1). */
function angleToUnit(rad: number): number {
  // Convert so 0 is at top.
  const a = rad + Math.PI / 2
  const u = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return u / (2 * Math.PI)
}

export default function TimeDial({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  disabled = false,
}: TimeDialProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const range = Math.max(1e-6, max - min)
  const unit = clamp((value - min) / range, 0, 1)

  const ticks = useMemo(() => {
    const n = Math.max(0, Math.floor((max - min) / step))
    const arr: number[] = []
    for (let i = 0; i <= n; i++) arr.push(i)
    return arr
  }, [max, min, step])

  const commitFromClient = useCallback((clientX: number, clientY: number) => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const rad = Math.atan2(dy, dx)
    const u = angleToUnit(rad)
    const raw = min + u * range
    const next = clamp(snap(raw, step), min, max)
    onChange(next)
  }, [min, max, range, step, onChange])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      if (disabled) return
      commitFromClient(e.clientX, e.clientY)
    }
    const onUp = () => {
      setDragging(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onUp, true)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp, true)
      window.removeEventListener('pointercancel', onUp, true)
    }
  }, [commitFromClient, disabled, dragging])

  const angleDeg = unit * 360 - 90
  const knobX = 50 + 42 * Math.cos((angleDeg * Math.PI) / 180)
  const knobY = 50 + 42 * Math.sin((angleDeg * Math.PI) / 180)

  return (
    <div className="flex items-center gap-3 select-none">
      {label && (
        <span className="text-white/35 text-[10px] tracking-wider">
          {label}
        </span>
      )}
      <div
        ref={rootRef}
        role="slider"
        aria-label={label ?? 'Time'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={[
          'relative',
          disabled ? 'opacity-60' : 'cursor-grab active:cursor-grabbing',
        ].join(' ')}
        style={{ width: 46, height: 46 }}
        onPointerDown={(e) => {
          if (disabled) return
          e.preventDefault()
          setDragging(true)
          commitFromClient(e.clientX, e.clientY)
        }}
        onKeyDown={(e) => {
          if (disabled) return
          const dir =
            e.key === 'ArrowRight' || e.key === 'ArrowUp' ? +1 :
            e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
          if (!dir) return
          e.preventDefault()
          const next = clamp(snap(value + dir * step, step), min, max)
          onChange(next)
        }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <circle cx="50" cy="50" r="45" fill="rgba(10, 15, 26, 0.55)" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          <circle cx="50" cy="50" r="34" fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {ticks.map((i) => {
            const u = (i / Math.max(1, ticks.length - 1))
            const a = (u * 2 * Math.PI) - Math.PI / 2
            const isMajor = i % Math.max(1, Math.round(4 / step)) === 0
            const r0 = isMajor ? 37 : 40
            const r1 = 44
            const x0 = 50 + r0 * Math.cos(a)
            const y0 = 50 + r0 * Math.sin(a)
            const x1 = 50 + r1 * Math.cos(a)
            const y1 = 50 + r1 * Math.sin(a)
            return (
              <line
                key={i}
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke={isMajor ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.16)'}
                strokeWidth={isMajor ? 2.2 : 1.4}
                strokeLinecap="round"
              />
            )
          })}

          {/* hand */}
          <line x1="50" y1="50" x2={knobX} y2={knobY} stroke="rgba(79,195,247,0.95)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3.2" fill="rgba(255,255,255,0.65)" />
          <circle cx={knobX} cy={knobY} r="5.2" fill="rgba(79,195,247,0.95)" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        </svg>
      </div>
      <span className="text-white/35 text-[10px] font-mono w-10">
        {String(Math.round(value)).padStart(2, '0')}:00
      </span>
    </div>
  )
}

