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

const faqsEs = [
  {
    question: '¿Cuál es la estructura de inversión para el Terminal Cabo Negro?',
    answer: 'El proyecto sigue una línea de tiempo estructurada de desarrollo en 3 fases diseñada para minimizar riesgos mientras maximiza retornos. La Fase 1 se enfoca en recaudación de capital y estudios iniciales (6 meses), la Fase 2 involucra ingeniería integral y aprobaciones regulatorias (24 meses), y la Fase 3 cubre venta del proyecto o asociaciones de construcción (12 meses). Este enfoque por etapas permite a los inversionistas participar en la transformación industrial de Chile con hitos claros y oportunidades de salida.'
  },
  {
    question: '¿Quiénes son los socios clave en este proyecto?',
    answer: 'El proyecto es desarrollado por J&P S.A. (propietarios de tierras), PPG S.A. (titulares de concesión marítima), y Compas Marine (JV y experiencia en terminales). Estas asociaciones proporcionan la tierra necesaria, aprobaciones regulatorias y experiencia marítima.'
  },
  {
    question: '¿Qué hace estratégicamente importante a Cabo Negro?',
    answer: 'Cabo Negro está posicionado como la puerta de entrada principal a la Antártida y sirve como ruta alternativa al Canal de Panamá, libre de peajes y riesgos geopolíticos. Está ubicado en el corazón de la Región de Magallanes, conectando los Océanos Atlántico y Pacífico.'
  },
  {
    question: '¿Cuál es el estado regulatorio del proyecto?',
    answer: 'El nuevo Plan Regulador 2024-2026 extiende los límites urbanos para incluir Cabo Negro (3,258 hectáreas) y declara el área como el futuro núcleo industrial. Esto permite crecimiento ordenado y zonificación para proyectos industriales a gran escala.'
  },
  {
    question: '¿Cómo apoya este proyecto la economía del hidrógeno de Chile?',
    answer: 'El terminal reduce CAPEX para empresas H₂V al proporcionar infraestructura portuaria compartida, permite despliegue más rápido de proyectos y reduce la huella ambiental. Está diseñado específicamente para servir la creciente industria de exportación de hidrógeno de Chile.'
  },
  {
    question: '¿Cuáles son las consideraciones ambientales?',
    answer: 'El puerto tiene impacto ambiental independiente vs. plantas completas de hidrógeno, está protegido de mareas/olas/corrientes, y permite huella ambiental reducida a través de infraestructura compartida. Todo el desarrollo sigue las regulaciones ambientales de Chile.'
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

export default function FAQEs() {
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
          Estrategia de Inversión y Joint Venture
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text="De la Visión a Listo para Construir: Buscando capital para llevar el Terminal Cabo Negro a la etapa Listo para Construir"
            className="text-gray-400 text-lg"
          />
        </div>

        <div className="space-y-4">
          {faqsEs.map((faq, index) => (
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
            title="Asegura Tu Posición en el Futuro Industrial de Chile"
            subtitle="Oportunidad exclusiva para inversionistas tempranos: Asóciate con líderes establecidos en bienes raíces chilenos en el mercado emergente más estable del mundo.\nRetornos rentables a través del desarrollo estratégico de infraestructura industrial."
            actions={[
              {
                label: "Descargar Propuesta de Inversión",
                href: "/es/deck",
                variant: "default"
              },
              {
                label: "Programar Reunión de Inversionistas",
                href: "https://calendly.com/",
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
