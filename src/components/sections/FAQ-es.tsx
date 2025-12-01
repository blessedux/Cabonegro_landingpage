'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { MagicText } from "@/components/ui/magic-text"

const faqsEs = [
  {
    question: '¿Qué es Cabo Negro y cómo se estructura el proyecto?',
    answer: 'Cabo Negro es una plataforma territorial compuesta por tres proyectos independientes, cada uno con propósitos, escalas y oportunidades distintas:\n\n1. Terminal Marítimo Cabo Negro,\n2. Parque Tecnológico & Logístico – Patagon Valley,\n3. Macro Lote Cabo Negro II.\n\nLas empresas pueden interesarse en uno, dos o los tres proyectos, según sus necesidades. No existe dependencia entre ellos, aunque su cercanía genera sinergias logísticas, tecnológicas y operativas de alto valor.'
  },
  {
    question: '¿Dónde está ubicado Cabo Negro?',
    answer: 'El proyecto se encuentra al norte de Punta Arenas, sobre el Estrecho de Magallanes, en un punto estratégico para logística, energía y tecnología.\n\nDistancias clave:\n\n· 5 km del Aeropuerto Internacional de Punta Arenas (SCCI)\n· 28,5 km del centro de Punta Arenas\n· Conexión directa a Ruta 9, carretera internacional hacia Argentina.\n· Conexión a Estrecho de Magallanes'
  },
  {
    question: '¿Cuál es el objetivo principal del proyecto Cabo Negro?',
    answer: 'Crear un polo integrado en Magallanes que combine infraestructura portuaria, tecnológica y logística, ofreciendo un entorno único para empresas que buscan conectividad, acceso al Estrecho de Magallanes y la Antártica Chilena y disponibilidad de terrenos industriales y tecnológicos.'
  },
  {
    question: '¿Por qué esta ubicación es considerada estratégica a nivel internacional?',
    answer: 'Porque combina ventajas que rara vez existen en un mismo territorio:\n\n· Ruta estratégica hacia la Antártica y base natural para operaciones antárticas.\n· Ubicación en el Estrecho de Magallanes, corredor marítimo clave del hemisferio sur.\n· Conectividad de alta calidad: Fibra Óptica Austral + señal LEO satelital.\n· Proximidad a zonas de hidrógeno verde e industria energética de clase mundial.\n· Entorno apto para desarrollos logísticos, industriales y tecnológicos de gran escala.'
  },
  {
    question: '¿Qué tipo de empresas pueden instalarse en Cabo Negro?',
    answer: 'El territorio está preparado para recibir proyectos de:\n\n· logística y transporte,\n· energía e hidrógeno verde,\n· industria satelital y telecomunicaciones,\n· tecnología, IA, robótica, data centers,\n· proveedores industriales,\n· operaciones y soporte antártico,\n· bases científicas,\n· grandes industrias y macro desarrollos.'
  },
  {
    question: '¿Qué beneficios ofrece el Terminal Marítimo Cabo Negro?',
    answer: 'El Terminal Marítimo Cabo Negro nace para convertirse en el nuevo punto de entrada al extremo sur del continente. Un puerto multipropósito protegido, pensado para recibir los proyectos que están transformando Magallanes: energía, industria, tecnología, exploración y abastecimiento antártico.\n\nSu ubicación estratégica, sus áreas de respaldo y su accesibilidad directa desde Ruta 9 lo convierten en un centro logístico de nueva generación.\n\nDesarrollado junto a Compas Marine, expertos reconocidos en la gestión de terminales marítimos en Chile, el proyecto incorpora estándares de eficiencia, seguridad y continuidad operativa que responden a las necesidades actuales de la industria.\n\nEs un puerto diseñado para el presente, pero preparado para el crecimiento futuro de la región.'
  },
  {
    question: '¿Qué ventajas ofrece Patagon Valley (parque tecnológico y logístico)?',
    answer: 'Patagon Valley está diseñado para empresas que requieren:\n\n· disponibilidad de energía,\n· baja latencia y conectividad de fibra óptica,\n· comunicaciones satelitales LEO,\n· proximidad operativa a un puerto,\n· terrenos escalables para instalaciones tecnológicas o logísticas.\n\nEs ideal para tecnología, data centers, telecomunicaciones, satelital, IA, robótica marina y empresas asociadas al hidrógeno verde.'
  },
  {
    question: '¿Qué características tiene el Macro Lote Cabo Negro II?',
    answer: 'El Macro Lote Cabo Negro II es un terreno de 173 hectáreas listo para configurarse según las necesidades específicas de cada proyecto, ofreciendo máxima flexibilidad para desarrollos industriales, logísticos, tecnológicos o energéticos.\n\nSe trata de un terreno sin intervenciones previas, lo que permite a las empresas diseñar su infraestructura completamente a medida: trazados internos, subdivisiones, accesos, instalaciones, sistemas y planes de expansión.\n\nGracias a su escala y libertad de diseño, es ideal para proyectos que requieren grandes superficies o infraestructura especializada.\n\nAdemás, su conexión directa a Ruta 9 y su proximidad al puerto y a Patagon Valley permiten integrar operaciones logísticas o tecnológicas si una empresa lo requiere, sin que ello sea obligatorio.'
  },
  {
    question: '¿Cómo puedo obtener más información, coordinar una reunión o visitar el proyecto?',
    answer: 'A través del formulario de contacto del sitio web o utilizando la opción "Agendar reunión".\n\nEl equipo comercial puede entregar:\n\n· Presentación general,\n· Información específica de cada pilar,\n· Recorridos virtuales,\n· Visitas presenciales a terreno.'
  }
]


export default function FAQEs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Show first 6 questions initially, all when expanded
  const visibleFAQs = isExpanded ? faqsEs : faqsEs.slice(0, 6)
  const hasMoreQuestions = faqsEs.length > 6

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
          Preguntas Frecuentes
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text="Conoce más sobre Cabo Negro y sus tres proyectos integrados"
            className="text-gray-600 text-lg"
          />
        </div>

        <div className="relative">
          <div className="space-y-4">
            {visibleFAQs.map((faq, index) => (
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
                    <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fade out gradient and expand chevron */}
          {!isExpanded && hasMoreQuestions && (
            <>
              {/* Fade out gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              
              {/* Expand chevron button */}
              <div className="flex justify-center mt-6 relative z-10">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span className="text-sm font-medium">Ver más preguntas</span>
                  <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
