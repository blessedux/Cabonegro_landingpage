'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NextIntlClientProvider } from 'next-intl'
import { PreloaderProvider } from '@/contexts/PreloaderContext'
import { AnimationProvider } from '@/contexts/AnimationContext'
import { CookieBannerProvider } from '@/contexts/CookieBannerContext'
import { ThemeProvider } from 'next-themes'
import { useAnimation } from '@/contexts/AnimationContext'
import NavbarZh from '@/components/sections/Navbar-zh'
import HeroZh from '@/components/sections/Hero-zh'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats'
import Partners from '@/components/sections/Partners'
import FAQZh from '@/components/sections/FAQ-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

const messages = {
  "preloader": {
    "terminal": {
      "title": "工业门户",
      "subtitle": "开发已启动",
      "lines": {
        "coordinates": "工业开发：卡波内格罗区域",
        "coordinatesLocked": "战略位置已确保",
        "calibration": "启动基础设施分析",
        "calibrationComplete": "基础设施分析完成",
        "initializing": "初始化系统",
        "systemReady": "系统就绪",
        "accessGranted": "访问已授权"
      }
    }
  },
  "hero": {
    "title": "卡波内格罗",
    "subtitle": "智利南部的战略工业门户",
    "description": "探索麦哲伦地区最具战略意义的工业发展机会",
    "cta": "探索地形"
  },
  "features": {
    "title": "战略投资机会",
    "subtitle": "卡波内格罗代表了战略位置、可再生能源潜力和即建基础设施的独特融合",
    "strategicGateway": {
      "title": "战略门户",
      "description": "连接大西洋和太平洋的巴拿马运河替代方案",
      "highlights": [
        "通往南极洲的主要门户",
        "无通行费和地缘政治稳定位置",
        "大西洋-太平洋海上走廊"
      ]
    },
    "h2vOpportunity": {
      "title": "H₂V机会",
      "description": "麦哲伦地区正在探索重要的绿色氢气潜力",
      "highlights": [
        "200多个项目已提交或正在审查中",
        "区域氢气行业正在增长",
        "EDF将于2025年底进入"
      ]
    },
    "industrialReady": {
      "title": "工业就绪",
      "description": "300多公顷即建工业基础设施",
      "highlights": [
        "连接9号公路北段主走廊",
        "6条内部道路（33%已建成）",
        "13兆瓦电力容量"
      ]
    },
    "maritimeTerminal": {
      "title": "海事终端",
      "description": "2026年即建的双阶段港口建设",
      "highlights": [
        "受保护的港口位置",
        "第一阶段：350米平台+坡道",
        "第二阶段：350米桥梁+300米码头"
      ]
    },
    "regulatoryAdvantage": {
      "title": "监管优势",
      "description": "简化的许可和国际合规",
      "highlights": [
        "SEA环境批准",
        "国际海事标准",
        "快速通道开发流程"
      ]
    },
    "windPotential": {
      "title": "风力潜力",
      "description": "7×智利当前发电能力",
      "highlights": [
        "该地区巨大的风力潜力",
        "低托管和维护成本",
        "可持续能源基础设施"
      ]
    }
  },
  "partners": {
    "title": "值得信赖的合作伙伴",
    "subtitle": "战略联盟",
    "description": "与行业领导者合作，建设智利首屈一指的工业和海事中心"
  },
  "stats": {
    "title": "项目统计",
    "subtitle": "关键指标",
    "description": "卡波内格罗工业开发的重要数据"
  },
  "faq": {
    "title": "常见问题",
    "subtitle": "解答您的疑问",
    "description": "关于卡波内格罗工业开发项目的常见问题"
  },
  "footer": {
    "copyright": "© 2025 卡波内格罗工业开发。保留所有权利。",
    "coordinates": "51.5074° N, 0.1278° W"
  }
}

function HomeContent() {
  const { isFadingOut } = useAnimation()

  return (
    <div className={`min-h-screen bg-black text-white transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Navigation */}
      <NavbarZh />
      
      {/* Main Sections */}
      <main>
        <HeroZh />
        <Features />
        <Stats />
        <Partners />
        <FAQZh />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}

export default function ChineseHome() {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale="zh">
            <PreloaderProvider>
              <AnimationProvider>
                <CookieBannerProvider>
                  <HomeContent />
                </CookieBannerProvider>
              </AnimationProvider>
            </PreloaderProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
