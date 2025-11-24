'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

interface AboutPageProps {
  achievements?: Array<{ label: string; value: string }>
}

const defaultAchievements = [
  { label: 'Companies Supported', value: '300+' },
  { label: 'Projects Finalized', value: '800+' },
  { label: 'Happy Customers', value: '99%' },
  { label: 'Recognized Awards', value: '10+' },
]

function AboutPage({ achievements = defaultAchievements }: AboutPageProps) {
  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl space-y-2 px-6">
          <Image
            className="rounded-xl object-cover w-full h-[240px] md:h-[460px]"
            src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_hero_gradient.jpg"
            alt="Hero section image"
            width={1200}
            height={600}
            priority
          />
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <div className="relative w-fit">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-snug mb-4 w-fit">
                Cabo Negro: <span className="text-primary">the future energy hub</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">of the Global South.</span>
              </h1>
              <div className="mt-4 w-full" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', marginRight: '60px' }}>
                <Button asChild className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4">
                  <a href="mailto:pyaconi@ylmv.cl" className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Contact
                  </a>
                </Button>
              </div>
            </div>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Interested in leasing or acquiring land at Cabo Negro? Our real estate team can
                guide you on available lots, industrial parcels, utilities, and development timing.
                Reach out and we'll get back to you shortly.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Prewritten Message:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                    "Hello, I'm interested in acquiring land or scheduling a meeting with the Cabo Negro real estate team. Could you please provide me with information about available lots, industrial parcels, and development opportunities? Thank you."
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                  <Link 
                    href="https://wa.me/56993091951?text=Hello%2C%20I%27m%20interested%20in%20acquiring%20land%20or%20scheduling%20a%20meeting%20with%20the%20Cabo%20Negro%20real%20estate%20team.%20Could%20you%20please%20provide%20me%20with%20information%20about%20available%20lots%2C%20industrial%20parcels%2C%20and%20development%20opportunities%3F%20Thank%20you." 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>Chat on WhatsApp</span>
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom cards removed for minimal contact page */}
    </div>
  )
}

export default function EnglishContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-12 pb-16 px-6">
        <AboutPage />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
