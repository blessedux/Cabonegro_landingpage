'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { motion } from "framer-motion"
import { MagicText } from "@/components/ui/magic-text"

const faqsZh = [
  {
    question: '什么是卡波内格罗，项目是如何构建的？',
    answer: '卡波内格罗是一个由三个独立项目组成的领土平台，每个项目都有不同的目的、规模和机会：\n\n1. 卡波内格罗海运码头\n2. 科技与物流园 – 巴塔哥尼亚谷\n3. 卡波内格罗二号大区\n\n公司可以根据其需求对一个、两个或所有三个项目感兴趣。它们之间没有依赖关系，尽管它们的邻近性产生了高价值的物流、技术和运营协同效应。'
  },
  {
    question: '卡波内格罗位于哪里？',
    answer: '该项目位于蓬塔阿雷纳斯北部，位于麦哲伦海峡上，是物流、能源和技术的战略要地。\n\n关键距离：\n\n· 距离蓬塔阿雷纳斯国际机场（SCCI）5公里\n· 距离蓬塔阿雷纳斯市中心28.5公里\n· 直接连接9号公路，通往阿根廷的国际高速公路。\n· 连接麦哲伦海峡'
  },
  {
    question: '卡波内格罗项目的主要目标是什么？',
    answer: '在麦哲伦创建一个综合中心，结合港口、技术和物流基础设施，为寻求连接性、麦哲伦海峡和智利南极通道以及工业和科技土地可用性的公司提供独特的环境。'
  },
  {
    question: '为什么这个位置在国际层面被认为是战略性的？',
    answer: '因为它结合了在同一领土上很少存在的优势：\n\n· 通往南极的战略路线和南极行动的自然基地。\n· 位于麦哲伦海峡，南半球的关键海上走廊。\n· 高质量连接：南方光纤 + LEO卫星信号。\n· 靠近绿色氢区和世界级能源工业。\n· 适合大规模物流、工业和技术发展的环境。'
  },
  {
    question: '哪些类型的公司可以在卡波内格罗设立？',
    answer: '该领土已准备好接收来自以下领域的项目：\n\n· 物流和运输\n· 能源和绿色氢能\n· 卫星工业和电信\n· 技术、人工智能、机器人、数据中心\n· 工业供应商\n· 南极运营和支持\n· 科学基地\n· 大型工业和宏观发展'
  },
  {
    question: '卡波内格罗海运码头提供哪些好处？',
    answer: '卡波内格罗海运码头旨在成为大陆南端的新入口点。一个受保护的多用途港口，旨在接收正在改变麦哲伦的项目：能源、工业、技术、勘探和南极供应。\n\n其战略位置、备用区域和从9号公路的直接可达性使其成为新一代物流中心。\n\n与智利公认的海运码头管理专家Compas Marine共同开发，该项目整合了效率、安全性和运营连续性标准，满足当前行业需求。\n\n这是一个为现在而设计的港口，但为地区的未来增长做好了准备。'
  },
  {
    question: '巴塔哥尼亚谷（科技与物流园）提供哪些优势？',
    answer: '巴塔哥尼亚谷专为需要以下条件的企业设计：\n\n· 能源可用性\n· 低延迟和光纤连接\n· LEO卫星通信\n· 靠近港口的运营位置\n· 可扩展的科技或物流设施用地\n\n它非常适合技术、数据中心、电信、卫星、人工智能、海洋机器人和与绿色氢相关的公司。'
  },
  {
    question: '卡波内格罗二号大区有哪些特点？',
    answer: '卡波内格罗二号大区是一个173公顷的地块，可根据每个项目的具体需求进行配置，为工业、物流、技术或能源发展提供最大灵活性。\n\n这是一个没有前期干预的地块，允许公司完全定制设计其基础设施：内部布局、细分、通道、设施、系统和扩张计划。\n\n由于其规模和设计自由度，它非常适合需要大面积或专业基础设施的项目。\n\n此外，其与9号公路的直接连接以及靠近港口和巴塔哥尼亚谷的位置，如果公司需要，可以整合物流或技术运营，但这不是强制性的。'
  },
  {
    question: '我如何获得更多信息、协调会议或参观项目？',
    answer: '通过网站联系表或使用"安排会议"选项。\n\n商业团队可以提供：\n\n· 一般介绍\n· 每个支柱的具体信息\n· 虚拟参观\n· 现场访问'
  }
]

export default function FAQZh() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Show first 6 questions initially, all when expanded
  const visibleFAQs = isExpanded ? faqsZh : faqsZh.slice(0, 6)
  const hasMoreQuestions = faqsZh.length > 6

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
          常见问题
        </motion.h2>
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <MagicText 
            text="了解更多关于卡波内格罗及其三个综合项目的信息"
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
                  <span className="text-sm font-medium">查看更多问题</span>
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
