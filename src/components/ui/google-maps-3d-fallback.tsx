'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import googleMapsLoader from '@/lib/google-maps-loader'

// Type declarations for Google Maps API
declare global {
  interface Window {
    google: {
      maps: any;
    };
  }
}

interface GoogleMaps3DProps {
  center?: { lat: number; lng: number }
  range?: number
  tilt?: number
  heading?: number
  mode?: 'hybrid' | 'satellite' | 'terrain'
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: (error: Error) => void
  enableAutoRotation?: boolean
  enableSmoothTransitions?: boolean
}

export default function GoogleMaps3D({
  center = { lat: -53.1638, lng: -70.9171 }, // Cabo Negro, Chile coordinates
  range = 2000,
  tilt = 75,
  heading = 330,
  mode = 'hybrid',
  className = '',
  style = {},
  onLoad,
  onError,
  enableAutoRotation = true,
  enableSmoothTransitions = true
}: GoogleMaps3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Smooth animation function
  const animateToPosition = useCallback((targetTilt: number, targetHeading: number, duration: number = 2000) => {
    if (!mapInstanceRef.current || !enableSmoothTransitions) return

    const map = mapInstanceRef.current
    const startTilt = map.getTilt() || 0
    const startHeading = map.getHeading() || 0
    const startTime = Date.now()

    setIsAnimating(true)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      const easedProgress = easeInOutCubic(progress)

      const currentTilt = startTilt + (targetTilt - startTilt) * easedProgress
      const currentHeading = startHeading + (targetHeading - startHeading) * easedProgress

      map.setTilt(currentTilt)
      map.setHeading(currentHeading)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animate()
  }, [enableSmoothTransitions])

  // Auto-rotation effect
  const startAutoRotation = useCallback(() => {
    if (!enableAutoRotation || !mapInstanceRef.current) return

    let currentHeading = heading
    const rotationSpeed = 0.5 // degrees per frame

    const rotate = () => {
      if (!mapInstanceRef.current) return
      
      currentHeading = (currentHeading + rotationSpeed) % 360
      mapInstanceRef.current.setHeading(currentHeading)
      
      rotationIntervalRef.current = setTimeout(rotate, 50) // ~20 FPS
    }

    rotate()
  }, [enableAutoRotation, heading])

  // Stop auto-rotation
  const stopAutoRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      clearTimeout(rotationIntervalRef.current)
      rotationIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    // Use the global Google Maps loader to prevent multiple script loads
    googleMapsLoader.loadGoogleMaps()
      .then(() => {
        console.log('Google Maps loaded successfully via global loader')
        initializeMap()
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error)
        setHasError(true)
        onError?.(error)
      })

    // Cleanup function
    return () => {
      stopAutoRotation()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [onLoad, onError, stopAutoRotation])

  const initializeMap = () => {
    if (!mapRef.current || !(window as unknown as { google?: any }).google) return

    try {
      const map = new (window as unknown as { google: any }).google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        tilt: 0, // Start with 0 tilt for smooth animation
        heading: 0, // Start with 0 heading for smooth animation
        mapTypeId: mode === 'hybrid' ? (window as unknown as { google: any }).google.maps.MapTypeId.HYBRID : 
                   mode === 'satellite' ? (window as unknown as { google: any }).google.maps.MapTypeId.SATELLITE :
                   (window as unknown as { google: any }).google.maps.MapTypeId.TERRAIN,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }, { weight: 0.5 }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1a1a1a' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#2a2a2a' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#3a3a3a' }]
          },
          {
            featureType: 'poi',
            elementType: 'geometry.fill',
            stylers: [{ color: '#4a4a4a' }]
          }
        ]
      })

      mapInstanceRef.current = map
      setIsLoaded(true)
      onLoad?.()
      
      console.log('✅ Google Maps initialized successfully')

      // Start with smooth animation to target position
      setTimeout(() => {
        animateToPosition(tilt, heading, 3000)
        
        // Start auto-rotation after initial animation
        setTimeout(() => {
          startAutoRotation()
        }, 3500)
      }, 500)

    } catch (error) {
      console.error('❌ Error initializing Google Maps:', error)
      setHasError(true)
      onError?.(error as Error)
    }
  }

  // Handle mouse interactions
  const handleMouseEnter = useCallback(() => {
    stopAutoRotation()
  }, [stopAutoRotation])

  const handleMouseLeave = useCallback(() => {
    if (enableAutoRotation) {
      startAutoRotation()
    }
  }, [enableAutoRotation, startAutoRotation])

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/20 ${className}`} style={style}>
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Map Loading Failed</h3>
          <p className="text-gray-400 mb-6">Unable to load 3D map</p>
          <button 
            onClick={() => {
              setHasError(false)
              setIsLoaded(false)
              // Force reload by triggering a page refresh
              window.location.reload()
            }}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/20 ${className}`} style={style}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading 3D Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef}
      className={`${className} ${isAnimating ? 'transition-all duration-300' : ''}`}
      style={{
        ...style,
        transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
        filter: isAnimating ? 'brightness(1.1)' : 'brightness(1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  )
}
