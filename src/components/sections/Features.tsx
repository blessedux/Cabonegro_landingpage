'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'

const features = [
  {
    id: 'web-configurator',
    title: 'Web Configurator',
    description: 'Customize and purchase your dream bike with ease, with options to personalize and make it one-of-a-kind, supported by our knowledgeable salesman assistants who are ready to assist you every step of the way.'
  },
  {
    id: 'virtual-tours',
    title: 'Virtual tours',
    description: 'Conventional web approaches usually are either fast and simple or slow and unsupported on mobile devices. Vinode is the first web application to deliver photorealistic 3D with the scalability of a simple website. It works on every device and browser with low hosting and maintenance costs.'
  },
  {
    id: 'management-panel',
    title: 'Management panel',
    description: 'Vinode, as a next-gen eCommerce experience, includes a CMS and CRM system. CMS Features: Edit investment data, unit data, localization info, features info. Add and update images. CRM Features: Customers list, Customer page with names, emails, number, unit, time spent.'
  },
  {
    id: 'marketing-content',
    title: 'Marketing content',
    description: 'Our offer includes videos and renders to use on social media & other channels of distribution. In the real estate sector, where visuals matter, a study by the National Association of Realtors found that 90% of real estate agents use social media to some extent.'
  },
  {
    id: 'interactive-kiosk',
    title: 'Interactive office kiosk',
    description: 'Sales office app is dedicated to presenting the investments. You have 2 options available: Presentation mode - show the investment like on the web but with complete freedom of movement. Autoplay mode - shows the investment videos when no one is using the screen.'
  }
]

const platformFeatures = [
  {
    title: 'Interactive 3D models',
    features: ['Easy to embed on any website', 'Works on any device', 'Online and offline', '3D model', 'Easy-to-use advanced search']
  },
  {
    title: 'Virtual tours',
    features: ['3D plans', 'Virtual walk', '360 views']
  },
  {
    title: 'Back panel',
    features: ['CRM', 'CMS']
  },
  {
    title: 'Dynamic PDF',
    features: ['Unit-specific visualization', 'Real-time pricing & data', 'Downloadable client summary']
  },
  {
    title: 'Kiosk app',
    features: ['Standalone app', 'Pixel streaming ready', 'Works offline']
  },
  {
    title: 'Smart filters',
    features: ['Building selection', 'Size & price range', 'Rooms, floors, orientation', 'Additional features']
  }
]

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  return (
    <>
      {/* Features Overview */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Complete sales process</h3>
              <p className="text-gray-400">Vinode supports at every stage of the sales process</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">No loading time</h3>
              <p className="text-gray-400">Under 1s loading leads to improving website conversion rate by 2x</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">All devices</h3>
              <p className="text-gray-400">Deploy your page on all devices. Works offline as a stand-alone app</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features with Modals */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => setActiveFeature(feature.id)}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Modal */}
        {activeFeature && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
            <Card className="bg-black border-white/20 max-w-2xl w-full relative">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setActiveFeature(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {features.find(f => f.id === activeFeature)?.title}
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {features.find(f => f.id === activeFeature)?.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Vinode Platform Features */}
      <section className="py-20 px-6 bg-white/5" id="About">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-4">Vinode platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}