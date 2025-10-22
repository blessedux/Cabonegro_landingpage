import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()

  const handleExploreTerrain = () => {
    startFadeOut()
    
    // Navigate to explore route after animations
    setTimeout(() => {
      router.push('/explore')
    }, 1000)
  }

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-0" />
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