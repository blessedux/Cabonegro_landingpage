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
              Cabo Negro：<span className="text-primary">全球南方的未来能源枢纽</span>
            </h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                想在 Cabo Negro 租赁或购买土地？我们的地产团队可为您提供可售地块、工业用地、配套
                设施与开发时间表等资讯。欢迎来信，我们会尽快与您联系。
              </p>
              <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                <Link href="https://wa.me/56993091951" target="_blank" rel="noopener noreferrer">
                  <span>通过 WhatsApp 联系</span>
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
      <main className="pt-20 md:pt-24 pb-16 px-6">
        <AboutPage />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
