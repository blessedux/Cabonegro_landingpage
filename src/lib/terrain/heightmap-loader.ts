/**
 * Heightmap loading utilities
 * Handles loading and processing of heightmap textures
 */

import * as THREE from 'three'

/**
 * Load a heightmap image and return as texture
 * @param url Path to heightmap image
 * @returns Promise resolving to THREE.Texture
 */
export async function loadHeightmap(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        resolve(texture)
      },
      undefined,
      (error) => {
        reject(error)
      }
    )
  })
}

/**
 * Create a fallback heightmap (flat terrain) if real heightmap is unavailable
 * Creates a canvas-based texture that can be used as a displacement map
 * @param width Width of the heightmap
 * @param height Height of the heightmap
 * @returns THREE.Texture with flat height data (grayscale, all at mid-gray = no displacement)
 */
export function createFallbackHeightmap(width: number = 1024, height: number = 1024): THREE.Texture {
  // Check if we're in browser context
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Return a simple data texture as fallback
    const data = new Uint8Array(width * height * 4)
    data.fill(128) // Mid-gray for all channels
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }

  // Create a canvas with flat gray (128 = no displacement in standard heightmaps)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Fill with mid-gray (128) which represents no displacement
    ctx.fillStyle = 'rgb(128, 128, 128)'
    ctx.fillRect(0, 0, width, height)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  
  return texture
}
