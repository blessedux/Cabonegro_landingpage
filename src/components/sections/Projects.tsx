import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Route, Zap, Droplets, Building2 } from 'lucide-react'

export default function IndustrialPark() {
  return (
    <section className="py-20 px-6 bg-white/5" id="IndustrialPark">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Cabo Negro Industrial Park
          </h2>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto">
            A ready-to-build industrial ecosystem designed for the hydrogen era. 
            Over <span className="text-white font-bold">300 hectares</span> of strategically located land 
            with world-class infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-green-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Strategic Location</h3>
                <p className="text-gray-300">
                  Located in Punta Arenas, at the heart of the Magallanes Region
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Land & Ownership</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Area:</span>
                  <span className="text-white font-semibold">300+ hectares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Owners:</span>
                  <span className="text-white font-semibold">J&P, Patagon Valley, A&J, PPG S.A.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">Ready-to-build</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-orange-900/20 flex items-center justify-center">
              <div className="text-center p-8">
                <Route className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Infrastructure</h3>
                <p className="text-gray-300">
                  Connected to Route 9N - Magallanes' main logistics corridor
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Road Network</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Internal Roads:</span>
                  <span className="text-white font-semibold">6 roads (33% built)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Road Width:</span>
                  <span className="text-white font-semibold">40m with turning radius</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connection:</span>
                  <span className="text-white font-semibold">Route 9N access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Electrical Capacity</h3>
            <p className="text-3xl font-bold text-white mb-2">13 MW</p>
            <p className="text-gray-400 text-sm">Current infrastructure capacity</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Water System</h3>
            <p className="text-3xl font-bold text-white mb-2">3 Wells</p>
            <p className="text-gray-400 text-sm">Deep water wells + 20m elevated tank</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Water Matrix</h3>
            <p className="text-3xl font-bold text-white mb-2">HDPE 110</p>
            <p className="text-gray-400 text-sm">With domestic connections</p>
          </div>
        </div>
      </div>
    </section>
  )
}