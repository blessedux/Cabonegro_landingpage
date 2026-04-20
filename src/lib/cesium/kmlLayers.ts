import type { MutableRefObject } from 'react'

/** Smooth layer visibility for subdivision vs Sociedades CN / CN-1 KMZs. */
export type KmlLayerAlphas = {
  subdivision: number
  sociedadesCn: number
  sociedadesCn1: number
  targetSubdivision: number
  targetCn: number
  targetCn1: number
}

export function createInitialKmlLayerAlphas(): KmlLayerAlphas {
  return {
    subdivision: 1,
    sociedadesCn: 0,
    sociedadesCn1: 0,
    targetSubdivision: 1,
    targetCn: 0,
    targetCn1: 0,
  }
}

/** Keep subdivision visible; optionally add Sociedades overlays by waypoint. */
export function applyKmlLayerTargetForWaypoint(waypointId: string, ref: MutableRefObject<KmlLayerAlphas>): void {
  const a = ref.current
  // Subdivision (parcel) overlay stays on for all waypoints per UX request.
  a.targetSubdivision = 1
  if (waypointId === 'terminal-maritimo') {
    a.targetCn = 1
    a.targetCn1 = 0
  } else if (waypointId === 'parque-tecnologico') {
    a.targetCn = 0
    a.targetCn1 = 1
  } else if (waypointId === 'parque-logistico') {
    /* Logistics park: only Subdivision KMZ (CN2 focus); hide Sociedades CN / CN-1 overlays. */
    a.targetCn = 0
    a.targetCn1 = 0
  } else {
    a.targetCn = 0
    a.targetCn1 = 0
  }
}

export function stepKmlLayerAlphas(ref: MutableRefObject<KmlLayerAlphas>, rate = 0.09): void {
  const a = ref.current
  const ease = (c: number, t: number) => c + (t - c) * rate
  a.subdivision = ease(a.subdivision, a.targetSubdivision)
  a.sociedadesCn = ease(a.sociedadesCn, a.targetCn)
  a.sociedadesCn1 = ease(a.sociedadesCn1, a.targetCn1)
}
