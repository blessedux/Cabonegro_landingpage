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
    question: '什么使卡波内格罗具有战略重要性？',
    answer: '卡波内格罗被定位为通往南极洲的主要门户，并作为巴拿马运河的替代路线，无通行费和地缘政治风险。它位于麦哲伦地区的中心，连接大西洋和太平洋。'
  },
  {
    question: '这个项目如何支持智利的氢经济？',
    answer: '该终端通过提供共享港口基础设施减少H₂V公司的资本支出，实现更快的项目部署，并减少环境足迹。它专门设计用于服务智利不断增长的氢出口行业。'
  },
  {
    question: '环境考虑因素有哪些？',
    answer: '港口具有独立的环境影响，与完整的氢工厂相比，受到潮汐/波浪/洋流的保护，并通过共享基础设施实现减少的环境足迹。所有开发都遵循智利的环境法规。'
  }
]

export default function FAQZh() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="pt-8 md:pt-20 pb-20 px-6 bg-white relative z-20" id="FAQ" data-white-background="true">
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
        >
          投资与合资战略
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text="从愿景到准备建设：寻求资金将卡波内格罗终端带到准备建设阶段"
            className="text-gray-600 text-lg"
          />
        </div>

        {/* FAQ Items */}
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
            <Link href="/zh/deck">下载投资提案</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:bg-white hover:text-black transition-colors"
          >
            <Link href="https://calendly.com/" target="_blank" rel="noopener noreferrer">安排投资者会议</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
