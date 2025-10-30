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
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl space-y-16 px-6">
          <div className="grid gap-6 text-center md:grid-cols-2 md:gap-12 md:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white">关于我们</h1>
            <p className="text-muted-foreground">专注于为企业打造创新解决方案，助力数字化增长。</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-16">
            <div className="md:flex-1">
              <Image src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_chat_gradient.png" alt="Left big image" className="rounded-xl object-cover w-full h-[300px] sm:h-[360px] md:h-[100%]" width={800} height={550} />
            </div>
            <div className="flex flex-col gap-6 md:flex-1">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }} className="relative overflow-hidden rounded-xl bg-black text-white shadow-lg">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="relative h-60 sm:h-64 md:h-48 w-full overflow-hidden">
                  <Image src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon.png" alt="Card Image" className="h-full w-full object-cover" width={600} height={400} />
                  <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black via-black/70 to-transparent" />
                </motion.div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">加速增长</h3>
                  <p className="mt-2 text-sm text-gray-300">推动企业创新与效率，创造可衡量的影响。</p>
                  <Button variant="outline" className="mt-4 border-white text-black dark:text-white hover:bg白 hover:text-black">了解更多</Button>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }} className="relative overflow-hidden rounded-xl bg-muted shadow-lg">
                <Image src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_hero_gradient.jpg" alt="Secondary card" className="h-full w-full object-cover min-h-[220px] sm:min-h-[240px] md:min-h-[220px]" width={600} height={400} />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h3 className="text-xl font-bold">面向未来的设计</h3>
                  <p className="mt-2 text-sm text-gray-200">兼具美学与功能性的直观、可扩展设计。</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
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
