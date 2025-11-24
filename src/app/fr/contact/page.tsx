'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl space-y-2 px-6">
          <Image className="rounded-xl object-cover w-full h-[240px] md:h-[460px]" src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_hero_gradient.jpg" alt="Hero section image" width={1200} height={600} priority />
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <div className="w-fit">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-snug mb-4">
                Cabo Negro : <span className="text-primary">le futur pôle énergétique</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">du Sud Global.</span>
              </h1>
              <div className="mt-4">
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
                Intéressé par la location ou l'acquisition de terrains à Cabo Negro ? Notre équipe
                immobilière peut vous guider sur les lots disponibles, les parcelles industrielles,
                les services et les délais de développement. Contactez-nous et nous vous répondrons rapidement.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Message Pré-rédigé :</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                    "Bonjour, je suis intéressé par l'acquisition de terrains ou la planification d'une réunion avec l'équipe immobilière de Cabo Negro. Pourriez-vous me fournir des informations sur les lots disponibles, les parcelles industrielles et les opportunités de développement ? Merci."
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                  <Link 
                    href="https://wa.me/56993091951?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20l%27acquisition%20de%20terrains%20ou%20la%20planification%20d%27une%20r%C3%A9union%20avec%20l%27%C3%A9quipe%20immobili%C3%A8re%20de%20Cabo%20Negro.%20Pourriez-vous%20me%20fournir%20des%20informations%20sur%20les%20lots%20disponibles%2C%20les%20parcelles%20industrielles%20et%20les%20opportunit%C3%A9s%20de%20d%C3%A9veloppement%20%3F%20Merci." 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>Chatter sur WhatsApp</span>
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section inférieure supprimée pour une page de contact minimale */}
    </div>
  )
}

export default function FrenchContactPage() {
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

