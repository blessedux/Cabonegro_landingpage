'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Globe, Anchor, Wind } from 'lucide-react'

export default function Explore() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fade in animation when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Explore the Terrain
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Discover the strategic location and unique advantages of Cabo Negro 
              in the heart of the Magallanes Region.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Strategic Location */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Strategic Location</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Located in Punta Arenas, at the heart of the Magallanes Region, 
                Cabo Negro serves as the primary gateway to Antarctica and provides 
                an alternative route to the Panama Canal.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Gateway to Antarctica</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Alternative to Panama Canal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Free of tolls and geopolitical risks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maritime Advantages */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">Maritime Advantages</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Strategic maritime corridor linking the Atlantic and Pacific Oceans, 
                with protected port conditions and minimal environmental impact.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Protected port conditions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Minimal tidal impact</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Ideal for large vessels</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wind & Energy Potential */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl p-12 border border-white/10 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-full">
                  <Wind className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Wind & Energy Potential
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
                The Magallanes Region boasts exceptional wind resources, with potential 
                to generate up to 7× Chile's current power generation capacity. This 
                positions the region as a global leader in green hydrogen production.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">7×</div>
                  <p className="text-gray-400">Chile's current power generation</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">13%</div>
                  <p className="text-gray-400">of world's green hydrogen potential</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">200+</div>
                  <p className="text-gray-400">H₂V projects in pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link href="/">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Globe className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
