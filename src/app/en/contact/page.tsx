'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
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
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-snug">
              The Lyra <span className="text-primary">ecosystem</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">
                brings together our models, products, and platforms.
              </span>
            </h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Interested in leasing or acquiring land at Cabo Negro? Our real estate team can
                guide you on available lots, industrial parcels, utilities, and development timing.
                Reach out and we’ll get back to you shortly.
              </p>
              <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                <Link href="mailto:realestate@cabonegro.com">
                  <span>Contact Real Estate</span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
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
      <main className="pt-20 md:pt-24 pb-16 px-6">
        <AboutPage />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}