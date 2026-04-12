/**
 * TypeScript type definitions for window object extensions
 * These are kept for backward compatibility but should be migrated to Context
 */

export interface WindowWithExtensions extends Window {
  // Terrain mesh reference (used for raycasting)
  __terrainMesh?: THREE.Mesh
  __setTerrainOffset?: (x: number, y: number) => void
  
  // Performance monitoring (development only)
  __sceneFPS?: number
  
  // Loading state (legacy - consider migrating to Context)
  __loadingState?: {
    models?: { loaded: boolean; message?: string }
    [key: string]: any
  }
}

declare global {
  interface Window extends WindowWithExtensions {}
}
