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

/** Maritime terminal → Sociedades CN. Logistics park → Sociedades CN-1. Everything else → subdivision only. */
export function applyKmlLayerTargetForWaypoint(waypointId: string, ref: MutableRefObject<KmlLayerAlphas>): void {
  const a = ref.current
  if (waypointId === 'terminal-maritimo') {
    a.targetSubdivision = 0
    a.targetCn = 1
    a.targetCn1 = 0
  } else if (waypointId === 'parque-logistico') {
    a.targetSubdivision = 0
    a.targetCn = 0
    a.targetCn1 = 1
  } else {
    a.targetSubdivision = 1
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
