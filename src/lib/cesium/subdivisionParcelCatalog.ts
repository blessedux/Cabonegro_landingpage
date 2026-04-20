/**
 * Maps KMZ placemark `<name>` values to marketing labels, authoritative
 * hectare figures (sales / deck), colors aligned with the project map, and label placement.
 * Covers both SUBDIVISIÓN VIGENTE.kmz and Sociedades CN / CN-1 KMZs.
 * KML geometry names are internal (Sitio N, J&P Dos, etc.); this is the single source for UI copy.
 */

export type SubdivisionParcelCatalogEntry = {
  /** Shown on globe + InfoPanel (full marketing line) */
  displayName: string
  /** If set, overrides planar geometry (ha); else computed from polygon */
  areaHa?: number
  fillCss: string
  outlineCss: string
  /** When false, terrain polygon has no green tint — vertical walls only. Omitted = true (e.g. CN2). */
  showPolygonFill?: boolean
  /** Extruded boundary wall height (m above terrain). Omitted → explorer default (60 m). */
  wallHeightM?: number
  /** Shift label anchor in degrees (east/north positive) after centroid — e.g. west = negative lon */
  labelOffsetDeg?: { lon: number; lat: number }
  /** Extra screen-pixel offset for label (same as Cesium pixelOffset) */
  labelPixelOffset?: { x: number; y: number }
  /** Polygon still tinted; label skipped (e.g. lot reserved / no public name on master map) */
  hideLabel?: boolean
}

/** Legacy fill keys — explorer applies alpha 0 when `showPolygonFill` is false (walls only). */
const PV = { fillCss: '#0f766e', outlineCss: '#5eead4' }
const PV_WALLS_ONLY = { fillCss: PV.fillCss, outlineCss: PV.outlineCss, showPolygonFill: false as const }

/** Maritime terminal (PPG) fill — distinct blue so selection highlight reads clearly. */
const PPG_WALLS_ONLY = { fillCss: '#1565c0', outlineCss: '#90caf9', showPolygonFill: false as const }

/** Single marketing line for every Patagon Valley lot in explorer UI + globe tags. */
const PV_DISPLAY = 'Patagon Valley'

/**
 * The polygons under `SD Lote C1-7` in SUBDIVISIÓN VIGENTE.kmz used for proportional-ha calculation.
 * Combined developable area is **33 ha**.
 */
export const PATAGON_VALLEY_PARTITION_TOTAL_HA = 33
export const PATAGON_VALLEY_33HA_KML_KEYS = [
  'Sitio 7',
  'Sitio 6',
  'Sitio 5',
  'Sitio 4',
  'Sitio N°3',
  'C1-7',
] as const

export const PATAGON_VALLEY_33HA_KML_KEY_SET = new Set<string>(PATAGON_VALLEY_33HA_KML_KEYS)

/** Keys must match KML `<Placemark><name>` exactly */
export const SUBDIVISION_PARCEL_CATALOG: Record<string, SubdivisionParcelCatalogEntry> = {
  'LOTE A (CN2)': {
    displayName: 'Cabo Negro Dos',
    areaHa: 173,
    fillCss: '#8d6e63',
    outlineCss: '#bcaaa4',
  },

  // ── Patagon Valley lots (Subdivision KMZ) ─────────────────────────────────
  'Sitio 7': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio 6': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio 5': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio 4': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio N°3': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio N°2 Lote C1': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'C1-7': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Lote C1-7-2': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },

  // ── J&P lots ──────────────────────────────────────────────────────────────
  /** The main J&P waterfront lot — authoritative 24 ha. Lives in Subdivision KMZ. */
  'J&P Continuadora': {
    displayName: 'J&P',
    areaHa: 24,
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
    labelOffsetDeg: { lon: -0.0022, lat: 0.0014 },
  },
  /** J&P III lot — Sociedades CN KMZ polygon `J&P Dos`. */
  'J&P Dos': {
    displayName: 'J&P III',
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
  },
  /** J&P II lot — Sociedades CN KMZ polygon `J&P Tres`. */
  'J&P Tres': {
    displayName: 'J&P II',
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
  },

  // ── Maritime terminal ─────────────────────────────────────────────────────
  /**
   * PPG CM61260 boundary polygons — unnamed in KMZ; code assigns this key to every
   * empty-name polygon entity found in the Sociedades CN dataset.
   */
  'PPG CM61260': {
    displayName: 'PPG CM61260',
    ...PPG_WALLS_ONLY,
    wallHeightM: 30,
  },
}

export function getSubdivisionCatalogEntry(kmlName: string): SubdivisionParcelCatalogEntry | undefined {
  const k = kmlName.trim()
  return SUBDIVISION_PARCEL_CATALOG[k]
}

/** Globe tag: display name + ha (Patagon Valley lots share one name). */
export function formatSubdivisionGlobeLabel(
  cat: SubdivisionParcelCatalogEntry | undefined,
  rawKmlName: string,
  areaHa: number,
): string {
  const title = cat?.displayName?.trim() || rawKmlName.trim() || 'Lot'
  return `${title}\n${areaHa.toFixed(1)} ha`
}

/** KML `<name>` for the J&P main lot in the Subdivision KMZ — used as default featured lot on explore load */
export const KML_NAME_JP_24HA = 'J&P Continuadora'

/** Hidden in Sociedades CN/CN-1 because Subdivision KMZ carries the authoritative polygon. */
export const KML_NAME_JP_CONTINUADORA = 'J&P Continuadora'

/** Sociedades CN KMZ polygon names for J&P II and J&P III. */
export const KML_NAME_JP_DOS = 'J&P Dos'
export const KML_NAME_JP_TRES = 'J&P Tres'

/**
 * Synthetic name assigned by code to every unnamed polygon entity in the Sociedades CN
 * dataset (PPG document folder). Allows catalog + narrative lookup.
 */
export const KML_NAME_PPG_POLYGON = 'PPG CM61260'

/**
 * The Patagon Valley "small lots" — every individual lot within the tech-park cluster
 * (including Sitio 7 and Sitio 6, both now Patagon Valley).
 * Clicking any one highlights the whole group and shows the combined block card.
 */
export const PV_SMALL_LOT_KML_KEYS = [
  'Sitio 7',
  'Sitio 6',
  'Sitio 4',
  'Sitio 5',
  'Sitio N°3',
  'C1-7',
  'Lote C1-7-2',
  'Sitio N°2 Lote C1',
] as const

export const PV_SMALL_LOT_KEY_SET = new Set<string>(PV_SMALL_LOT_KML_KEYS)

/** Synthetic kmlRawName used when the whole PV small-lot group is selected together. */
export const PV_GROUP_KML_KEY = 'PATAGON_VALLEY_GROUP'

/** Pier / muelle — not a closed polygon in KMZ; label placed at long jetty polyline centroid */
export const PPG_PIER_LABEL = {
  text: 'PPG CM61260',
  lon: -70.833798,
  lat: -52.924523,
  labelPixelOffset: { x: 0, y: -14 } as const,
}
