'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MagicText } from "@/components/ui/magic-text"

const faqsEs = [
  {
    question: '¿Qué hace estratégicamente importante a Cabo Negro?',
    answer: 'Cabo Negro está posicionado como la puerta de entrada principal a la Antártida y sirve como ruta alternativa al Canal de Panamá, libre de peajes y riesgos geopolíticos. Está ubicado en el corazón de la Región de Magallanes, conectando los Océanos Atlántico y Pacífico.'
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


export default function FAQEs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="pt-8 md:pt-20 pb-20 px-6 bg-white relative z-20" id="FAQ" data-white-background="true">
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
            className="text-gray-600 text-lg"
          />
        </div>

        <div className="space-y-4">
          {faqsEs.map((faq, index) => (
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
            <Link href="/es/deck">Descargar Propuesta de Inversión</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:bg-white hover:text-black transition-colors"
          >
            <Link href="https://calendly.com/" target="_blank" rel="noopener noreferrer">Programar Reunión de Inversionistas</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
