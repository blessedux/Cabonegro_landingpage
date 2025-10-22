import { Anchor, Calendar, Ship, Shield } from 'lucide-react'

export default function MaritimeTerminal() {
  return (
    <section className="py-20 px-6" id="MaritimeTerminal">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Port of the Southern Wind
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto">
            Cabo Negro Terminal: A private port for public use — designed to serve Chile's hydrogen economy. 
            A protected port with minimal impact from tides, waves, or currents.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Development Timeline</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">2021–2025:</span>
                  <span className="text-white font-semibold">Engineering & regulatory stages</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">2026:</span>
                  <span className="text-green-400 font-semibold">Ready-to-build phase</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">2027–2030:</span>
                  <span className="text-blue-400 font-semibold">Construction & operational launch</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">Strategic Advantages</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Independent environmental impact vs. full hydrogen plants</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Reduces CAPEX for H₂V companies</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Enables faster project deployment</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Reduced environmental footprint</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Ship className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Port Specifications</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-blue-400">Phase 1</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-white font-semibold">350m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ramp for vessels:</span>
                      <span className="text-white font-semibold">Calado 4.5m</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-green-400">Phase 2</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bridge:</span>
                      <span className="text-white font-semibold">350m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pier:</span>
                      <span className="text-white font-semibold">300m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Depth:</span>
                      <span className="text-white font-semibold">Up to 16m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold">Key Features</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Protected port — minimal impact from tides, waves, or currents</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Ideal proximity to city but no residential interference</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">Interoperable with barge/ferry logistics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}