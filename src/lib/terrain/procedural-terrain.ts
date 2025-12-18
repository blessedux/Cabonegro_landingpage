/**
 * Procedural terrain generation using Perlin noise
 * Based on Three.js terrain example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html
 */

import * as THREE from 'three'

/**
 * Simple Perlin noise implementation for terrain generation
 */
class SimpleNoise {
  private p: number[]
  private permutation: number[]

  constructor(seed: number = Math.PI / 4) {
    this.p = []
    this.permutation = []
    
    // Create permutation array
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i
    }
    
    // Shuffle using seed
    let seedValue = seed
    for (let i = 255; i > 0; i--) {
      const x = Math.sin(seedValue++) * 10000
      const j = Math.floor((x - Math.floor(x)) * (i + 1))
      const temp = this.permutation[i]
      this.permutation[i] = this.permutation[j]
      this.permutation[j] = temp
    }
    
    // Duplicate permutation
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i % 256]
    }
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)

    const u = this.fade(x)
    const v = this.fade(y)
    const w = this.fade(z)

    const A = this.p[X] + Y
    const AA = this.p[A] + Z
    const AB = this.p[A + 1] + Z
    const B = this.p[X + 1] + Y
    const BA = this.p[B] + Z
    const BB = this.p[B + 1] + Z

    return this.lerp(
      this.lerp(
        this.lerp(this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z), u),
        this.lerp(this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z), u),
        v
      ),
      this.lerp(
        this.lerp(this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1), u),
        this.lerp(this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    )
  }
}

/**
 * Generate height data using Perlin noise
 * @param width Width of the heightmap
 * @param height Height of the heightmap
 * @param scale Noise scale factor
 * @returns Uint8Array of height values (0-255)
 */
export function generateProceduralHeight(
  width: number,
  height: number,
  scale: number = 0.1
): Uint8Array {
  const size = width * height
  const data = new Uint8Array(size)
  const noise = new SimpleNoise(Math.PI / 4)
  const z = Math.random() * 100

  // Multi-octave noise for more natural terrain
  let quality = 1
  const octaves = 4

  for (let j = 0; j < octaves; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width
      const y = Math.floor(i / width)
      const value = Math.abs(noise.noise(x / quality, y / quality, z) * quality * 1.75)
      data[i] += value * 10 // Scale the noise value
    }
    quality *= 5
  }

  // Normalize to 0-255 range
  let max = 0
  for (let i = 0; i < size; i++) {
    if (data[i] > max) max = data[i]
  }
  if (max > 0) {
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor((data[i] / max) * 255)
    }
  }

  return data
}

/**
 * Generate procedural terrain geometry with height data
 * @param width Width of terrain
 * @param depth Depth of terrain
 * @param segmentsX Number of segments in X direction
 * @param segmentsZ Number of segments in Z direction
 * @param heightScale Scale factor for height displacement
 * @returns Object with geometry and height data
 */
export function generateProceduralTerrainGeometry(
  width: number,
  depth: number,
  segmentsX: number,
  segmentsZ: number,
  heightScale: number = 50
): { geometry: THREE.PlaneGeometry; heightData: Uint8Array } {
  const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ)
  geometry.rotateX(-Math.PI / 2)

  // Generate height data
  const heightData = generateProceduralHeight(segmentsX + 1, segmentsZ + 1)

  // Apply height to vertices
  const vertices = geometry.attributes.position.array as Float32Array
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    const heightValue = heightData[Math.floor(i / 3)] || 0
    vertices[j + 1] = (heightValue / 255) * heightScale // Y position
  }

  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()

  return { geometry, heightData }
}

/**
 * Generate texture from height data with lighting
 * Similar to the Three.js example's texture generation
 */
export function generateTerrainTexture(
  heightData: Uint8Array,
  width: number,
  height: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Light direction for shading
  const sun = new THREE.Vector3(1, 1, 1)
  sun.normalize()

  for (let i = 0, j = 0, l = data.length; i < l; i += 4, j++) {
    const x = j % width
    const y = Math.floor(j / width)

    // Calculate normal from height differences
    const vector3 = new THREE.Vector3(0, 0, 0)
    const left = x > 0 ? heightData[j - 1] : heightData[j]
    const right = x < width - 1 ? heightData[j + 1] : heightData[j]
    const up = y > 0 ? heightData[j - width] : heightData[j]
    const down = y < height - 1 ? heightData[j + width] : heightData[j]

    vector3.x = (left - right) / 255
    vector3.y = 2
    vector3.z = (up - down) / 255
    vector3.normalize()

    // Calculate shading
    const shade = vector3.dot(sun)
    const heightValue = heightData[j] / 255

    // Terrain colors (brown/green based on height)
    const r = Math.floor((96 + shade * 128) * (0.5 + heightValue * 0.007))
    const g = Math.floor((32 + shade * 96) * (0.5 + heightValue * 0.007))
    const b = Math.floor((shade * 96) * (0.5 + heightValue * 0.007))

    data[i] = Math.min(255, r) // R
    data[i + 1] = Math.min(255, g) // G
    data[i + 2] = Math.min(255, b) // B
    data[i + 3] = 255 // A
  }

  ctx.putImageData(imageData, 0, 0)

  // Scale up 4x for better quality
  const canvasScaled = document.createElement('canvas')
  canvasScaled.width = width * 4
  canvasScaled.height = height * 4

  const ctxScaled = canvasScaled.getContext('2d')
  if (!ctxScaled) {
    throw new Error('Could not get scaled canvas context')
  }

  ctxScaled.scale(4, 4)
  ctxScaled.drawImage(canvas, 0, 0)

  const texture = new THREE.CanvasTexture(canvasScaled)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}
