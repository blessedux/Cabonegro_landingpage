export const CESIUM_ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN ?? ''

export const CESIUM_BASE_URL = process.env.CESIUM_BASE_URL ?? '/_next/static/cesium'

export const CABO_NEGRO_CENTER = {
  longitude: -70.21,
  latitude: -52.85,
  height: 8000,
} as const

export const DEFAULT_CAMERA = {
  heading: 0.1,
  pitch: -0.45,
  roll: 0,
} as const

export const TERRAIN_EXAGGERATION = 2.5
