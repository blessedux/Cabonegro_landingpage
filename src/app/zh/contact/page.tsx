'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
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
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-snug">
              Lyra <span className="text-primary">生态系统</span>
              <span className="text-gray-500 dark:text-gray-400"> 汇聚我们的模型、产品与平台。</span>
            </h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                不止于模型，Lyra 支持从产品到 API 与平台的完整生态，助力开发者与企业创新。
              </p>
              <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                <Link href="#">
                  <span>了解更多</span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
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
      <main className="pt-32 pb-20 px-6">
        <AboutPage />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
