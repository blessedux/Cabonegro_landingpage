'use client'

import { useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrollProgress(latest)
    })

    return () => unsubscribe()
  }, [scrollYProgress])

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm backdrop-blur-sm border border-white/20">
      <div className="flex flex-col gap-1">
        <div>Scroll: {(scrollProgress * 100).toFixed(1)}%</div>
        <div className="text-xs text-gray-400">{(scrollProgress).toFixed(3)}</div>
      </div>
    </div>
  )
}

