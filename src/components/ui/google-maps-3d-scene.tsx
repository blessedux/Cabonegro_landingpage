'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import googleMapsLoader from '@/lib/google-maps-loader'

interface GoogleMaps3DSceneProps {
  center?: { lat: number; lng: number }
  altitude?: number
  tilt?: number
  heading?: number
  zoom?: number
  mode?: 'hybrid' | 'satellite' | 'terrain'
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: (error: Error) => void
  enableAutoRotation?: boolean
  enableSmoothTransitions?: boolean
  enableAltitudeView?: boolean
}

export default function GoogleMaps3DScene({
  center = { lat: -52.9184179568509, lng: -70.8293537877123 }, // Cabo Negro, Primavera, Magallanes, Chile
  altitude = 200000, // Start from deep space altitude
  tilt = 0,
  heading = 0,
  zoom = 0, // Start from very far away (space view)
  mode = 'hybrid',
  className = '',
  style = {},
  onLoad,
  onError,
  enableAutoRotation = true,
  enableSmoothTransitions = true,
  enableAltitudeView = true
}: GoogleMaps3DSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Convert altitude to appropriate zoom level
  const getZoomFromAltitude = useCallback((altitude: number) => {
    // Higher altitude = lower zoom level (more zoomed out)
    // This is a rough approximation - you may need to adjust based on testing
    if (altitude > 20000) return 8
    if (altitude > 15000) return 9
    if (altitude > 10000) return 10
    if (altitude > 5000) return 11
    if (altitude > 2000) return 12
    return 13
  }, [])

  // Auto-rotation effect with altitude-aware speed
  const startAutoRotation = useCallback(() => {
    if (!enableAutoRotation || !mapInstanceRef.current) return

    let currentHeading = heading
    // Slower rotation for high altitude views
    const rotationSpeed = altitude > 20000 ? 0.2 : 0.5

    const rotate = () => {
      if (!mapInstanceRef.current) return
      
      currentHeading = (currentHeading + rotationSpeed) % 360
      mapInstanceRef.current.setHeading(currentHeading)
      
      rotationIntervalRef.current = setTimeout(rotate, 50) // ~20 FPS
    }

    rotate()
  }, [enableAutoRotation, heading, altitude])

  // Smooth animation system for continuous movement
  const animateToPosition = useCallback((targetZoom: number, targetTilt: number, targetHeading: number, duration: number = 3000) => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    const startZoom = map.getZoom() || 1
    const startTilt = map.getTilt() || 0
    const startHeading = map.getHeading() || 0
    const startTime = Date.now()

    setIsAnimating(true)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      const easedProgress = easeInOutCubic(progress)

      const currentZoom = startZoom + (targetZoom - startZoom) * easedProgress
      const currentTilt = startTilt + (targetTilt - startTilt) * easedProgress
      const currentHeading = startHeading + (targetHeading - startHeading) * easedProgress

      map.setZoom(currentZoom)
      map.setTilt(currentTilt)
      map.setHeading(currentHeading)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animate()
  }, [])

  // Camera rotation around the final location
  const startCameraRotation = useCallback(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    console.log('🎥 Starting camera rotation around Cabo Negro')
    
    let currentHeading = 330
    const rotationSpeed = 0.3 // Slower rotation for cinematic effect

    const rotate = () => {
      if (!mapInstanceRef.current) return
      
      currentHeading = (currentHeading + rotationSpeed) % 360
      mapInstanceRef.current.setHeading(currentHeading)
      
      rotationIntervalRef.current = setTimeout(rotate, 50) // ~20 FPS
    }

    rotate()
  }, [])

  // Epic space-to-earth cinematic journey with smooth animations
  const createDramaticZoomIn = useCallback(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    console.log('🌍 Starting epic cinematic journey from space to Cabo Negro, Primavera, Magallanes, Chile')
    
    // Phase 1: Space view - Start from very far away (Asia)
    map.setZoom(0) // Even further away
    map.setTilt(0)
    map.setHeading(0) // Start facing Asia
    
    setTimeout(() => {
      // Phase 2: Smooth zoom and rotate to South America
      animateToPosition(2, 5, 180, 4000) // 4 seconds smooth animation
      
      setTimeout(() => {
        // Phase 3: Focus on South America
        animateToPosition(4, 15, 200, 4000)
        
        setTimeout(() => {
          // Phase 4: Zoom to Patagonia region
          animateToPosition(6, 25, 220, 4000)
          
          setTimeout(() => {
            // Phase 5: Zoom to Magallanes region
            animateToPosition(8, 35, 240, 4000)
            
            setTimeout(() => {
              // Phase 6: Final zoom to Cabo Negro
              animateToPosition(12, 45, 330, 4000)
              
              console.log('🎯 Reached Cabo Negro - Starting camera rotation')
              
              // Start camera rotation around the location
              setTimeout(() => {
                startCameraRotation()
              }, 2000)
              
            }, 4000) // Phase 6 delay
          }, 4000) // Phase 5 delay
        }, 4000) // Phase 4 delay
      }, 4000) // Phase 3 delay
    }, 2000) // Phase 2 delay
  }, [animateToPosition, startCameraRotation])

  // Stop auto-rotation
  const stopAutoRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      clearTimeout(rotationIntervalRef.current)
      rotationIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    console.log('🚀 Creating 3D Scene with coordinates:', center)
    console.log('📍 Altitude:', altitude, 'meters')
    console.log('🔄 Current state - isLoaded:', isLoaded, 'hasError:', hasError)
    
    // Use the global Google Maps loader to prevent multiple script loads
    googleMapsLoader.loadGoogleMaps()
      .then(() => {
        console.log('✅ Google Maps loaded successfully via global loader')
        console.log('🔄 About to call initializeMap')
        
        // Wait for DOM element to be available
        const waitForElement = () => {
          if (mapRef.current) {
            console.log('🔄 DOM element ready - mapRef.current:', mapRef.current)
            initializeMap()
          } else {
            console.log('🔄 Waiting for DOM element...')
            setTimeout(waitForElement, 50)
          }
        }
        waitForElement()
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error)
        setHasError(true)
        onError?.(error)
      })

    // Cleanup function
    return () => {
      stopAutoRotation()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Cleanup the loader timeout if needed
      googleMapsLoader.cleanup()
    }
  }, [onLoad, onError, stopAutoRotation, center, altitude])

  const initializeMap = () => {
    console.log('🔍 initializeMap called')
    console.log('🔍 mapRef.current:', mapRef.current)
    console.log('🔍 window.google:', (window as any).google)
    console.log('🔍 window.google.maps:', (window as any).google?.maps)
    
    if (!mapRef.current) {
      console.error('❌ mapRef.current is null')
      return
    }
    
    if (!(window as any).google) {
      console.error('❌ window.google is not available')
      return
    }
    
    if (!(window as any).google.maps) {
      console.error('❌ window.google.maps is not available')
      return
    }
    
    if (!(window as any).google.maps.MapTypeId) {
      console.error('❌ window.google.maps.MapTypeId is not available')
      return
    }

    try {
      const calculatedZoom = enableAltitudeView ? getZoomFromAltitude(altitude) : zoom
      
      console.log('🗺️ Initializing 3D Map Scene:')
      console.log('   📍 Center:', center)
      console.log('   🏔️ Altitude:', altitude, 'm')
      console.log('   🔍 Zoom:', calculatedZoom)
      console.log('   📐 Tilt:', tilt)
      console.log('   🧭 Heading:', heading)

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: center,
        zoom: 0, // Start from very far away (space view)
        tilt: 0, // Start with no tilt
        heading: 0, // Start facing Asia
        mapTypeId: mode === 'hybrid' ? (window as any).google.maps.MapTypeId?.HYBRID || 'hybrid' : 
                   mode === 'satellite' ? (window as any).google.maps.MapTypeId?.SATELLITE || 'satellite' :
                   (window as any).google.maps.MapTypeId?.TERRAIN || 'terrain',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: 'none',
        disableDefaultUI: true,
        keyboardShortcuts: false,
        scrollwheel: false,
        draggable: false,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'administrative.country',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'administrative.province',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'water',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1a1a1a' }, { weight: 0.5 }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#0a0a0a' }]
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

      console.log('🗺️ Map instance created:', map)
      mapInstanceRef.current = map
      setIsLoaded(true)
      onLoad?.()
      
      console.log('✅ 3D Map Scene initialized successfully')

      // Start dramatic zoom-in animation
      setTimeout(() => {
        createDramaticZoomIn()
      }, 1000)

    } catch (error) {
      console.error('❌ Error initializing 3D Map Scene:', error)
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
          <h3 className="text-xl font-semibold mb-4 text-white">3D Scene Loading Failed</h3>
          <p className="text-gray-400 mb-6">Unable to load 3D map scene</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>📍 Coordinates: {center.lat}, {center.lng}</p>
            <p>🏔️ Altitude: {altitude}m</p>
          </div>
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

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Map container - always rendered */}
      <div 
        ref={mapRef}
        className={`w-full h-full ${isAnimating ? 'transition-all duration-500' : ''}`}
        style={{
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
          filter: isAnimating ? 'brightness(1.2) contrast(1.1)' : 'brightness(1) contrast(1)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Loading overlay - only show when not loaded and no error */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white mb-2">Loading 3D Scene...</p>
            <div className="text-sm text-gray-400">
              <p>📍 {center.lat}, {center.lng}</p>
              <p>🏔️ Altitude: {altitude}m</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
