'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is the investment structure for Cabo Negro Terminal?',
    answer: 'We are seeking USD 2-5 million in initial capital ("Fondo Inicial") to fund engineering and studies. The project follows a 3-phase approach: Capital Raising (6 months), Engineering & Studies (24 months), and Project Sale/Construction (12 months).'
  },
  {
    question: 'Who are the key partners in this project?',
    answer: 'The project is developed by J&P S.A. (landowners), PPG S.A. (maritime concession holders), and Compas Marine (JV and terminal expertise). These partnerships provide the necessary land, regulatory approvals, and maritime expertise.'
  },
  {
    question: 'What makes Cabo Negro strategically important?',
    answer: 'Cabo Negro is positioned as the primary gateway to Antarctica and serves as an alternative route to the Panama Canal, free of tolls and geopolitical risks. It\'s located at the heart of the Magallanes Region, connecting Atlantic and Pacific Oceans.'
  },
  {
    question: 'What is the regulatory status of the project?',
    answer: 'The new Plan Regulador 2024-2026 extends urban limits to include Cabo Negro (3,258 hectares) and declares the area as the future industrial nucleus. This allows orderly growth and zoning for large-scale industrial projects.'
  },
  {
    question: 'How does this project support Chile\'s hydrogen economy?',
    answer: 'The terminal reduces CAPEX for H₂V companies by providing shared port infrastructure, enables faster project deployment, and reduces environmental footprint. It\'s designed specifically to serve Chile\'s growing hydrogen export industry.'
  },
  {
    question: 'What are the environmental considerations?',
    answer: 'The port has independent environmental impact vs. full hydrogen plants, is protected from tides/waves/currents, and enables reduced environmental footprint through shared infrastructure. All development follows Chile\'s environmental regulations.'
  }
]

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-20 px-6" id="FAQ">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Investment & Joint Venture Strategy</h2>
        <p className="text-gray-400 text-lg mb-12 max-w-3xl mx-auto text-center">
          From Vision to Ready-to-Build: Seeking capital to bring Cabo Negro Terminal to Ready-to-Build stage
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-white/5 border-white/10 cursor-pointer"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === index && (
                  <p className="text-gray-400 mt-4 leading-relaxed">{faq.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl p-8 border border-white/10">
            <h3 className="text-3xl font-bold mb-4">Join the Future of Southern Chile</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Invest in the future of the Southern Corridor. Join us in building Chile's southern hydrogen and logistics hub. 
              Cabo Negro — where the world meets the wind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Request Investment Deck
              </button>
              <button className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors">
                Join the Joint Venture
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}