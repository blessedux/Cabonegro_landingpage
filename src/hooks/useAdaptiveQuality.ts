'use client'

import { useState, useEffect, useRef } from 'react'

export type QualityLevel = 'low' | 'medium' | 'ultra'

interface NetworkMetrics {
  bandwidth: number // Mbps
  latency: number // ms
  connectionType: string
  effectiveType: string
}

interface PerformanceMetrics {
  loadTime: number // ms
  fps: number
  frameTime: number // ms
}

interface AdaptiveQualityState {
  quality: QualityLevel
  networkMetrics: NetworkMetrics | null
  performanceMetrics: PerformanceMetrics | null
  canUpgrade: boolean
  shouldDowngrade: boolean
}

const QUALITY_THRESHOLDS = {
  // Network thresholds
  ULTRA_MIN_BANDWIDTH: 10, // Mbps
  MEDIUM_MIN_BANDWIDTH: 3, // Mbps
  ULTRA_MAX_LATENCY: 100, // ms
  MEDIUM_MAX_LATENCY: 200, // ms
  
  // Performance thresholds
  ULTRA_MIN_FPS: 50,
  MEDIUM_MIN_FPS: 30,
  ULTRA_MAX_LOAD_TIME: 3000, // ms
  MEDIUM_MAX_LOAD_TIME: 5000, // ms
  ULTRA_MAX_FRAME_TIME: 20, // ms
  MEDIUM_MAX_FRAME_TIME: 33, // ms
}

/**
 * Hook to detect network conditions and performance metrics
 * and determine appropriate quality level for terrain texture
 */
export function useAdaptiveQuality(): AdaptiveQualityState {
  const [quality, setQuality] = useState<QualityLevel>('low')
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [canUpgrade, setCanUpgrade] = useState(false)
  const [shouldDowngrade, setShouldDowngrade] = useState(false)
  
  const loadStartTime = useRef<number>(Date.now())
  const frameTimes = useRef<number[]>([])
  const lastFrameTime = useRef<number>(performance.now())
  const frameCount = useRef<number>(0)
  const fpsInterval = useRef<number>(0)

  // Detect network conditions
  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) return

    const detectNetwork = async () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        const updateNetworkMetrics = () => {
          const bandwidth = connection.downlink || 0 // Mbps
          const latency = connection.rtt || 0 // ms
          const connectionType = connection.type || 'unknown'
          const effectiveType = connection.effectiveType || 'unknown'

          setNetworkMetrics({
            bandwidth,
            latency,
            connectionType,
            effectiveType
          })

          // Determine quality based on network
          let newQuality: QualityLevel = 'low'
          
          if (bandwidth >= QUALITY_THRESHOLDS.ULTRA_MIN_BANDWIDTH && 
              latency <= QUALITY_THRESHOLDS.ULTRA_MAX_LATENCY) {
            newQuality = 'ultra'
          } else if (bandwidth >= QUALITY_THRESHOLDS.MEDIUM_MIN_BANDWIDTH && 
                     latency <= QUALITY_THRESHOLDS.MEDIUM_MAX_LATENCY) {
            newQuality = 'medium'
          } else {
            newQuality = 'low'
          }

          // Only upgrade if conditions allow, but allow downgrade anytime
          if (newQuality === 'ultra' && quality !== 'ultra') {
            setCanUpgrade(true)
          } else if (newQuality === 'medium' && quality === 'low') {
            setCanUpgrade(true)
          } else if (newQuality === 'low' && quality !== 'low') {
            setShouldDowngrade(true)
          }
        }

        updateNetworkMetrics()
        connection.addEventListener('change', updateNetworkMetrics)
        
        return () => {
          connection.removeEventListener('change', updateNetworkMetrics)
        }
      } else {
        // Fallback: try to measure bandwidth manually
        measureBandwidth().then((estimatedBandwidth) => {
          setNetworkMetrics({
            bandwidth: estimatedBandwidth,
            latency: 0,
            connectionType: 'unknown',
            effectiveType: 'unknown'
          })
        })
      }
    }

    detectNetwork()
  }, [])

  // Measure bandwidth manually if Connection API is not available
  const measureBandwidth = async (): Promise<number> => {
    try {
      const startTime = performance.now()
      const response = await fetch('/assets/terrain/terrain-texture-low.png', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      const endTime = performance.now()
      
      if (response.headers.get('content-length')) {
        const sizeBytes = parseInt(response.headers.get('content-length') || '0')
        const timeSeconds = (endTime - startTime) / 1000
        const bandwidthMbps = (sizeBytes * 8) / (timeSeconds * 1000000) // Convert to Mbps
        return bandwidthMbps
      }
    } catch (error) {
      console.warn('[useAdaptiveQuality] Failed to measure bandwidth:', error)
    }
    return 0
  }

  // Monitor performance metrics
  useEffect(() => {
    let animationFrameId: number
    let lastTime = performance.now()

    const measurePerformance = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastTime
      lastTime = currentTime

      frameTimes.current.push(frameTime)
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift() // Keep last 60 frames
      }

      frameCount.current++
      const elapsed = currentTime - fpsInterval.current
      
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed)
        const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length

        setPerformanceMetrics({
          loadTime: currentTime - loadStartTime.current,
          fps,
          frameTime: avgFrameTime
        })

        // Check if we should downgrade based on performance
        if (quality === 'ultra' && (fps < QUALITY_THRESHOLDS.ULTRA_MIN_FPS || avgFrameTime > QUALITY_THRESHOLDS.ULTRA_MAX_FRAME_TIME)) {
          setShouldDowngrade(true)
        } else if (quality === 'medium' && (fps < QUALITY_THRESHOLDS.MEDIUM_MIN_FPS || avgFrameTime > QUALITY_THRESHOLDS.MEDIUM_MAX_FRAME_TIME)) {
          setShouldDowngrade(true)
        }

        frameCount.current = 0
        fpsInterval.current = currentTime
      }

      animationFrameId = requestAnimationFrame(measurePerformance)
    }

    fpsInterval.current = performance.now()
    animationFrameId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [quality])

  // Monitor load time for texture loading
  useEffect(() => {
    loadStartTime.current = Date.now()
  }, [])

  // Update quality based on metrics
  useEffect(() => {
    if (shouldDowngrade) {
      if (quality === 'ultra') {
        setQuality('medium')
      } else if (quality === 'medium') {
        setQuality('low')
      }
      setShouldDowngrade(false)
      setCanUpgrade(false)
      return
    }

    if (canUpgrade && networkMetrics && performanceMetrics) {
      const hasGoodNetwork = 
        networkMetrics.bandwidth >= QUALITY_THRESHOLDS.ULTRA_MIN_BANDWIDTH &&
        networkMetrics.latency <= QUALITY_THRESHOLDS.ULTRA_MAX_LATENCY
      
      const hasGoodPerformance = 
        performanceMetrics.fps >= QUALITY_THRESHOLDS.ULTRA_MIN_FPS &&
        performanceMetrics.frameTime <= QUALITY_THRESHOLDS.ULTRA_MAX_FRAME_TIME

      if (hasGoodNetwork && hasGoodPerformance && quality !== 'ultra') {
        setQuality('ultra')
        setCanUpgrade(false)
      } else if (
        networkMetrics.bandwidth >= QUALITY_THRESHOLDS.MEDIUM_MIN_BANDWIDTH &&
        networkMetrics.latency <= QUALITY_THRESHOLDS.MEDIUM_MAX_LATENCY &&
        performanceMetrics.fps >= QUALITY_THRESHOLDS.MEDIUM_MIN_FPS &&
        quality === 'low'
      ) {
        setQuality('medium')
        setCanUpgrade(false)
      }
    }
  }, [canUpgrade, shouldDowngrade, networkMetrics, performanceMetrics, quality])

  return {
    quality,
    networkMetrics,
    performanceMetrics,
    canUpgrade,
    shouldDowngrade
  }
}
