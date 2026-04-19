/**
 * Pure entity/polygon utilities shared across the Cesium explorer.
 * All functions receive the Cesium module and viewer as parameters so
 * they work with the dynamically-imported Cesium bundle.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

import type { Viewer as CesiumViewer } from 'cesium'
import { getSubdivisionCatalogEntry } from '@/lib/cesium/subdivisionParcelCatalog'

// ─── Name / display helpers ──────────────────────────────────────────────────

export function entityKmlRawName(
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
): string {
  const t = viewer.clock.currentTime
  if (typeof entity.name === 'string' && entity.name.trim()) return entity.name.trim()
  if (entity.name?.getValue) {
    const v = entity.name.getValue(t)
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export function entityDisplayName(
  _C: CesiumModule,
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
): string {
  const raw = entityKmlRawName(viewer, entity)
  if (!raw) return 'Lot'
  return getSubdivisionCatalogEntry(raw)?.displayName ?? raw
}

// ─── Centroid / position helpers ─────────────────────────────────────────────

export function centroidLonLatFromPositions(
  C: CesiumModule,
  positions: unknown[],
): { lon: number; lat: number } | null {
  if (!positions?.length) return null
  let sumLon = 0
  let sumLat = 0
  for (let i = 0; i < positions.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carto = C.Cartographic.fromCartesian(positions[i] as any)
    sumLon += C.Math.toDegrees(carto.longitude)
    sumLat += C.Math.toDegrees(carto.latitude)
  }
  const n = positions.length
  return { lon: sumLon / n, lat: sumLat / n }
}

export function centroidLonLatFromEntity(
  C: CesiumModule,
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
): { lon: number; lat: number } | null {
  const t = viewer.clock.currentTime
  if (entity.polygon?.hierarchy) {
    const hierarchy = entity.polygon.hierarchy.getValue(t)
    const positions = hierarchy?.positions
    if (!positions?.length) return null
    return centroidLonLatFromPositions(C, positions)
  }
  if (entity.polyline?.positions) {
    const positions = entity.polyline.positions.getValue(t)
    if (!positions?.length) return null
    return centroidLonLatFromPositions(C, positions)
  }
  return null
}

// ─── Area calculation ─────────────────────────────────────────────────────────

export function polygonAreaSqmFromPositions(
  C: CesiumModule,
  positions: unknown[],
): number | null {
  if (!positions || positions.length < 3) return null
  try {
    const centroid = new C.Cartesian3()
    for (let i = 0; i < positions.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      C.Cartesian3.add(centroid, positions[i] as any, centroid)
    }
    C.Cartesian3.multiplyByScalar(centroid, 1 / positions.length, centroid)

    const enu = C.Transforms.eastNorthUpToFixedFrame(centroid)
    const inv = C.Matrix4.inverse(enu, new C.Matrix4())
    const pLocal = new C.Cartesian3()

    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < positions.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      C.Matrix4.multiplyByPoint(inv, positions[i] as any, pLocal)
      pts.push({ x: pLocal.x, y: pLocal.y })
    }
    let a2 = 0
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length
      a2 += pts[i]!.x * pts[j]!.y - pts[j]!.x * pts[i]!.y
    }
    return Math.abs(a2) * 0.5
  } catch {
    return null
  }
}

/** Outer ring minus holes (Cesium PolygonHierarchy). */
export function polygonAreaSqmFromHierarchy(
  C: CesiumModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hierarchy: any,
): number | null {
  if (!hierarchy?.positions) return null
  const outer = polygonAreaSqmFromPositions(C, hierarchy.positions as unknown[])
  if (outer == null) return null
  let holeSum = 0
  const holes = hierarchy.holes as unknown[] | undefined
  if (holes?.length) {
    for (let hi = 0; hi < holes.length; hi++) {
      const h = holes[hi] as { positions?: unknown[] }
      const a = h?.positions ? polygonAreaSqmFromPositions(C, h.positions) : null
      if (a != null) holeSum += a
    }
  }
  const net = outer - holeSum
  return net > 1 ? net : null
}

export function parcelAreaHaFromPolygonEntity(
  C: CesiumModule,
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
  scaledHaByKmlName?: Readonly<Record<string, number>> | null,
): number | null {
  try {
    const raw = entityKmlRawName(viewer, entity)
    const cat = getSubdivisionCatalogEntry(raw)
    if (cat?.areaHa != null && Number.isFinite(cat.areaHa)) return cat.areaHa
    if (scaledHaByKmlName) {
      const scaled = scaledHaByKmlName[raw]
      if (scaled != null && Number.isFinite(scaled)) return scaled
    }
    const t = viewer.clock.currentTime
    const hierarchy = entity.polygon?.hierarchy?.getValue?.(t)
    const sqm = hierarchy ? polygonAreaSqmFromHierarchy(C, hierarchy) : null
    return sqm != null && Number.isFinite(sqm) ? sqm / 10_000 : null
  } catch {
    return null
  }
}

// ─── Point-in-polygon ─────────────────────────────────────────────────────────

function positionsToLonLatRing(
  C: CesiumModule,
  positions: unknown[],
): { lon: number; lat: number }[] {
  const out: { lon: number; lat: number }[] = []
  for (let i = 0; i < positions.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carto = C.Cartographic.fromCartesian(positions[i] as any)
    out.push({ lon: C.Math.toDegrees(carto.longitude), lat: C.Math.toDegrees(carto.latitude) })
  }
  return out
}

function pointInPolygonLonLat(
  lon: number,
  lat: number,
  ring: { lon: number; lat: number }[],
): boolean {
  if (ring.length < 3) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]!.lon, yi = ring[i]!.lat
    const xj = ring[j]!.lon, yj = ring[j]!.lat
    const denom = yj - yi
    if (Math.abs(denom) < 1e-18) continue
    if ((yi > lat) === (yj > lat)) continue
    const xInt = xi + ((xj - xi) * (lat - yi)) / denom
    if (lon < xInt) inside = !inside
  }
  return inside
}

function pointInsidePolygonHierarchyLonLat(
  C: CesiumModule,
  lon: number,
  lat: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hierarchy: any,
): boolean {
  if (!hierarchy?.positions?.length) return false
  const outer = positionsToLonLatRing(C, hierarchy.positions as unknown[])
  if (!pointInPolygonLonLat(lon, lat, outer)) return false
  const holes = hierarchy.holes as { positions?: unknown[] }[] | undefined
  if (!holes?.length) return true
  for (let hi = 0; hi < holes.length; hi++) {
    const h = holes[hi]?.positions
    if (!h?.length) continue
    const hr = positionsToLonLatRing(C, h as unknown[])
    if (pointInPolygonLonLat(lon, lat, hr)) return false
  }
  return true
}

// ─── Pick / hit-test ──────────────────────────────────────────────────────────

/**
 * Drill-pick (walls) first; if the user clicked open ground inside a parcel,
 * terrain lon/lat + point-in-polygon. Smallest-area parcel wins when rings overlap.
 */
export function findParcelEntityUnderCursor(
  viewer: CesiumViewer,
  C: CesiumModule,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mousePx: any,
  parcelEntities: Set<unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null {
  const drill = viewer.scene.drillPick(mousePx, 32)
  for (let di = 0; di < drill.length; di++) {
    const id = drill[di]?.id
    if (id && parcelEntities.has(id)) return id
  }

  let terrainPoint: unknown
  if (typeof viewer.scene.pickPosition === 'function') {
    terrainPoint = viewer.scene.pickPosition(mousePx)
  }
  if (!C.defined(terrainPoint)) {
    terrainPoint = viewer.camera.pickEllipsoid(mousePx, viewer.scene.globe.ellipsoid)
  }
  if (!C.defined(terrainPoint)) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carto = C.Cartographic.fromCartesian(terrainPoint as any)
  const lon = C.Math.toDegrees(carto.longitude)
  const lat = C.Math.toDegrees(carto.latitude)
  const t = viewer.clock.currentTime

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Scored = { entity: any; areaSqm: number }
  const candidates: Scored[] = []
  for (const ent of parcelEntities) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity = ent as any
    if (!entity?.polygon?.hierarchy) continue
    try {
      const hierarchy = entity.polygon.hierarchy.getValue(t)
      const sqm = polygonAreaSqmFromHierarchy(C, hierarchy)
      const a = sqm != null && Number.isFinite(sqm) ? sqm : Number.POSITIVE_INFINITY
      candidates.push({ entity, areaSqm: a })
    } catch { /* skip */ }
  }
  candidates.sort((x, y) => x.areaSqm - y.areaSqm)

  for (let i = 0; i < candidates.length; i++) {
    const entity = candidates[i]!.entity
    try {
      const hierarchy = entity.polygon.hierarchy.getValue(t)
      if (pointInsidePolygonHierarchyLonLat(C, lon, lat, hierarchy)) return entity
    } catch { /* skip */ }
  }
  return null
}
