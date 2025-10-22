import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Hero() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [foregroundLoaded, setForegroundLoaded] = useState(false)
  const [startTime] = useState(Date.now())
  const [hoverState, setHoverState] = useState({
    background: false,
    foreground: false
  })

  const handleExploreTerrain = () => {
    startFadeOut()
    
    // Navigate to explore route after animations
    setTimeout(() => {
      router.push('/explore')
    }, 1000)
  }

  // Performance monitoring
  useEffect(() => {
    if (backgroundLoaded && foregroundLoaded) {
      const loadTime = Date.now() - startTime
      console.log(`🎯 PERFORMANCE TEST RESULTS:`)
      console.log(`⏱️  Total load time: ${loadTime}ms`)
      console.log(`📊 Background scene loaded: ${backgroundLoaded}`)
      console.log(`📊 Foreground scene loaded: ${foregroundLoaded}`)
      console.log(`💾 Memory usage: ${(performance as any).memory?.usedJSHeapSize ? ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A'}MB`)
      console.log(`🌐 Network timing:`, performance.getEntriesByType('navigation')[0])
    }
  }, [backgroundLoaded, foregroundLoaded, startTime])

  // Monitor individual scene load times
  useEffect(() => {
    if (backgroundLoaded) {
      console.log(`✅ Background particles scene loaded`)
    }
  }, [backgroundLoaded])

  useEffect(() => {
    if (foregroundLoaded) {
      console.log(`✅ Foreground globe scene loaded`)
    }
  }, [foregroundLoaded])

  // Hover event handlers with console logging
  const handleBackgroundHover = (isHovering: boolean) => {
    setHoverState(prev => ({ ...prev, background: isHovering }))
    console.log(`🖱️ Background scene hover: ${isHovering ? 'ENTER' : 'LEAVE'}`)
  }

  const handleForegroundHover = (isHovering: boolean) => {
    setHoverState(prev => ({ ...prev, foreground: isHovering }))
    console.log(`🌍 Foreground scene hover: ${isHovering ? 'ENTER' : 'LEAVE'}`)
  }

  const handleMouseMove = (scene: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(1)
    console.log(`📍 ${scene} mouse position: x:${x}%, y:${y}%`)
  }

  const handleClick = (scene: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(1)
    console.log(`🖱️ ${scene} clicked at: x:${x}%, y:${y}%`)
  }

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Spline Scene - Glowing Planet Particles */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden"
        onMouseEnter={() => handleBackgroundHover(true)}
        onMouseLeave={() => handleBackgroundHover(false)}
        onMouseMove={(e) => handleMouseMove('Background', e)}
        onClick={(e) => handleClick('Background', e)}
      >
        <iframe 
          src='https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          onLoad={() => {
            setBackgroundLoaded(true)
            console.log('Background Spline scene loaded')
          }}
          style={{ 
            border: 'none',
            background: 'transparent',
            transform: 'scale(1.3)',
            transformOrigin: 'center center',
            pointerEvents: 'auto' // Enable pointer events for interaction
          }}
        />
      </div>

      {/* Foreground Spline Scene - 3D Globe (semi-transparent overlay) */}
      <div 
        className="absolute inset-0 z-1 overflow-hidden"
        onMouseEnter={() => handleForegroundHover(true)}
        onMouseLeave={() => handleForegroundHover(false)}
        onMouseMove={(e) => handleMouseMove('Foreground', e)}
        onClick={(e) => handleClick('Foreground', e)}
      >
        <iframe 
          src='https://my.spline.design/3dglobebgimage-HtjS9D4xpwdUCk4G2517Hrpk/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          onLoad={() => {
            setForegroundLoaded(true)
            console.log('Foreground Spline scene loaded')
          }}
          style={{ 
            border: 'none',
            background: 'transparent',
            opacity: 0.6, // Make foreground semi-transparent so background shows through
            mixBlendMode: 'screen', // Blend mode to make it look more integrated
            transform: 'scale(1.3)',
            transformOrigin: 'center center',
            pointerEvents: 'auto' // Enable pointer events for interaction
          }}
        />
      </div>

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-2" />
      
      {/* Loading indicator with performance metrics */}
      {(!backgroundLoaded || !foregroundLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-center bg-black/50 backdrop-blur-sm rounded-lg p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg mb-2">
              Loading 3D scenes... 
              {backgroundLoaded && foregroundLoaded ? ' Complete!' : 
               backgroundLoaded ? ' (Background loaded)' : 
               ' (Loading background...)'}
            </p>
            <div className="text-sm text-gray-300">
              <div>Background: {backgroundLoaded ? '✅' : '⏳'}</div>
              <div>Foreground: {foregroundLoaded ? '✅' : '⏳'}</div>
              <div>Load time: {Date.now() - startTime}ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance indicator (always visible in dev) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
          <div>Background: {backgroundLoaded ? '✅' : '⏳'}</div>
          <div>Foreground: {foregroundLoaded ? '✅' : '⏳'}</div>
          <div>Load time: {Date.now() - startTime}ms</div>
          <div>Memory: {(performance as any).memory ? `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
          <div className="mt-2 pt-2 border-t border-white/20">
            <div>Hover States:</div>
            <div>Background: {hoverState.background ? '🖱️' : '⭕'}</div>
            <div>Foreground: {hoverState.foreground ? '🌍' : '⭕'}</div>
          </div>
        </div>
      )}

      <div className="container mx-auto relative z-10 flex justify-center">
        <div className="max-w-4xl text-center w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <BlurTextAnimation 
              text="Gateway to the South of the World"
              fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              textColor="text-white"
              animationDelay={6000}
            />
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed text-center">
            Cabo Negro is a Strategic Industrial & Maritime Hub <br></br>of the Southern Hemisphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-white text-white hover:bg-white hover:text-black"
              onClick={handleExploreTerrain}
            >
              Explore Terrain
            </Button>
            <Link href="/deck">
              <Button size="lg" variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
                View Deck
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}