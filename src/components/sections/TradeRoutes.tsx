'use client'

import { WorldMap } from '@/components/ui/world-map'

type RoutePoint = { lat: number; lng: number; label?: string }

const CABO_NEGRO: RoutePoint = { lat: -52.918418, lng: -70.829354, label: 'Cabo Negro' }

// Curated trade routes: Antarctica, Atlantic-Pacific gateway, H2V export routes
const TRADE_ROUTES: Array<{ start: RoutePoint; end: RoutePoint }> = [
  // Antarctica scientific/logistics corridor
  { start: CABO_NEGRO, end: { lat: -64.2000, lng: -56.6500, label: 'South Shetland Is.' } },
  { start: CABO_NEGRO, end: { lat: -75.0000, lng: -45.0000, label: 'Antarctic Peninsula' } },

  // Atlantic-Pacific via Strait of Magellan (symbolic arcs)
  { start: CABO_NEGRO, end: { lat: -33.4489, lng: -70.6693, label: 'Santiago/Valparaíso' } },
  { start: CABO_NEGRO, end: { lat: -34.6037, lng: -58.3816, label: 'Buenos Aires' } },

  // H2V export corridors (EU/Asia)
  { start: CABO_NEGRO, end: { lat: 51.9244, lng: 4.4777, label: 'Rotterdam' } },
  { start: CABO_NEGRO, end: { lat: 35.6762, lng: 139.6503, label: 'Tokyo' } },
  { start: CABO_NEGRO, end: { lat: 31.2304, lng: 121.4737, label: 'Shanghai' } },
]

export default function TradeRoutesSection() {
  return (
    <section className="w-full bg-black text-white py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Global Trade & H₂V Corridors</h2>
          <p className="mt-3 text-white/70">
            Animated arcs illustrate Cabo Negro's strategic connections: Antarctic logistics, the
            Atlantic–Pacific gateway, and hydrogen export routes to Europe and Asia.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <WorldMap dots={TRADE_ROUTES} lineColor="#22d3ee" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-semibold text-white">Antarctica</p>
            <p>South Shetlands and Peninsula logistics arcs.</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-semibold text-white">Atlantic–Pacific Gateway</p>
            <p>Symbolic arcs representing Magellan maritime axis.</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="font-semibold text-white">H₂V Exports</p>
            <p>Connections toward Rotterdam, Tokyo, and Shanghai.</p>
          </div>
        </div>
      </div>
    </section>
  )
}


