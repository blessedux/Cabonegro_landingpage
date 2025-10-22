import { Check, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IndustrialSpecs() {
  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">Industrial Complex Specifications</h2>
          <p className="text-gray-400 mb-8 text-lg max-w-3xl mx-auto">
            Access comprehensive technical and regulatory documentation for the Cabo Negro Industrial Complex. 
            View detailed specifications, compliance certifications, and operational guidelines that define our 
            world-class industrial infrastructure.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
              <Check className="w-5 h-5 mt-1 flex-shrink-0 text-green-400" />
              <span>Technical specifications & blueprints</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
              <Check className="w-5 h-5 mt-1 flex-shrink-0 text-green-400" />
              <span>Regulatory compliance documentation</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
              <Check className="w-5 h-5 mt-1 flex-shrink-0 text-green-400" />
              <span>Environmental impact assessments</span>
            </div>
          </div>
          <Link href="/deck">
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-white text-white hover:bg-white hover:text-black"
            >
              View Complete Specifications
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}