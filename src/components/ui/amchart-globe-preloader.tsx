'use client'

import { useEffect, useRef } from 'react'

interface AmChartGlobePreloaderProps {
  className?: string
  /** Westward = default; eastward reverses horizontal spin. */
  spin?: 'east' | 'west'
  /** Tear down WebGL/canvas work before overlay unmounts (keeps CSS ring only). */
  suspended?: boolean
}

/** Ring in 100×100 viewBox; diameter = 2R% of outer square (larger R = bigger spinner). */
const R = 47
/** Globe + map sit inside the ring with equal gap on all sides (smaller than 2R). */
const GLOBE_DIAMETER_PCT = 72
/** Orthographic center meridian: amCharts uses rotationX = −λ (see globe rotate-to-country). ~105°E ≈ East Asia; 0° sits on Africa. */
const INITIAL_ROTATION_X = -105

export default function AmChartGlobePreloader({
  className = '',
  spin = 'west',
  suspended = false,
}: AmChartGlobePreloaderProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (suspended) return

    const host = chartRef.current
    if (!host) return

    let disposed = false
    let rafBoot1 = 0
    let rafBoot2 = 0
    let rafSpin = 0
    let root: any | null = null

    // Defer chart construction across two frames so CSS ring/topo can paint before heavy GeoJSON + canvas work
    rafBoot1 = requestAnimationFrame(() => {
      rafBoot2 = requestAnimationFrame(() => {
        if (disposed || !chartRef.current) return

        ;(async () => {
          // Lazy-load amCharts so PreloaderB doesn’t bloat initial bundles.
          const [am5, am5map, am5themesAnimatedMod, am5geodataWorldLowMod] = await Promise.all([
            import('@amcharts/amcharts5'),
            import('@amcharts/amcharts5/map'),
            import('@amcharts/amcharts5/themes/Animated'),
            import('@amcharts/amcharts5-geodata/worldLow'),
          ])
          const am5themesAnimated = am5themesAnimatedMod.default
          const am5geodataWorldLow = am5geodataWorldLowMod.default

          if (disposed || !chartRef.current) return

          root = am5.Root.new(chartRef.current)
          root.setThemes([am5themesAnimated.new(root)])

          const rootWithLogo = root as unknown as { _logo?: { dispose: () => void } }
          rootWithLogo._logo?.dispose()

          const chart = root.container.children.push(
            am5map.MapChart.new(root, {
              panX: 'none',
              panY: 'none',
              wheelY: 'none',
              projection: am5map.geoOrthographic(),
              rotationX: INITIAL_ROTATION_X,
              rotationY: 0,
              paddingTop: 0,
              paddingBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              homeGeoPoint: { longitude: 105, latitude: 28 },
            })
          )

          chart.chartContainer.set(
            'background',
            am5.Rectangle.new(root, {
              fill: am5.color(0xffffff),
              fillOpacity: 0,
            })
          )

          const polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
              geoJSON: am5geodataWorldLow as any,
              exclude: ['AQ'],
            })
          )

          polygonSeries.mapPolygons.template.setAll({
            fill: am5.color(0x111111),
            fillOpacity: 0.9,
            stroke: am5.color(0xffffff),
            strokeOpacity: 0.45,
            strokeWidth: 0.75,
          })

          const backgroundSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}))
          backgroundSeries.mapLines.template.setAll({
            stroke: am5.color(0x999999),
            strokeOpacity: 0.25,
          })

          const step = spin === 'east' ? 1 : -1
          let rotationX = INITIAL_ROTATION_X
          const cadenceMs = 120
          let lastTick = performance.now()

          const tick = (now: number) => {
            rafSpin = requestAnimationFrame(tick)
            if (now - lastTick < cadenceMs) return
            lastTick = now
            rotationX += step
            chart.animate({
              key: 'rotationX',
              to: rotationX,
              duration: cadenceMs,
              easing: am5.ease.linear,
            })
          }
          rafSpin = requestAnimationFrame(tick)
        })().catch(() => {
          // If the chunk fails to load (offline / blocked), keep the lightweight ring spinner only.
        })
      })
    })

    return () => {
      disposed = true
      cancelAnimationFrame(rafBoot1)
      cancelAnimationFrame(rafBoot2)
      cancelAnimationFrame(rafSpin)
      root?.dispose()
    }
  }, [spin, suspended])

  return (
    <div
      className={`relative z-[50] mx-auto aspect-square w-full max-w-[min(92vw,260px)] ${className}`}
      aria-label="Loading"
      role="status"
      aria-live="polite"
    >
      {/*
        Ring uses diameter 2R% of the outer box; globe is smaller and centered so margin is even
        between globe edge and spinner (gradient still matches map in the circular clip).
      */}
      <div
        className="absolute left-1/2 top-1/2 z-[10] aspect-square -translate-x-1/2 -translate-y-[calc(50%+2px)]"
        style={{ width: `${GLOBE_DIAMETER_PCT}%`, maxWidth: `${GLOBE_DIAMETER_PCT}%` }}
      >
        {/* Gradient sits on its own layer: orthographic map draws slightly lower in the canvas than this box’s geometric center, so nudge the fill down to match landmass + graticule. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute inset-0 translate-y-[5px] rounded-full bg-gradient-to-br from-slate-200/90 via-slate-100/80 to-slate-300/50 shadow-inner"
            aria-hidden
          />
        </div>
        <div
          ref={chartRef}
          className="relative z-[1] h-full w-full min-h-0 min-w-0 rounded-full bg-transparent"
        />
      </div>

      {/* Ring strokes on top (fill=none); compositor-friendly for the spinner arc */}
      <svg
        className="preloader-globe-spinner-island pointer-events-none absolute inset-0 z-[25] h-full w-full text-black"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <g transform="translate(50 50)">
          <circle
            cx="0"
            cy="0"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={2.25}
          />
          <g className="animate-globe-spinner-arc-rotate">
            <circle
              className="animate-globe-spinner-arc-dash"
              cx="0"
              cy="0"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.48}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeDasharray="34 300"
              transform="rotate(-90)"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
