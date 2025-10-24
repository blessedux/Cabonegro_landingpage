'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MagicText } from "@/components/ui/magic-text"

interface HeroAction {
  label: string
  href: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

interface HeroProps {
  className?: string
  gradient?: boolean
  blur?: boolean
  title?: string
  subtitle?: string
  actions?: HeroAction[]
  titleClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

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

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background",
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow */}
            <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full bg-cyan-400/80 opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              initial={{ width: "8rem" }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "16rem" }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-white/80 blur-2xl"
            />

            {/* Top line */}
            <motion.div
              initial={{ width: "15rem" }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "30rem" }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
              className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-cyan-400/80"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-400/80 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            >
              <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-400/80 [--conic-position:from_290deg_at_center_top]"
            >
              <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          className="relative z-50 w-full flex justify-center flex-1 flex-col px-5 md:px-10 gap-4 -translate-y-20"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <h1
              className={cn(
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <div
                className={cn(
                  "text-xl text-muted-foreground",
                  subtitleClassName,
                )}
              >
                {subtitle.split('\\n').map((line, index) => (
                  <p key={index} className={index > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            )}
            {actions && actions.length > 0 && (
              <div className={cn("flex gap-4", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-20 px-6" id="FAQ">
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
            className="text-gray-400 text-lg"
          />
        </div>

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

        <div className="mt-16 -mx-6 sm:-mx-8 md:-mx-10 lg:-mx-12 xl:-mx-16 overflow-hidden">
          <Hero
            title="Secure Your Position in Chile's Industrial Future"
            subtitle="Exclusive opportunity for early investors: Partner with established Chilean real estate leaders in the world's most stable emerging market.\nProfitable returns through strategic industrial infrastructure development."
            actions={[
              {
                label: "Download Investment Proposal",
                href: "/deck",
                variant: "default"
              },
              {
                label: "Schedule Investor Meeting",
                href: "/contact",
                variant: "outline"
              }
            ]}
            className="min-h-[60vh] w-full"
            titleClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            subtitleClassName="text-lg sm:text-xl max-w-3xl"
            actionsClassName="flex-col sm:flex-row"
          />
        </div>
      </div>
    </section>
  )
}