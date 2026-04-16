'use client'

const mono = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

function fmtDeg(n: number, decimals: number): string {
  return n.toFixed(decimals)
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
  /** Scene narrative — rendered inside the satellite card (multi-line). */
  sceneNarrative?: string | null
}

/**
 * Bottom-right stack: nav_fix, then satellite / mission imagery card (includes optional scene narrative).
 */
export default function ExploreHud({
  cardinal,
  headingDeg,
  imageryLabel,
  subsatLonDeg,
  subsatLatDeg,
  sceneNarrative,
}: ExploreHudProps) {
  const src = imagerySourceCopy(imageryLabel)

  return (
    <div
      className="pointer-events-none absolute z-10 flex flex-col gap-2"
      style={{ bottom: '6.5rem', right: '1.25rem' }}
    >
      <div
        style={{
          background: 'rgba(6, 10, 18, 0.78)',
          border: '1px solid rgba(0, 229, 255, 0.12)',
          borderRadius: 4,
          padding: '10px 12px',
          minWidth: 200,
          fontFamily: mono,
          fontSize: 10,
          lineHeight: 1.55,
          letterSpacing: '0.04em',
          color: 'rgba(0, 230, 200, 0.88)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div style={{ color: 'rgba(0, 230, 200, 0.35)', marginBottom: 6, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          nav_fix
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>HDG </span>
          <span style={{ color: 'rgba(255,255,255,0.92)' }}>{fmtDeg(headingDeg, 1)}°</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 8 }}>{cardinal}</span>
        </div>
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0, 229, 255, 0.08)' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>SUBSAT </span>
          <span style={{ color: 'rgba(200, 235, 255, 0.9)' }}>
            {fmtDeg(subsatLatDeg, 5)}°, {fmtDeg(subsatLonDeg, 5)}°
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(6, 10, 18, 0.78)',
          border: '1px solid rgba(0, 229, 255, 0.12)',
          borderRadius: 4,
          padding: '10px 12px',
          minWidth: 200,
          maxWidth: 300,
          fontFamily: mono,
          fontSize: 9,
          lineHeight: 1.45,
          letterSpacing: '0.03em',
          color: 'rgba(180, 220, 255, 0.88)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
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

        {sceneNarrative ? (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <div style={{ color: 'rgba(120, 200, 255, 0.45)', marginBottom: 6, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              scene_narrative · sys.log
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: 9,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'rgba(200, 235, 255, 0.9)',
              }}
            >
              {sceneNarrative}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}
