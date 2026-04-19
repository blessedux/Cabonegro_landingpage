/**
 * Opt-in Cesium camera/input diagnostics. Append `?debugCesiumInput` to the explore URL.
 * Logs are throttled to avoid console flooding during drag.
 */

let lastLogMs = 0

export function shouldLogCesiumInput(): boolean {
  try {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('debugCesiumInput')
  } catch {
    return false
  }
}

export function logCesiumInputThrottled(
  tag: string,
  data: Record<string, unknown>,
  minIntervalMs = 160,
): void {
  if (!shouldLogCesiumInput()) return
  const t = performance.now()
  if (t - lastLogMs < minIntervalMs) return
  lastLogMs = t
  // eslint-disable-next-line no-console
  console.log(`[CesiumExplorer/input] ${tag}`, data)
}
