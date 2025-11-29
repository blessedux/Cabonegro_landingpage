'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader-zh'
import NavbarZh from '@/components/sections/Navbar-zh'
import HeroZh from '@/components/sections/Hero-zh'
import AboutUs from '@/components/sections/AboutUs'
import Stats from '@/components/sections/Stats'
import Partners from '@/components/sections/Partners'
import { WorldMapDemoZh } from '@/components/ui/world-map-demo-zh'
import Press from '@/components/sections/Press'
import FAQZh from '@/components/sections/FAQ-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button'

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
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [contentPreRendered, setContentPreRendered] = useState(false) // Track if content is pre-rendered
  const contentRef = useRef<HTMLDivElement>(null)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete, isPreloaderBVisible, isLanguageSwitch } = usePreloader()

  // Preload critical assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Preload Spline scene
        const splineLink = document.createElement('link')
        splineLink.rel = 'preload'
        splineLink.href = 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/'
        splineLink.as = 'document'
        document.head.appendChild(splineLink)

        // Preload critical fonts
        const fontLink = document.createElement('link')
        fontLink.rel = 'preload'
        fontLink.href = '/_next/static/media/83afe278b6a6bb3c-s.p.3a6ba036.woff2'
        fontLink.as = 'font'
        fontLink.type = 'font/woff2'
        fontLink.crossOrigin = 'anonymous'
        document.head.appendChild(fontLink)

        // Mark assets as preloaded
        setAssetsPreloaded(true)
      } catch (error) {
        console.warn('Asset preloading failed:', error)
        setAssetsPreloaded(true) // Continue anyway
      }
    }

    preloadAssets()
  }, [])

  // Pre-render content early when preloader is visible (but keep it hidden)
  // This ensures content is loaded and ready before preloader fades out
  useEffect(() => {
    if (isPreloaderVisible && !isPreloaderBVisible) {
      // Start pre-rendering content early (after a short delay to let preloader initialize)
      const preRenderTimer = setTimeout(() => {
        setContentPreRendered(true)
      }, 1000) // Start pre-rendering after 1 second
      
      return () => clearTimeout(preRenderTimer)
    } else if (!isPreloaderVisible) {
      // If preloader is not visible, content should be ready
      setContentPreRendered(true)
    }
  }, [isPreloaderVisible, isPreloaderBVisible])

  // Handle preloader visibility logic
  useEffect(() => {
    // Check if assets are cached
    const assetsCached = localStorage.getItem('cabonegro-assets-cached') === 'true'
    
    // If PreloaderB is active, don't show main preloader
    if (isPreloaderBVisible) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
      return
    }
    
    // If assets are cached and user has seen preloader, skip preloader entirely
    if (assetsCached && hasSeenPreloader) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
      return
    }
    
    // If preloader is explicitly visible (first visit), wait for it to complete
    if (isPreloaderVisible) {
      setPreloaderFadeComplete(false)
      return
    }
    
    // If user has seen preloader before and no preloader is active, show content immediately
    if (hasSeenPreloader && !isPreloaderVisible) {
      setPreloaderFadeComplete(true)
      setContentReady(true)
      setContentPreRendered(true)
    }
  }, [hasSeenPreloader, isPreloaderBVisible, isPreloaderVisible, setPreloaderVisible])

  // Handle hash navigation (e.g., #FAQ) after page content is loaded
  useEffect(() => {
    if (preloaderFadeComplete && typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        // Wait a bit for the DOM to fully render
        const timer = setTimeout(() => {
          const element = document.getElementById(hash.substring(1))
          if (element) {
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - 20 // 20px offset to account for navbar
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [preloaderFadeComplete])

  // Handle content fade-in animation - start immediately when preloader starts fading
  useEffect(() => {
    if (preloaderFadeComplete && contentRef.current && contentPreRendered) {
      // Start content fade-in immediately when preloader starts fading out
      // No delay - content should be visible behind the fading preloader (cross-fade)
      // Content is already pre-rendered, so it's ready to fade in smoothly
      gsap.to(contentRef.current, { 
        opacity: 1, 
        duration: 0.6, // Match preloader fade duration for perfect cross-fade
        ease: 'power2.out',
        delay: 0 // No delay - start immediately
      })
    }
  }, [preloaderFadeComplete, contentPreRendered])

  // Ensure contentReady is set when preloaderFadeComplete is true
  useEffect(() => {
    if (preloaderFadeComplete && !contentReady) {
      setContentReady(true)
    }
  }, [preloaderFadeComplete, contentReady])

  // Safety fallback: ensure content shows after preloader duration + buffer
  useEffect(() => {
    if (isPreloaderVisible && !isPreloaderBVisible) {
      const duration = isLanguageSwitch ? 1.5 : 6
      const safetyTimeout = setTimeout(() => {
        // If preloader is still visible after duration + buffer, force show content
        setPreloaderFadeComplete(true)
        setContentReady(true)
        setPreloaderVisible(false)
        setPreloaderComplete(true)
      }, (duration + 1) * 1000) // duration + 1s buffer

      return () => clearTimeout(safetyTimeout)
    }
  }, [isPreloaderVisible, isPreloaderBVisible, isLanguageSwitch, setPreloaderVisible, setPreloaderComplete])

  const handlePreloaderFadeOutStart = () => {
    // Pre-render content when preloader starts fading out
    // This ensures content is fully loaded and ready before preloader disappears
    setContentPreRendered(true)
    setContentReady(true)
    setPreloaderFadeComplete(true)
  }

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    // Ensure content is shown when preloader completes
    setPreloaderFadeComplete(true)
    setContentReady(true)
  }

  return (
    <>
      {/* Preloader - Only show if PreloaderB is not active (don't show when navigating from explore/deck) */}
      {isPreloaderVisible && !isPreloaderBVisible && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          onFadeOutStart={handlePreloaderFadeOutStart}
          duration={isLanguageSwitch ? 1.5 : 6}
        />
      )}

      {/* Hero - Pre-render early but keep hidden until preloader fades */}
      {/* Hero should be visible immediately when preloader starts fading */}
      {contentPreRendered && (
        <div 
          style={{ 
            opacity: preloaderFadeComplete ? 1 : 0,
            pointerEvents: preloaderFadeComplete ? 'auto' : 'none',
            transition: preloaderFadeComplete ? 'opacity 0.6s ease-out' : 'none',
            position: 'relative',
            zIndex: preloaderFadeComplete ? 1 : 0
          }}
        >
          <HeroZh />
        </div>
      )}

      {/* Main Content - Pre-render early but hidden, fade in when ready */}
      {contentPreRendered && (
        <div 
          ref={contentRef}
          className={`min-h-screen bg-white text-foreground overflow-x-hidden max-w-full ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            opacity: preloaderFadeComplete ? 0 : 0, // Start invisible, GSAP will fade it in when preloaderFadeComplete is true
            pointerEvents: preloaderFadeComplete ? 'auto' : 'none',
            transition: 'none' // GSAP handles all transitions
          }}
        >
          {/* Navigation */}
          <NavbarZh />
        
          {/* Main Sections */}
          <main style={{ pointerEvents: 'auto' }}>
            <AboutUs />
            <Stats />
            <Partners />
            <WorldMapDemoZh />
            <Press />
            <FAQZh />
          </main>

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner />

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </div>
      )}
    </>
  )
}

export default function ChineseHome() {
  return (
    <NextIntlClientProvider messages={messages} locale="zh">
      <HomeContent />
    </NextIntlClientProvider>
  )
}
