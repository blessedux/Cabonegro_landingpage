'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MagicText } from "@/components/ui/magic-text"


const faqs = [
  {
    question: 'What is the investment structure for Cabo Negro Terminal?',
    answer: 'The project follows a structured 3-phase development timeline designed to minimize risk while maximizing returns. Phase 1 focuses on capital raising and initial studies (6 months), Phase 2 involves comprehensive engineering and regulatory approvals (24 months), and Phase 3 covers project sale or construction partnerships (12 months). This staged approach allows investors to participate in Chile\'s industrial transformation with clear milestones and exit opportunities.'
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
    <section className="pt-20 pb-20 px-6 bg-white relative z-20" id="FAQ" data-white-background="true">
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Investment & Joint Venture Strategy
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text="From Vision to Ready-to-Build: Seeking capital to bring Cabo Negro Terminal to Ready-to-Build stage"
            className="text-gray-600 text-lg"
          />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-white border-gray-200 cursor-pointer hover:border-accent transition-colors shadow-sm"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold pr-4 text-foreground">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform text-gray-600 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === index && (
                  <p className="text-gray-700 mt-4 leading-relaxed">{faq.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center group">
          <Button
            asChild
            variant="default"
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
          >
            <Link href="/deck">Download Investment Proposal</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:bg-white hover:text-black transition-colors"
          >
            <Link href="https://calendly.com/" target="_blank" rel="noopener noreferrer">Schedule Investor Meeting</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}