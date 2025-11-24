'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import NavbarZh from '@/components/sections/Navbar-zh'
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
                Cabo Negro：<span className="text-primary">全球南方的未来能源枢纽</span>
              </h1>
              <div className="mt-4">
                <Button asChild className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4 border-2 border-red-500">
                  <a href="mailto:pyaconi@ylmv.cl" className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    联系我们
                  </a>
                </Button>
              </div>
            </div>
            <div className="space-y-6 text-muted-foreground">
              <p>
                想在 Cabo Negro 租赁或购买土地？我们的地产团队可为您提供可售地块、工业用地、配套
                设施与开发时间表等资讯。欢迎来信，我们会尽快与您联系。
              </p>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">预设消息：</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">
                    "您好，我有兴趣在 Cabo Negro 购买土地或与房地产团队安排会议。您能否为我提供有关可用地块、工业用地和开发机会的信息？谢谢。"
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                  <Link 
                    href="https://wa.me/56993091951?text=%E6%82%A8%E5%A5%BD%2C%20%E6%88%91%E6%9C%89%E5%85%B4%E8%B6%A3%E5%9C%A8%20Cabo%20Negro%20%E8%B4%AD%E4%B9%B0%E5%9C%9F%E5%9C%B0%E6%88%96%E4%B8%8E%E6%88%BF%E5%9C%B0%E4%BA%A7%E5%9B%A2%E9%98%9F%E5%AE%89%E6%8E%92%E4%BC%9A%E8%AE%AE%E3%80%82%E6%82%A8%E8%83%BD%E5%90%A6%E4%B8%BA%E6%88%91%E6%8F%90%E4%BE%9B%E6%9C%89%E5%85%B3%E5%8F%AF%E7%94%A8%E5%9C%B0%E5%9D%97%E3%80%81%E5%B7%A5%E4%B8%9A%E7%94%A8%E5%9C%B0%E5%92%8C%E5%BC%80%E5%8F%91%E6%9C%BA%E4%BC%9A%E7%9A%84%E4%BF%A1%E6%81%AF%EF%BC%9F%E8%B0%A2%E8%B0%A2%E3%80%82" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>通过 WhatsApp 联系</span>
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 底部卡片区域已移除，保持精简联系页 */}
    </div>
  )
}

export default function ChineseContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavbarZh />
      <main className="pt-12 pb-16 px-6">
        <AboutPage />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
