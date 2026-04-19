'use client'

import { memo, useMemo, useState, type CSSProperties } from 'react'

const mono = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

function fmtDeg(n: number, decimals: number): string {
  return n.toFixed(decimals)
}

function formatAlt(m: number): string {
  const r = Math.round(m)
  if (Math.abs(r) >= 100_000) return `${(r / 1000).toFixed(0)} km`
  return `${r.toLocaleString('en-US')} m`
}

/** Dramatic NASA-style copy for whichever imagery pipeline is active (matches CesiumExplorer labels). */
function imagerySourceCopy(label: string): { title: string; subtitle: string; feedLine: string; ascii: string } {
  const u = label.toUpperCase()
  if (u.includes('BING')) {
    return {
      title: 'EOS-CLASS MULTI-SPECTRAL FEED',
      subtitle:
        'Live ortho mosaic — downlinked through Cesium Ion. Simulated real-time strip refresh; sub-metre posts in clear sky windows.',
      feedLine: 'PIPE · ION ASSET 2 · BING AERIAL · LEO + FIXED-WING BLEND',
      ascii: `
      .─────────.
     ╱    ◉ ◉    ╲
    │  ╭───────╮  │   LEO / aerial blend
    │  │ ▓▓▓▓▓ │  │   streamed as map tiles
     ╲ │ ▓ sat ▓ │ ╱
      ╲╰───────╯╱
       └──|||──┘
          ║║
`,
    }
  }
  if (u.includes('ARCGIS')) {
    return {
      title: 'WORLD IMAGERY DOWNLINK (ESRI)',
      subtitle:
        'Composite electro-optical stack — Planet + partner constellations. ArcGIS Online relay; latency typical of global CDN edge.',
      feedLine: 'PIPE · ARCGIS WORLD IMAGERY · MULTI-PLATFORM MOSAIC',
      ascii: `
       ___________
      ╱     ◎     ╲
     │  ┌─────────┐ │
     │  │ ░░░░░░░ │ │  World layer
     │  │ ░ ESRI ░ │ │  (Planet + partners)
      ╲ └─────────┘ ╱
       ╲___________╱
`,
    }
  }
  if (u.includes('NATURAL')) {
    return {
      title: 'BASELINE ALBEDO MAP (OFFLINE)',
      subtitle:
        'Natural Earth II — training-wheels globe texture. No live pass; use for connectivity fallback only.',
      feedLine: 'PIPE · BUNDLED TMS · NO LIVE TELEMETRY',
      ascii: `
      .───────────.
     ╱  ~ ~ ~ ~ ~  ╲
    │  · · globe ·  │   offline texture
    │  ~ ~ ~ ~ ~ ~  │
     ╲_____________╱
`,
    }
  }
  return {
    title: 'IMAGERY DOWNLINK',
    subtitle: label,
    feedLine: `PIPE · ${label}`,
    ascii: `
     .─────.
    │  ?  │
     '─────'
`,
  }
}

export interface ExploreHudProps {
  cardinal: string
  headingDeg: number
  imageryLabel: string
  subsatLonDeg: number
  subsatLatDeg: number
  altitudeAsl?: number | null
  altitudeAgl?: number | null
  /** Scene narrative — rendered inside the satellite card (multi-line). */
  sceneNarrative?: string | null
}

const navShell: CSSProperties = {
  background: 'rgba(6, 10, 18, 0.60)',
  border: '1px solid rgba(0, 229, 255, 0.12)',
  fontFamily: mono,
  letterSpacing: '0.04em',
  color: 'rgba(0, 230, 200, 0.88)',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
}

/**
 * Top-right: nav_fix + satellite / imagery + narrative in one control (default collapsed).
 */
function ExploreHudInner({
  cardinal,
  headingDeg,
  imageryLabel,
  subsatLonDeg,
  subsatLatDeg,
  altitudeAsl,
  altitudeAgl,
  sceneNarrative,
}: ExploreHudProps) {
  const src = imagerySourceCopy(imageryLabel)
  const [narrState, setNarrState] = useState<'collapsed' | 'mid' | 'full'>('collapsed')

  const narr = useMemo(() => {
    if (!sceneNarrative) return null
    const lines = sceneNarrative.split('\n')
    if (narrState === 'full' || lines.length <= 3) return { text: sceneNarrative, canToggle: lines.length > 3 }
    if (narrState === 'mid') {
      const clipped = lines.slice(0, 3).join('\n') + '\n…'
      return { text: clipped, canToggle: true }
    }
    return { text: '', canToggle: true }
  }, [narrState, sceneNarrative])

  const cardWidth = narrState === 'full' ? 360 : narrState === 'mid' ? 300 : 54
  const showCard = narrState !== 'collapsed'

  const navFixRows = (compact: boolean) => (
    <div
      style={{
        fontFamily: mono,
        letterSpacing: '0.04em',
        color: 'rgba(0, 230, 200, 0.88)',
        fontSize: compact ? 9 : 10,
        lineHeight: 1.55,
      }}
    >
      <div
        style={{
          color: 'rgba(0, 230, 200, 0.35)',
          marginBottom: compact ? 4 : 6,
          fontSize: compact ? 8 : 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        nav_fix
      </div>
      <div>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>HDG </span>
        <span style={{ color: 'rgba(255,255,255,0.92)' }}>{fmtDeg(headingDeg, 1)}°</span>
        <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 8 }}>{cardinal}</span>
      </div>
      {altitudeAsl != null && (
        <div style={{ marginTop: compact ? 4 : 6, paddingTop: compact ? 4 : 6, borderTop: '1px solid rgba(0, 229, 255, 0.08)' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>ALT </span>
          <span style={{ color: 'rgba(255,255,255,0.92)' }}>{formatAlt(altitudeAsl)}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>ASL</span>
          {altitudeAgl != null && altitudeAsl < 5000 && (
            <span style={{ color: 'rgba(79,195,247,0.92)', marginLeft: 10 }}>
              · {formatAlt(altitudeAgl)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>AGL</span>
            </span>
          )}
        </div>
      )}
      <div style={{ marginTop: compact ? 4 : 6, paddingTop: compact ? 4 : 6, borderTop: '1px solid rgba(0, 229, 255, 0.08)' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>SUBSAT </span>
        <span style={{ color: 'rgba(200, 235, 255, 0.9)' }}>
          {fmtDeg(subsatLatDeg, 5)}°, {fmtDeg(subsatLonDeg, 5)}°
        </span>
      </div>
    </div>
  )

  return (
    <>
      <div
        className="pointer-events-none fixed z-20 flex flex-col items-end gap-2"
        style={{ top: '4.25rem', right: '1.25rem' }}
      >
        {narrState === 'collapsed' && (
          <button
            type="button"
            className="pointer-events-auto text-left"
            aria-label="Open nav fix and live stack"
            onClick={() => setNarrState('mid')}
            style={{
              ...navShell,
              borderRadius: 10,
              padding: '8px 10px 10px',
              minWidth: 186,
              maxWidth: 240,
              cursor: 'pointer',
            }}
          >
            {navFixRows(true)}
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid rgba(0, 229, 255, 0.12)',
                textAlign: 'center',
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(200, 235, 255, 0.55)',
              }}
            >
              SAT · img / narrative
            </div>
          </button>
        )}

        {showCard && (
          <div
            className="pointer-events-auto"
            style={{
              position: 'relative',
              background: 'rgba(6, 10, 18, 0.32)',
              border: '1px solid rgba(0, 229, 255, 0.10)',
              borderRadius: 10,
              padding: '10px 12px',
              minWidth: 220,
              maxWidth: cardWidth,
              fontFamily: mono,
              fontSize: 9,
              lineHeight: 1.45,
              letterSpacing: '0.03em',
              color: 'rgba(180, 220, 255, 0.82)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.03)',
              userSelect: 'none',
            }}
          >
            <button
              type="button"
              aria-label="Close live stack"
              onClick={(e) => {
                e.stopPropagation()
                setNarrState('collapsed')
              }}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                width: 26,
                height: 26,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.10)',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: mono,
                fontSize: 12,
                lineHeight: '24px',
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              ×
            </button>

            <div style={{ paddingRight: 36, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(0, 229, 255, 0.10)' }}>
              {navFixRows(false)}
            </div>

            <div style={{ color: 'rgba(120, 200, 255, 0.4)', marginBottom: 8, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              img_downlink · live stack
            </div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 10, letterSpacing: '0.06em', marginBottom: 6 }}>
              {src.title}
            </div>
            <pre
              style={{
                margin: '0 0 8px 0',
                fontFamily: mono,
                fontSize: 7,
                lineHeight: 1.15,
                letterSpacing: 0,
                color: 'rgba(0, 230, 200, 0.55)',
                whiteSpace: 'pre',
                overflow: 'hidden',
              }}
            >
              {src.ascii}
            </pre>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 8, lineHeight: 1.5, borderTop: '1px solid rgba(0, 229, 255, 0.08)', paddingTop: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.28)' }}>TELEMETRY </span>
              {src.feedLine}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 8, marginTop: 6, lineHeight: 1.45 }}>
              {src.subtitle}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 7, marginTop: 6, letterSpacing: '0.04em', fontStyle: 'italic' }}>
              {imageryLabel}
            </div>

            {narr && narr.text ? (
              <div
                role={narr.canToggle ? 'button' : undefined}
                tabIndex={narr.canToggle ? 0 : undefined}
                onClick={() => {
                  if (narr.canToggle) setNarrState((s) => (s === 'mid' ? 'full' : 'mid'))
                }}
                onKeyDown={(e) => {
                  if (!narr.canToggle) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setNarrState((s) => (s === 'mid' ? 'full' : 'mid'))
                  }
                }}
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(0, 229, 255, 0.08)',
                  opacity: 0.92,
                  cursor: narr.canToggle ? 'pointer' : 'default',
                }}
              >
                <div style={{ color: 'rgba(120, 200, 255, 0.42)', marginBottom: 6, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  scene_narrative · sys.log · {narrState === 'full' ? 'big' : 'mid'}
                  {narr.canToggle ? ' · tap' : ''}
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: mono,
                    fontSize: 9,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'rgba(200, 235, 255, 0.78)',
                  }}
                >
                  {narr.text}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  )
}

const ExploreHud = memo(ExploreHudInner)
export default ExploreHud
