/**
 * Maps SUBDIVISIÓN VIGENTE.kmz placemark `<name>` values to marketing labels, authoritative
 * hectare figures (sales / deck), colors aligned with the project map, and label placement.
 * KML geometry names are internal (Sitio N, C1-7, etc.); this is the single source for UI copy.
 */

export type SubdivisionParcelCatalogEntry = {
  /** Shown on globe + InfoPanel (full marketing line) */
  displayName: string
  /** If set, overrides planar geometry (ha); else computed from polygon — only CN2 uses this */
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

/** Single marketing line for every Patagon Valley lot in explorer UI + globe tags. */
const PV_DISPLAY = 'Patagon Valley'

/**
 * The six polygons under `SD Lote C1-7` in SUBDIVISIÓN VIGENTE.kmz — combined developable area is **33 ha**.
 * Hectares per lot are proportional to each polygon’s net area (outer minus holes), scaled to that total.
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
  /** Adjoining J&P (Sitio 7) — marketing lot line. */
  'Sitio 6': {
    displayName: 'J&P III',
    areaHa: 31,
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
  },
  'Sitio 4': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio N°3': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  /** Waterfront J&P lot — authoritative 24 ha (not proportional slice of the 33 ha fabric). */
  'Sitio 7': {
    displayName: 'J&P',
    areaHa: 24,
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
    /** Southeast into the widest part of the polygon (right / below centroid on map). */
    labelOffsetDeg: { lon: 0.0058, lat: -0.0024 },
    labelPixelOffset: { x: 22, y: -12 },
  },
  /** Port-side extension of J&P — marketed as J&P II. */
  'J&P Continuadora': {
    displayName: 'J&P II',
    ...PV_WALLS_ONLY,
    wallHeightM: 60,
    labelOffsetDeg: { lon: -0.0022, lat: 0.0014 },
  },
  'C1-7': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio 5': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Sitio N°2 Lote C1': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
  },
  'Lote C1-7-2': {
    displayName: PV_DISPLAY,
    ...PV_WALLS_ONLY,
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

/** KML `<name>` for J&P (24 ha) — default featured lot on explore load */
export const KML_NAME_JP_24HA = 'Sitio 7'

/** Same lot is merged into `subdivision-vigente.kmz`; hide Sociedades duplicate polygons. */
export const KML_NAME_JP_CONTINUADORA = 'J&P Continuadora'

/**
 * The Patagon Valley "small lots" — individual lots within the tech-park cluster.
 * Clicking any one highlights the whole group and shows the combined block card.
 */
export const PV_SMALL_LOT_KML_KEYS = [
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
