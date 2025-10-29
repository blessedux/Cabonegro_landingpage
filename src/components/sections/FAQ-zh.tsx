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
    question: '卡波内格罗终端的投资结构是什么？',
    answer: '该项目采用结构化的3阶段开发时间表，旨在最小化风险同时最大化回报。第一阶段专注于资金筹集和初步研究（6个月），第二阶段涉及综合工程和监管批准（24个月），第三阶段涵盖项目销售或建设合作伙伴关系（12个月）。这种分阶段方法允许投资者参与智利的工业转型，具有明确的里程碑和退出机会。'
  },
  {
    question: '这个项目的主要合作伙伴是谁？',
    answer: '该项目由J&P S.A.（土地所有者）、PPG S.A.（海事特许权持有者）和Compas Marine（合资企业和终端专业知识）开发。这些合作伙伴关系提供了必要的土地、监管批准和海事专业知识。'
  },
  {
    question: '什么使卡波内格罗具有战略重要性？',
    answer: '卡波内格罗被定位为通往南极洲的主要门户，并作为巴拿马运河的替代路线，无通行费和地缘政治风险。它位于麦哲伦地区的中心，连接大西洋和太平洋。'
  },
  {
    question: '项目的监管状况如何？',
    answer: '新的2024-2026年规划法规将城市边界扩展到包括卡波内格罗（3,258公顷），并宣布该地区为未来的工业核心。这允许有序增长和大型工业项目的分区。'
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

        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className={cn("text-4xl font-bold tracking-tight sm:text-6xl", titleClassName)}>
              {title || "常见问题"}
            </h1>
            <p className={cn("text-lg text-muted-foreground sm:text-xl", subtitleClassName)}>
              {subtitle || "解答您的疑问"}
            </p>
            {actions && (
              <div className={cn("flex flex-col gap-4 sm:flex-row", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button key={index} variant={action.variant || "default"} asChild>
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export default function FAQZh() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-20 px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <Hero 
          title="常见问题"
          subtitle="关于卡波内格罗工业开发项目的常见问题"
          className="mb-16"
        />

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-colors">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0",
                        openIndex === index && "rotate-180"
                      )}
                    />
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: openIndex === index ? "auto" : 0,
                      opacity: openIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              还有问题？
            </h3>
            <p className="text-gray-400 text-lg">
              联系我们的团队获取更多信息
            </p>
            <Button asChild className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg">
              <Link href="/zh/contact">
                联系我们
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
