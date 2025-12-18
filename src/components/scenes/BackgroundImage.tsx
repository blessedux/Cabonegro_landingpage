'use client'

import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface BackgroundImageProps {
  imageUrl?: string
  blur?: number
}

/**
 * Background image component that renders behind the terrain
 * Creates a blurred, far-away fill for the infinite void
 */
export default function BackgroundImage({
  imageUrl = '/Patagon_Valley_v2.webp',
  blur = 15
}: BackgroundImageProps) {
  const { scene } = useThree()
  const textureRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      imageUrl,
      (texture) => {
        // Create canvas to process the image
        const img = texture.image
        const canvas = document.createElement('canvas')
        // Use lower resolution for blur effect
        const scale = 0.3 // Reduce resolution for blur effect
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          // Draw and scale down (creates blur effect)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Get image data and slightly darken (keep colors)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Darken colors slightly but keep them (not greyscale)
          for (let i = 0; i < data.length; i += 4) {
            // Reduce brightness by 40% but keep color
            data[i] = data[i] * 0.6     // R
            data[i + 1] = data[i + 1] * 0.6 // G
            data[i + 2] = data[i + 2] * 0.6 // B
            // Alpha stays the same
          }
          
          ctx.putImageData(imageData, 0, 0)
          
          // Create texture from processed canvas
          const processedTexture = new THREE.CanvasTexture(canvas)
          processedTexture.wrapS = THREE.RepeatWrapping
          processedTexture.wrapT = THREE.RepeatWrapping
          processedTexture.minFilter = THREE.LinearFilter
          processedTexture.magFilter = THREE.LinearFilter
          
          textureRef.current = processedTexture
          scene.background = processedTexture
        }
      },
      undefined,
      (error) => {
        console.warn('[BackgroundImage] Failed to load background image:', error)
        // Fallback to very dark grey
        scene.background = new THREE.Color(0x0a0a0a)
      }
    )

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [imageUrl, scene])

  return null
}

