'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface LoadingStats {
  images: {
    total: number
    loaded: number
    failed: number
  }
  fonts: {
    total: number
    loaded: number
  }
  components: {
    total: number
    mounted: number
  }
  totalProgress: number
}

interface UseContentLoaderOptions {
  onProgress?: (progress: number, stats: LoadingStats) => void
  minLoadingTime?: number // Minimum time to show preloader (ms)
  maxLoadingTime?: number // Maximum time before forcing completion (ms)
}

export function useContentLoader(options: UseContentLoaderOptions = {}) {
  const { onProgress, minLoadingTime = 2000, maxLoadingTime = 10000 } = options
  
  const [stats, setStats] = useState<LoadingStats>({
    images: { total: 0, loaded: 0, failed: 0 },
    fonts: { total: 0, loaded: 0 },
    components: { total: 0, mounted: 0 },
    totalProgress: 0,
  })

  const [isComplete, setIsComplete] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const imagePromisesRef = useRef<Promise<void>[]>([])
  const componentCountRef = useRef(0)
  const mountedComponentsRef = useRef<Set<string>>(new Set())

  // Track component mounting
  const registerComponent = useCallback((componentId: string) => {
    if (!mountedComponentsRef.current.has(componentId)) {
      mountedComponentsRef.current.add(componentId)
      componentCountRef.current = mountedComponentsRef.current.size
      // Component progress is calculated in stats updates
    }
  }, [])

  // Track images loading
  useEffect(() => {
    const trackImages = () => {
      const updateImageStats = () => {
        setStats((prev) => {
          const imageProgress = prev.images.total > 0 
            ? (prev.images.loaded / prev.images.total) * 100 
            : 100
          
          const fontProgress = prev.fonts.total > 0 
            ? (prev.fonts.loaded / prev.fonts.total) * 100 
            : 100
          
          const expectedComponents = 8
          const componentProgress = expectedComponents > 0
            ? Math.min(100, (componentCountRef.current / expectedComponents) * 100)
            : 100

          const totalProgress = Math.min(
            100,
            imageProgress * 0.5 + fontProgress * 0.2 + componentProgress * 0.3
          )

          return {
            ...prev,
            components: {
              total: expectedComponents,
              mounted: componentCountRef.current,
            },
            totalProgress,
          }
        })
      }
      const images: HTMLImageElement[] = Array.from(document.querySelectorAll('img'))
      const backgroundImages: string[] = []
      
      // Get background images from computed styles
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        const bgImage = styles.backgroundImage
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)
          if (urlMatch && urlMatch[1]) {
            backgroundImages.push(urlMatch[1])
          }
        }
      })

      const imagePromises: Promise<void>[] = []

      // Track regular images
      images.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          // Already loaded
          return
        }

        const promise = new Promise<void>((resolve, reject) => {
          if (img.complete) {
            resolve()
            return
          }

          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => reject(), { once: true })
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (!img.complete) {
              reject()
            }
          }, 5000)
        })

        imagePromises.push(promise)
      })

      // Track background images
      backgroundImages.forEach((url) => {
        const img = new Image()
        const promise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = url
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (!img.complete) {
              reject()
            }
          }, 5000)
        })
        imagePromises.push(promise)
      })

      imagePromisesRef.current = imagePromises
      const totalImages = images.length + backgroundImages.length
      const initiallyLoaded = images.filter((img) => img.complete && img.naturalWidth > 0).length

      // Update initial stats
      setStats((prev) => {
        const newStats = {
          ...prev,
          images: {
            total: totalImages || prev.images.total,
            loaded: initiallyLoaded,
            failed: 0,
          },
        }
        
        // Calculate progress
        const imageProgress = newStats.images.total > 0 
          ? (newStats.images.loaded / newStats.images.total) * 100 
          : 100
        
        const fontProgress = newStats.fonts.total > 0 
          ? (newStats.fonts.loaded / newStats.fonts.total) * 100 
          : 100
        
        const expectedComponents = 8
        const elapsed = Date.now() - startTimeRef.current
        const componentProgress = elapsed > 1500 ? 100 : Math.min(100, (elapsed / 1500) * 100)

        // Adjusted weights: Images 60%, Fonts 30%, Components 10%
        const totalProgress = Math.min(
          100,
          imageProgress * 0.6 + fontProgress * 0.3 + componentProgress * 0.1
        )

        onProgress?.(totalProgress, {
          ...newStats,
          components: {
            total: expectedComponents,
            mounted: Math.floor((componentProgress / 100) * expectedComponents),
          },
          totalProgress,
        })

        return {
          ...newStats,
          components: {
            total: expectedComponents,
            mounted: Math.floor((componentProgress / 100) * expectedComponents),
          },
          totalProgress,
        }
      })

      if (totalImages === 0) {
        return
      }

      let loaded = initiallyLoaded
      let failed = 0

      imagePromises.forEach((promise) => {
        promise
          .then(() => {
            loaded++
            setStats((prev) => {
              const newStats = {
                ...prev,
                images: {
                  ...prev.images,
                  loaded,
                },
              }
              
              const imageProgress = newStats.images.total > 0 
                ? (newStats.images.loaded / newStats.images.total) * 100 
                : 100
              
              const fontProgress = newStats.fonts.total > 0 
                ? (newStats.fonts.loaded / newStats.fonts.total) * 100 
                : 100
              
              // Component progress - estimate based on time
              const elapsed = Date.now() - startTimeRef.current
              const componentProgress = elapsed > 1500 ? 100 : Math.min(100, (elapsed / 1500) * 100)

              // Adjusted weights: Images 60%, Fonts 30%, Components 10%
              const totalProgress = Math.min(
                100,
                imageProgress * 0.6 + fontProgress * 0.3 + componentProgress * 0.1
              )

              const expectedComponents = 8
              onProgress?.(totalProgress, {
                ...newStats,
                components: {
                  total: expectedComponents,
                  mounted: Math.floor((componentProgress / 100) * expectedComponents),
                },
                totalProgress,
              })

              return {
                ...newStats,
                components: {
                  total: expectedComponents,
                  mounted: Math.floor((componentProgress / 100) * expectedComponents),
                },
                totalProgress,
              }
            })
          })
          .catch(() => {
            failed++
            setStats((prev) => ({
              ...prev,
              images: {
                ...prev.images,
                failed,
              },
            }))
          })
      })
    }

    // Wait a bit for DOM to be ready
    const timeout = setTimeout(() => {
      trackImages()
    }, 100)

    // Also track images that load after initial check
    const observer = new MutationObserver(() => {
      trackImages()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [onProgress])

  // Track fonts loading - improved tracking with throttling
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      return
    }

    let fontsReadyResolved = false
    let lastUpdateTime = 0
    const UPDATE_THROTTLE = 500 // Update max once per 500ms

    const updateFontStats = () => {
      const now = Date.now()
      // Throttle updates to prevent excessive re-renders
      if (now - lastUpdateTime < UPDATE_THROTTLE) {
        return
      }
      lastUpdateTime = now

      const fontFaces = Array.from(document.fonts.values())
      
      // Check each font - count loaded and unloaded (unloaded often means cached/available)
      let loadedCount = 0
      fontFaces.forEach((font) => {
        // 'loaded' means definitely loaded
        // 'unloaded' often means it's available but not actively loading (cached/system font)
        if (font.status === 'loaded' || font.status === 'unloaded') {
          loadedCount++
        }
      })
      
      // If fonts.ready has resolved, consider fonts as mostly loaded
      if (fontsReadyResolved && fontFaces.length > 0) {
        // If fonts.ready resolved but we're seeing low loaded count,
        // assume most fonts are actually available
        if (loadedCount < fontFaces.length * 0.7) {
          loadedCount = Math.max(loadedCount, Math.floor(fontFaces.length * 0.9))
        }
      }

      setStats((prev) => {
        const newStats = {
          ...prev,
          fonts: {
            total: Math.max(fontFaces.length, prev.fonts.total),
            loaded: loadedCount,
          },
        }
        
        const imageProgress = newStats.images.total > 0 
          ? (newStats.images.loaded / newStats.images.total) * 100 
          : 100
        
        // If fonts.ready resolved, assume high font progress
        let fontProgress = 100
        if (newStats.fonts.total > 0) {
          fontProgress = (newStats.fonts.loaded / newStats.fonts.total) * 100
          if (fontsReadyResolved && fontProgress < 90) {
            fontProgress = 90
          }
        }
        
        // Component progress - estimate based on time (components mount quickly)
        const expectedComponents = 8
        const elapsed = Date.now() - startTimeRef.current
        // Estimate components as mounting over first 1.5 seconds
        const componentProgress = elapsed > 1500 ? 100 : Math.min(100, (elapsed / 1500) * 100)

        // Adjusted weights: Images 60%, Fonts 30%, Components 10%
        const totalProgress = Math.min(
          100,
          imageProgress * 0.6 + fontProgress * 0.3 + componentProgress * 0.1
        )

        onProgress?.(totalProgress, {
          ...newStats,
          components: {
            total: expectedComponents,
            mounted: Math.floor((componentProgress / 100) * expectedComponents), // Show estimated mounted count
          },
          totalProgress,
        })

        return {
          ...newStats,
          components: {
            total: expectedComponents,
            mounted: Math.floor((componentProgress / 100) * expectedComponents),
          },
          totalProgress,
        }
      })
    }

    // Initial font check
    const trackFonts = async () => {
      try {
        await document.fonts.ready
        fontsReadyResolved = true
        updateFontStats()
      } catch (error) {
        console.warn('Font tracking error:', error)
        updateFontStats()
      }
    }

    trackFonts()

    // Check fonts less frequently to reduce updates
    const fontCheckInterval = setInterval(() => {
      updateFontStats()
    }, 800) // Reduced frequency

    // Listen for font loading events (but throttled)
    const handleFontLoad = () => {
      updateFontStats()
    }
    
    document.fonts.addEventListener('loadingdone', handleFontLoad)
    
    return () => {
      clearInterval(fontCheckInterval)
      document.fonts.removeEventListener('loadingdone', handleFontLoad)
    }
  }, [onProgress])

  // Check completion status periodically
  useEffect(() => {
    const checkCompletion = () => {
      setStats((prev) => {
        const imageProgress = prev.images.total > 0 
          ? (prev.images.loaded / prev.images.total) * 100 
          : 100
        
        const fontProgress = prev.fonts.total > 0 
          ? (prev.fonts.loaded / prev.fonts.total) * 100 
          : 100
        
        // Component progress - estimate based on time
        const elapsed = Date.now() - startTimeRef.current
        const componentProgress = elapsed > 1000 ? 100 : Math.min(100, (elapsed / 1000) * 100)

        // Adjusted weights: Images 60%, Fonts 30%, Components 10%
        const totalProgress = Math.min(
          100,
          imageProgress * 0.6 + fontProgress * 0.3 + componentProgress * 0.1
        )

        // Check if loading is complete
        const minTimeElapsed = elapsed >= minLoadingTime
        const maxTimeElapsed = elapsed >= maxLoadingTime
        
        // Consider complete if:
        // 1. All critical resources are loaded (images 90%+, fonts 100%, components reasonable)
        // 2. Minimum time has elapsed
        // OR max time has elapsed (force complete)
        const isActuallyComplete = 
          (imageProgress >= 90 && fontProgress >= 100 && componentProgress >= 80 && minTimeElapsed) ||
          maxTimeElapsed

        if (isActuallyComplete && !isComplete) {
          // First time reaching completion
          setTimeout(() => {
            setIsComplete(true)
          }, 200) // Small delay to ensure smooth transition
        }

        return prev
      })
    }

    const interval = setInterval(checkCompletion, 200)
    return () => clearInterval(interval)
  }, [minLoadingTime, maxLoadingTime, isComplete])

  return {
    stats,
    isComplete,
    registerComponent,
    progress: stats.totalProgress,
  }
}

