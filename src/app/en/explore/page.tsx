'use client'

import { useState, useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'

function ExploreContent() {
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [splineLoaded, setSplineLoaded] = useState(false)
  const [splineError, setSplineError] = useState(false)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  // If user has seen preloader before, skip it and show content immediately
  useEffect(() => {
    console.log('English explore - preloader state:', { hasSeenPreloader, isPreloaderVisible, preloaderFadeComplete })
    if (hasSeenPreloader) {
      setPreloaderFadeComplete(true)
    }
    
    // Fallback: show content after 8 seconds regardless of preloader state
    const fallbackTimer = setTimeout(() => {
      console.log('English explore - fallback timer triggered')
      setPreloaderFadeComplete(true)
    }, 8000)
    
    return () => clearTimeout(fallbackTimer)
  }, [hasSeenPreloader])

  // Reset preloader state when pathname changes (language switch)
  useEffect(() => {
    console.log('Spanish explore - mount effect triggered')
    setPreloaderFadeComplete(true)
  }, [])

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    
    // Wait for preloader fade to complete before showing main content
    setTimeout(() => {
      setPreloaderFadeComplete(true)
    }, 1000) // Match the preloader fade duration
  }

  return (
    <>
      {/* Debug info */}
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white p-2 text-xs">
        Spanish Explore Debug: preloaderFadeComplete={preloaderFadeComplete.toString()}, isPreloaderVisible={isPreloaderVisible.toString()}
      </div>

      {/* Simplified version - bypass preloader for debugging */}
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <Navbar />
        
        {/* Main Content - Spline Scene */}
        <main className="pt-32 pb-20 px-6">
          <div className="container mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Explora Cabo Negro
              </h1>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Descubre la ubicación estratégica y las ventajas únicas de Cabo Negro 
                en el corazón de la Región de Magallanes a través de nuestra experiencia 3D interactiva.
              </p>
            </div>

            {/* Spline Scene Container */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/50">
              {!splineError ? (
                <div className="w-full h-full overflow-hidden rounded-xl sm:rounded-2xl">
                  <iframe 
                    src="https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/" 
                    frameBorder="0" 
                    width="100%" 
                    height="100%"
                    className="w-full h-full"
                    style={{
                      transform: 'scale(1.4)',
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%'
                    }}
                    title="Escena 3D Interactiva de Cabo Negro"
                    loading="eager"
                    allow="fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                    onLoad={() => {
                      console.log('Spline iframe loaded successfully')
                      setSplineLoaded(true)
                    }}
                    onError={(e) => {
                      console.error('Spline iframe error:', e)
                      setSplineError(true)
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/20">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Experiencia 3D No Disponible</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      La escena 3D interactiva no pudo cargarse. Por favor, intenta actualizar la página.
                    </p>
                    <button 
                      onClick={() => {
                        setSplineError(false)
                        setSplineLoaded(false)
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading overlay - only show when not loaded and no error */}
              {!splineLoaded && !splineError && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl sm:rounded-2xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-white/80 text-sm sm:text-base">Cargando Experiencia 3D...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="mt-8 sm:mt-12 text-center">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                <div className="p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Ubicación Estratégica</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Puerta de entrada a la Antártida y ruta alternativa al Canal de Panamá
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Ventajas Marítimas</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Condiciones de puerto protegido con mínimo impacto ambiental
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-colors sm:col-span-2 lg:col-span-1">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Potencial Energético</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Recursos eólicos excepcionales para la producción de hidrógeno verde
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />

        {/* Cookie Banner */}
        <CookieBanner />
      </div>
    </>
  )
}

export default function ExplorePage() {
  return <ExploreContent />
}
