import { Wind, Zap, TrendingUp, Globe } from 'lucide-react'

export default function H2VOpportunity() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Chile's Green Hydrogen Frontier
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto">
            Magallanes could produce <span className="text-white font-bold">13% of the world's green hydrogen</span>, 
            positioning Chile as a global leader in the clean energy revolution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wind className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Massive Wind Potential</h3>
            <p className="text-gray-400 text-sm">
              Up to 7× Chile's current power generation capacity
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">GDP Growth</h3>
            <p className="text-gray-400 text-sm">
              H₂V projects expected to double regional GDP
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">200+ Projects</h3>
            <p className="text-gray-400 text-sm">
              Already filed or under review at SEA
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Impact</h3>
            <p className="text-gray-400 text-sm">
              EDF expected to enter by end of 2025
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">The Opportunity is Now</h3>
            <p className="text-gray-300 text-lg mb-6">
              Demand projections surpass current port capacity by several magnitudes. 
              The region is ready for massive industrial development, and Cabo Negro 
              is positioned to be the strategic hub that enables this transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">13%</div>
                <p className="text-sm text-gray-400">of global H₂V production</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">2×</div>
                <p className="text-sm text-gray-400">regional GDP growth</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">200+</div>
                <p className="text-sm text-gray-400">projects in pipeline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}