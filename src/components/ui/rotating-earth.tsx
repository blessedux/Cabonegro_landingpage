"use client"

import { useEffect, useRef, useState } from "react"

import * as d3 from "d3"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dotCoords, setDotCoords] = useState<[number, number]>([-70.8056, -52.9479]) // Chile coordinates
  const [glowAnimation, setGlowAnimation] = useState(0)
  const dotCoordsRef = useRef<[number, number]>([-70.8056, -52.9479])
  const glowAnimationRef = useRef(0)

  // Sync refs with state
  useEffect(() => {
    dotCoordsRef.current = dotCoords
  }, [dotCoords])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        // Check if point is in outer ring
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        // Check if point is in any hole (inner rings)
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false // Point is in a hole
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        // Check each polygon in the MultiPolygon
        for (const polygon of geometry.coordinates) {
          // Check if point is in outer ring
          if (pointInPolygon(point, polygon[0])) {
            // Check if point is in any hole
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08
      let pointsGenerated = 0

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
            pointsGenerated++
          }
        }
      }

      // Only log in development mode to reduce console spam
      if (process.env.NODE_ENV === 'development' && pointsGenerated > 100) {
        console.log(
          `[RotatingEarth] Generated ${pointsGenerated} points for land feature:`,
          feature.properties?.featurecla || "Land",
        )
      }
      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    const allDots: DotData[] = []
    let landFeatures: any

    const render = () => {
      // Clear canvas with transparency
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background) with transparency
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "rgba(0, 0, 0, 0.3)" // Semi-transparent black
      context.fill()
      context.strokeStyle = "#ffffff"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.25
        context.stroke()
        context.globalAlpha = 1

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "#999999"
            context.fill()
          }
        })

        // Draw glowing dot at specified coordinates
        const dotProjected = projection([dotCoordsRef.current[0], dotCoordsRef.current[1]])
        if (dotProjected) {
          const glowSize = 20 + Math.sin(glowAnimationRef.current) * 5 // Pulsing effect
          const glowOpacity = 0.6 + Math.sin(glowAnimationRef.current) * 0.2
          
          // Outer glow (larger, more transparent)
          const gradient1 = context.createRadialGradient(
            dotProjected[0], dotProjected[1], 0,
            dotProjected[0], dotProjected[1], glowSize * 2
          )
          gradient1.addColorStop(0, `rgba(34, 211, 238, ${glowOpacity * 0.3})`) // cyan-400
          gradient1.addColorStop(0.5, `rgba(34, 211, 238, ${glowOpacity * 0.15})`)
          gradient1.addColorStop(1, `rgba(34, 211, 238, 0)`)
          
          context.beginPath()
          context.arc(dotProjected[0], dotProjected[1], glowSize * 2, 0, 2 * Math.PI)
          context.fillStyle = gradient1
          context.fill()
          
          // Middle glow
          const gradient2 = context.createRadialGradient(
            dotProjected[0], dotProjected[1], 0,
            dotProjected[0], dotProjected[1], glowSize
          )
          gradient2.addColorStop(0, `rgba(34, 211, 238, ${glowOpacity * 0.8})`)
          gradient2.addColorStop(0.7, `rgba(34, 211, 238, ${glowOpacity * 0.4})`)
          gradient2.addColorStop(1, `rgba(34, 211, 238, 0)`)
          
          context.beginPath()
          context.arc(dotProjected[0], dotProjected[1], glowSize, 0, 2 * Math.PI)
          context.fillStyle = gradient2
          context.fill()
          
          // Inner core dot
          context.beginPath()
          context.arc(dotProjected[0], dotProjected[1], 4 * scaleFactor, 0, 2 * Math.PI)
          context.fillStyle = `rgba(34, 211, 238, ${glowOpacity})` // cyan-400
          context.fill()
          
          // White center
          context.beginPath()
          context.arc(dotProjected[0], dotProjected[1], 2 * scaleFactor, 0, 2 * Math.PI)
          context.fillStyle = "#ffffff"
          context.fill()
        }
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        // Generate dots for all land features with optimized step size
        // Increased step size from 16 to 24 to reduce point count by ~40%
        let totalDots = 0
        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 24) // Increased from 16 to 24 for better performance
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
            totalDots++
          })
        })

        if (process.env.NODE_ENV === 'development') {
          console.log(`[RotatingEarth] Total dots generated: ${totalDots} across ${landFeatures.features.length} land features`)
        }

        render()
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    // Set up rotation and interaction - start focused on South America
    // Looking from bottom to top at 45-degree angle
    const rotation: [number, number] = [-70, 30] // Longitude for Chile, -45 latitude for 45-degree bottom-to-top view
    let autoRotate = true
    const rotationSpeed = 0.325 // 65% of original speed (0.5 * 0.65 = 0.325)
    
    // Set initial zoom to 100% (default/base radius, not zoomed in)
    projection.scale(radius)
    projection.rotate(rotation)

    // Glow animation timer
    const glowTimer = d3.timer(() => {
      glowAnimationRef.current += 0.05
      setGlowAnimation(glowAnimationRef.current)
      render()
    })

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    }

    // Auto-rotation timer
    const rotationTimer = d3.timer(rotate)

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation: [number, number] = [rotation[0], rotation[1]]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    // Pinch zoom support
    let initialDistance = 0
    let initialScale = radius

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        autoRotate = false
        initialDistance = getDistance(event.touches[0], event.touches[1])
        initialScale = projection.scale()
        event.preventDefault()
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const currentDistance = getDistance(event.touches[0], event.touches[1])
        const scaleFactor = currentDistance / initialDistance
        const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, initialScale * scaleFactor))
        projection.scale(newRadius)
        render()
        event.preventDefault()
      } else if (event.touches.length === 1) {
        // Single touch - allow rotation
        autoRotate = false
        const touch = event.touches[0]
        const sensitivity = 0.5
        const dx = touch.clientX - (canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().width / 2)
        const dy = touch.clientY - (canvas.getBoundingClientRect().top + canvas.getBoundingClientRect().height / 2)
        
        rotation[0] += dx * sensitivity * 0.01
        rotation[1] -= dy * sensitivity * 0.01
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))
        
        projection.rotate(rotation)
        render()
        event.preventDefault()
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        setTimeout(() => {
          autoRotate = true
        }, 10)
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    // Load the world data
    loadWorldData()

    // Cleanup
    return () => {
      rotationTimer.stop()
      glowTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [width, height])

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl"
        style={{ maxWidth: "100%", height: "auto", background: "transparent" }}
      />
      
      {/* Location Info Panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-sm text-white mx-4 md:mx-0 max-w-[calc(100%-2rem)] md:max-w-none">
        <div className="space-y-1 text-xs sm:text-sm text-center md:text-left">
          <div className="text-white">
            Estrecho de Magallanes, Chile
          </div>
          <div>
            <a
              href={`https://www.google.com/maps?q=${dotCoords[1]},${dotCoords[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 underline cursor-pointer transition-colors"
            >
              {dotCoords[1].toFixed(4)}°S, {Math.abs(dotCoords[0]).toFixed(4)}°W
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

