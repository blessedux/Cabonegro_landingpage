import { Button } from '@/components/ui/button'
import Typewriter from '@/components/ui/Typewriter'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-0" />
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <Typewriter 
              text="Gateway to the South of the World"
              speed={80}
              delay={500}
              className="text-white"
            />
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Cabo Negro is a Strategic Industrial & Maritime Hub of the Southern Hemisphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
              Explore Terrain
            </Button>
            <Button size="lg" variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
              View Deck
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}