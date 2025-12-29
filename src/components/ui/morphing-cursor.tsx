"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MagneticTextProps {
  text: string | string[]
  hoverText?: string | string[]
  className?: string
}

export function MagneticText({ text = "CREATIVE", hoverText = "EXPLORE", className }: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const innerTextRef = useRef<HTMLDivElement>(null)
  const hoverTextRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [hoverTextSize, setHoverTextSize] = useState({ width: 0, height: 0 })
  
  // Normalize text and hoverText to arrays
  const textLines = Array.isArray(text) ? text : [text]
  const hoverTextLines = Array.isArray(hoverText) ? hoverText : [hoverText]

  const mousePos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
      // Measure hover text size
      if (hoverTextRef.current) {
        setHoverTextSize({
          width: hoverTextRef.current.offsetWidth,
          height: hoverTextRef.current.offsetHeight,
        })
      }
    }
    
    // Use requestAnimationFrame to batch size updates
    let rafId: number
    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateSize)
    }
    
    scheduleUpdate()
    
    // Throttle resize events
    let resizeTimeout: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(scheduleUpdate, 150)
    }
    
    window.addEventListener("resize", handleResize, { passive: true })
    return () => {
      window.removeEventListener("resize", handleResize)
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(resizeTimeout)
    }
  }, [hoverTextLines.join(','), textLines.join(',')]) // Use string comparison instead of array reference

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor
    
    // Cache container dimensions to avoid getBoundingClientRect on every frame
    let containerWidth = 0
    let containerHeight = 0
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        containerWidth = rect.width
        containerHeight = rect.height
      }
    }
    updateContainerSize()

    const animate = () => {
      if (!containerRef.current || !circleRef.current) return
      
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15)
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15)

      // Use transform instead of style.transform for better performance
      circleRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`

      if (innerTextRef.current && isHovered) {
        // Position hover text to match base text position
        const containerCenterX = containerWidth / 2
        const containerCenterY = containerHeight / 2
        const offsetX = containerCenterX - currentPos.current.x
        const offsetY = containerCenterY - currentPos.current.y
        
        innerTextRef.current.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`
      } else if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate(-50%, -50%) translate(${-currentPos.current.x}px, ${-currentPos.current.y}px)`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Only start animation if component is mounted and visible
    if (containerRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isHovered])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mousePos.current = { x, y }
    currentPos.current = { x, y }
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative inline-flex items-center justify-center cursor-none select-none", className)}
    >
      {/* Base text layer - original text */}
      <div className="flex flex-col items-center justify-center text-center" style={{ gap: 0 }}>
        {textLines.map((line, index) => (
          <span 
            key={index}
            className="text-5xl font-bold tracking-tighter text-white tracking-wide block whitespace-nowrap"
            style={{ display: 'block', lineHeight: '1.25', margin: 0, padding: 0 }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* Hidden hover text for measurement */}
      <div
        ref={hoverTextRef}
        className="absolute invisible flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          top: 0,
          left: 0,
          opacity: 0,
          zIndex: -1,
        }}
      >
        {hoverTextLines.map((line, index) => (
          <span 
            key={index}
            className="text-5xl font-bold tracking-tighter text-black tracking-wide whitespace-nowrap block"
            style={{ display: 'block', lineHeight: '1.25' }}
          >
            {line}
          </span>
        ))}
      </div>

      <div
        ref={circleRef}
        className="absolute top-0 left-0 pointer-events-none rounded-full bg-white overflow-hidden"
        style={{
          // Make it circular and reduce to 1/3 of current size
          width: isHovered ? Math.max(
            containerSize.width + 120, 
            hoverTextSize.width + 120, 
            containerSize.height + 120,
            hoverTextSize.height + 120,
            500
          ) / 3 : 0,
          height: isHovered ? Math.max(
            containerSize.width + 120, 
            hoverTextSize.width + 120, 
            containerSize.height + 120,
            hoverTextSize.height + 120,
            500
          ) / 3 : 0,
          transition: "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
          willChange: "transform, width, height",
        }}
      >
        <div
          ref={innerTextRef}
          className="absolute flex flex-col items-center justify-center text-center"
          style={{
            width: '100%',
            height: '100%',
            top: "50%",
            left: "50%",
            willChange: "transform",
            gap: 0,
          }}
        >
          {hoverTextLines.map((line, index) => (
            <span 
              key={index}
              className="text-5xl font-bold tracking-tighter text-black tracking-wide whitespace-nowrap block"
              style={{ display: 'block', lineHeight: '1.25', margin: 0, padding: 0 }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

