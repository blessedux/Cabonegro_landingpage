'use client'

import { useRef, useEffect, useState } from 'react'

interface PixelErasureImageProps {
  src: string
  alt?: string
  className?: string
  radius?: number // Erasure radius in pixels
  ditherIntensity?: number // Dither effect intensity (0-1)
}

export function PixelErasureImage({ 
  src, 
  alt = '', 
  className = '', 
  radius = 30,
  ditherIntensity = 0.3
}: PixelErasureImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const originalImageDataRef = useRef<ImageData | null>(null)
  const currentImageDataRef = useRef<ImageData | null>(null)

  // Load and prepare image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    
    img.onload = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      // Calculate display size maintaining aspect ratio
      const containerRect = container.getBoundingClientRect()
      const aspectRatio = img.width / img.height
      
      let displayWidth = containerRect.width
      let displayHeight = displayWidth / aspectRatio
      
      if (displayHeight > containerRect.height) {
        displayHeight = containerRect.height
        displayWidth = displayHeight * aspectRatio
      }

      // Set canvas internal size (high resolution for quality)
      const scale = 2 // Use 2x for retina displays
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // Set canvas display size
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`

      // Draw image to canvas at high resolution
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Store original image data
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      originalImageDataRef.current = data
      currentImageDataRef.current = new ImageData(
        new Uint8ClampedArray(data.data),
        data.width,
        data.height
      )
      
      setIsLoaded(true)
    }
  }, [src])

  // Handle mouse move for erasure
  useEffect(() => {
    if (!isLoaded) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx || !originalImageDataRef.current || !currentImageDataRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      const x = Math.floor((e.clientX - rect.left) * scaleX)
      const y = Math.floor((e.clientY - rect.top) * scaleY)

      // Get current image data
      const data = currentImageDataRef.current
      const pixels = data.data
      const scaledRadius = radius * Math.max(scaleX, scaleY)

      // Erase pixels in radius
      for (let dy = -scaledRadius; dy <= scaledRadius; dy++) {
        for (let dx = -scaledRadius; dx <= scaledRadius; dx++) {
          const px = x + dx
          const py = y + dy
          
          if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue
          
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > scaledRadius) continue

          const index = (py * canvas.width + px) * 4
          
          // Check if pixel is black (or dark) for dithered effect
          const r = pixels[index]
          const g = pixels[index + 1]
          const b = pixels[index + 2]
          const brightness = (r + g + b) / 3
          
          // Apply dithered erasure - more effect on darker pixels
          const isBlack = brightness < 128
          const fadeFactor = 1 - (distance / scaledRadius)
          const eraseAmount = isBlack 
            ? fadeFactor * (1 + ditherIntensity * 0.5)
            : fadeFactor
          
          // Create erasure effect by making pixels transparent
          const originalAlpha = originalImageDataRef.current.data[index + 3]
          const newAlpha = Math.max(0, originalAlpha * (1 - eraseAmount))
          pixels[index + 3] = newAlpha
        }
      }

      // Redraw canvas with updated pixels
      ctx.putImageData(data, 0, 0)
    }

    container.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isLoaded, radius, ditherIntensity])

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ cursor: 'crosshair' }}
    >
      {/* Canvas for pixel manipulation */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ 
          imageRendering: 'auto',
          pointerEvents: 'auto'
        }}
      />
    </div>
  )
}
