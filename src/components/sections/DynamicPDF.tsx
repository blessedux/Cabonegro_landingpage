import { Check } from 'lucide-react'

export default function DynamicPDF() {
  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold mb-6">Dynamic PDF</h2>
          <p className="text-gray-400 mb-6">
            Instantly create a personalized brochure with the client's chosen unit, showing the floorplan, current pricing, saved preferences, and full apartment details.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-1 flex-shrink-0" />
              <span>Unit-specific visualization</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-1 flex-shrink-0" />
              <span>Real-time pricing & data</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-1 flex-shrink-0" />
              <span>Downloadable client summary</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}