'use client'

/**
 * CloudOverlay — HTML canvas layer on top of Cesium.
 *
 * Technique (same as explore.ownprimland.com):
 *   • Multiple billboard "planes" rendered as <canvas> elements
 *   • Soft cumulus shapes drawn with overlapping radial gradients
 *   • Shadow baked into the canvas texture (darker blob, offset + blurred)
 *   • CSS perspective container gives real 3D depth:
 *       high z  = close cloud  = bigger, faster
 *       low z   = distant cloud = smaller, slower
 *   • requestAnimationFrame drives translateX drift (Patagonian westerlies)
 *   • Each cloud wraps seamlessly from right edge back to the left
 */

import { useEffect, useRef, useCallback } from 'react'

// Speed is in vw/s — close clouds move faster than far ones
const LAYERS = [
  { id: 0, wVw: 68, top: '8%',  z: 340,  spd: 2.9, alpha: 0.50, startX: -15 },
  { id: 1, wVw: 55, top: '5%',  z: 130,  spd: 2.3, alpha: 0.44, startX:  42 },
  { id: 2, wVw: 46, top: '17%', z: -30,  spd: 1.8, alpha: 0.37, startX: -62 },
  { id: 3, wVw: 74, top: '22%', z: 400,  spd: 3.4, alpha: 0.48, startX:  18 },
  { id: 4, wVw: 40, top: '3%',  z: -140, spd: 1.3, alpha: 0.30, startX:  72 },
  { id: 5, wVw: 60, top: '28%', z: 200,  spd: 2.6, alpha: 0.41, startX: -44 },
  { id: 6, wVw: 32, top: '1%',  z: -280, spd: 0.9, alpha: 0.24, startX:  88 },
  { id: 7, wVw: 50, top: '14%', z: 60,   spd: 2.0, alpha: 0.38, startX: -80 },
] as const

/**
 * Paints one realistic cumulus cloud onto a canvas.
 * Includes a shadow layer (darker, blurred, offset) baked beneath the white cloud.
 */
function paintCloud(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)

  // Helper: draw one elliptical soft puff
  const puff = (
    cx: number, cy: number,
    rx: number, ry: number,
    r: number, g: number, b: number, a: number,
  ) => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0,    `rgba(${r},${g},${b},${a})`)
    grad.addColorStop(0.40, `rgba(${r},${g},${b},${a * 0.68})`)
    grad.addColorStop(0.72, `rgba(${r},${g},${b},${a * 0.32})`)
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Shadow (cool blue-grey, offset right + down, blurred via shadowBlur) ──
  ctx.save()
  ctx.filter = 'blur(12px)'
  ctx.globalAlpha = 1
  ctx.translate(W * 0.028, H * 0.12)
  ctx.scale(0.96, 0.80)
  puff(W*.50, H*.60, W*.30, H*.34, 50, 65, 95, 0.28)
  puff(W*.33, H*.66, W*.23, H*.26, 45, 60, 90, 0.22)
  puff(W*.67, H*.64, W*.26, H*.28, 50, 65, 95, 0.24)
  puff(W*.44, H*.44, W*.18, H*.22, 45, 58, 88, 0.18)
  puff(W*.57, H*.42, W*.16, H*.20, 45, 58, 88, 0.16)
  ctx.restore()

  // ── White cloud body ──
  // Central mass
  puff(W*.50, H*.57, W*.30, H*.36, 255, 255, 255, 0.96)
  puff(W*.33, H*.63, W*.23, H*.28, 248, 251, 255, 0.88)
  puff(W*.67, H*.61, W*.26, H*.30, 252, 254, 255, 0.90)

  // Top billowing towers
  puff(W*.43, H*.42, W*.18, H*.23, 255, 255, 255, 0.83)
  puff(W*.57, H*.40, W*.16, H*.21, 255, 255, 255, 0.79)
  puff(W*.50, H*.32, W*.13, H*.17, 255, 255, 255, 0.70)
  puff(W*.36, H*.35, W*.12, H*.15, 248, 250, 255, 0.62)
  puff(W*.63, H*.34, W*.11, H*.14, 250, 252, 255, 0.60)

  // Flat bottom base (gives cumulus the classic flat-bottomed look)
  puff(W*.50, H*.72, W*.32, H*.14, 240, 245, 252, 0.45)

  // Wispy trailing edges
  puff(W*.16, H*.70, W*.14, H*.16, 248, 251, 255, 0.55)
  puff(W*.84, H*.67, W*.15, H*.18, 248, 251, 255, 0.57)
  puff(W*.07, H*.74, W*.09, H*.11, 250, 252, 255, 0.36)
  puff(W*.93, H*.72, W*.10, H*.12, 250, 252, 255, 0.38)
}

export default function CloudOverlay() {
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>(
    Array.from({ length: LAYERS.length }, () => null),
  )
  const xPos = useRef<number[]>(LAYERS.map(l => l.startX))
  const rafRef = useRef<number>()
  const prevT = useRef<number>(0)

  const tick = useCallback((t: number) => {
    const dt = Math.min((t - prevT.current) / 1000, 0.05) // cap delta to 50 ms
    prevT.current = t

    LAYERS.forEach((layer, i) => {
      xPos.current[i] += layer.spd * dt // vw/s × s = vw

      // Wrap seamlessly: when the right edge of the cloud clears the viewport
      if (xPos.current[i] > 105) {
        xPos.current[i] = -(layer.wVw + 5)
      }

      const el = wrapperRefs.current[i]
      if (el) {
        el.style.transform = `translateZ(${layer.z}px) translateX(${xPos.current[i]}vw)`
      }
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    LAYERS.forEach((_, i) => {
      const wrapper = wrapperRefs.current[i]
      if (!wrapper) return
      const canvas = wrapper.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) return

      const W = 1024
      const H = Math.round(W * 0.44)
      canvas.width = W
      canvas.height = H

      const ctx = canvas.getContext('2d')
      if (ctx) paintCloud(ctx, W, H)
    })

    prevT.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [tick])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 3,
        // CSS 3D stage — high z = close (bigger), negative z = far (smaller)
        perspective: '1400px',
        perspectiveOrigin: '50% 20%',
      }}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          ref={el => { wrapperRefs.current[i] = el }}
          style={{
            position: 'absolute',
            top: layer.top,
            left: 0,
            width: `${layer.wVw}vw`,
            height: `${layer.wVw * 0.44}vw`,
            transform: `translateZ(${layer.z}px) translateX(${layer.startX}vw)`,
            willChange: 'transform',
          }}
        >
          <canvas
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: layer.alpha,
              imageRendering: 'auto',
            }}
          />
        </div>
      ))}
    </div>
  )
}
