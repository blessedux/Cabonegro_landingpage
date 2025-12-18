'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface PerformanceMonitorProps {
  enabled?: boolean
  onFPSUpdate?: (fps: number) => void
  logToConsole?: boolean
}

/**
 * Performance monitor component for 3D scene
 * Tracks FPS and can report performance metrics
 */
export default function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  onFPSUpdate,
  logToConsole = false
}: PerformanceMonitorProps) {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsRef = useRef(0)

  useFrame(() => {
    if (!enabled) return

    frameCount.current++
    const currentTime = performance.now()
    const elapsed = currentTime - lastTime.current

    // Update FPS every second
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed)
      fpsRef.current = fps
      
      if (onFPSUpdate) {
        onFPSUpdate(fps)
      }

      if (logToConsole) {
        console.log(`[Performance] FPS: ${fps}`)
      }

      // Reset counters
      frameCount.current = 0
      lastTime.current = currentTime
    }
  })

  // Expose FPS to window for debugging
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      const interval = setInterval(() => {
        ;(window as any).__sceneFPS = fpsRef.current
      }, 1000)

      return () => {
        clearInterval(interval)
        delete (window as any).__sceneFPS
      }
    }
  }, [enabled])

  return null // This component doesn't render anything
}
