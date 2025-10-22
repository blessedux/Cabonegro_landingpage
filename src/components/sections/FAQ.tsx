'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What type of 3D files do you support?',
    answer: 'The application can support various types of 3D files: Conventional Models from 3DS Max, SketchUp, Blender and more. Conventional Materials from AutoCAD, Vray/Corona, Revit/Octane, Blender, ArchiCAD. Scenes from Unreal Engine and Twinmotion 2023.'
  },
  {
    question: 'What if I have my own 3D models?',
    answer: 'For those with existing 3D models, our Real Estate 3D solution seamlessly incorporates them. Supported formats include 3DS Max, SketchUp, and Blender. We handle model and material conversions as part of the process.'
  },
  {
    question: "What if I don't have 3D models created?",
    answer: 'If you don\'t have 3D models, our Real Estate 3D solution offers full-service 3D modeling from scratch. Our team can create models to match your vision with high-quality 3D web apps, path-traced renders, HQ animations, and 360-degree tours.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We support and improve your product after release. We will solve any technical problem on the spot, and by hosting with us, your application is adequately taken care of and secured.'
  },
  {
    question: 'How long does it take to create?',
    answer: 'The estimated production time is around 2-3 months. We discuss in detail all the stages of the work and their exact timeframes with each client so that everything is clear at the start.'
  },
  {
    question: 'Can I customize website interface to match my brand?',
    answer: 'We are happy to respond to usability expectations. We tailor user interface to your brand style because we know the value of individual style. Our designers analyze your branding guidelines and prepare design accordingly.'
  }
]

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-20 px-6" id="FAQ">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-5xl font-bold mb-12">Frequently asked questions</h2>

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

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Can't find the answer you are looking for? Please chat our friendly team
          </p>
        </div>
      </div>
    </section>
  )
}