'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { Flip } from 'gsap/Flip'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, Flip)
}

interface LayoutPreloaderProps {
  onComplete?: () => void
  duration?: number
  className?: string
}

// Custom ease animations
const customEase = CustomEase.create("customEase", "0.6, 0.01, 0.05, 1")
const directionalEase = CustomEase.create("directionalEase", "0.16, 1, 0.3, 1")
const smoothBlur = CustomEase.create("smoothBlur", "0.25, 0.1, 0.25, 1")
const gentleIn = CustomEase.create("gentleIn", "0.38, 0.005, 0.215, 1")

// Initial zoom level for all images
const INITIAL_ZOOM = 1.2

interface GridPositions {
  firstColumnLeft: number;
  lastColumnRight: number;
  column7Left: number;
  columnPositions: Array<{
    left: number;
    right: number;
    width: number;
    center: number;
  }>;
  padding: number;
}

export default function LayoutPreloader({ onComplete, duration = 6, className = '' }: LayoutPreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showRestart, setShowRestart] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const mainTlRef = useRef<gsap.core.Timeline | null>(null)

  // Function to get grid column positions
  const getGridPositions = () => {
    const gridOverlay = document.querySelector(".grid-overlay-inner")
    if (!gridOverlay) return null

    const columns = gridOverlay.querySelectorAll(".grid-column")

    // Make grid temporarily visible to get accurate measurements
    gsap.set(".grid-overlay", { opacity: 1 })

    // Get all column positions
    const columnPositions = Array.from(columns).map((col) => {
      const rect = col.getBoundingClientRect()
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        center: rect.left + rect.width / 2
      }
    })

    // Hide grid again
    gsap.set(".grid-overlay", { opacity: 0 })

    return {
      firstColumnLeft: columnPositions[0].left,
      lastColumnRight: columnPositions[columnPositions.length - 1].right,
      column7Left: columnPositions[6].left,
      columnPositions: columnPositions,
      padding: parseInt(window.getComputedStyle(gridOverlay).paddingLeft)
    }
  }

  // Function to position text elements based on container position
  const positionTextElements = () => {
    const container = document.querySelector(".preloader-container")
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const textVE = document.querySelector("#text-ve")
    const textLA = document.querySelector("#text-la")

    if (textVE) {
      gsap.set(textVE, {
        left: containerRect.left - 80 + "px"
      })
    }

    if (textLA) {
      gsap.set(textLA, {
        left: containerRect.right + 20 + "px"
      })
    }
  }

  // Function to align header elements to grid
  const alignHeaderToGrid = (gridPositions: GridPositions) => {
    const headerLeft = document.querySelector(".header-left")
    const headerMiddle = document.querySelector(".header-middle")
    const headerRight = document.querySelector(".header-right")

    if (headerLeft) {
      gsap.set(headerLeft, {
        position: "absolute",
        left: gridPositions.firstColumnLeft + "px"
      })
    }

    if (headerMiddle) {
      gsap.set(headerMiddle, {
        position: "absolute",
        left: gridPositions.column7Left + "px"
      })
    }

    if (headerRight) {
      gsap.set(headerRight, {
        position: "absolute",
        right: window.innerWidth - gridPositions.lastColumnRight + "px"
      })
    }
  }

  // Function to reset everything to initial state
  const resetToInitialState = () => {
    // Reset container
    gsap.set(".preloader-container", {
      width: "400px",
      height: "300px",
      position: "relative",
      overflow: "hidden"
    })

    // Reset text elements
    gsap.set(".text-element", {
      fontSize: "5rem",
      top: "50%",
      transform: "translateY(-50%)"
    })

    // Reset big title
    gsap.set(".big-title", { opacity: 0 })
    gsap.set(".title-line span", { y: "100%" })

    // Reset grid overlay
    gsap.set(".grid-overlay", { opacity: 0 })
    gsap.set(".grid-column", {
      borderLeftColor: "rgba(255, 255, 255, 0)",
      borderRightColor: "rgba(255, 255, 255, 0)"
    })

    // Reset header and footer
    gsap.set(".header-left", { opacity: 0, transform: "translateY(-20px)" })
    gsap.set(".header-middle", { opacity: 0, transform: "translateY(-20px)" })
    gsap.set(".social-links", { opacity: 0, transform: "translateY(-20px)" })
    gsap.set(".footer", { transform: "translateY(100%)" })

    // Get all wrappers and images
    const wrappers = document.querySelectorAll(".image-wrapper")
    const images = document.querySelectorAll(".image-wrapper img")

    // Reset all wrappers to initial state
    gsap.set(wrappers, {
      visibility: "visible",
      clipPath: "inset(100% 0 0 0)",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      xPercent: 0,
      yPercent: 0,
      clearProps: "transform,transformOrigin"
    })

    // Reset all images with initial zoom
    gsap.set(images, {
      scale: INITIAL_ZOOM,
      transformOrigin: "center center",
      clearProps: "width,height"
    })

    // Position text elements based on container position
    positionTextElements()
  }

  // Function to initialize the animation
  const initAnimation = () => {
    // Kill any existing timeline
    if (mainTlRef.current) mainTlRef.current.kill()

    // Reset button
    gsap.set(".restart-btn", { opacity: 0, pointerEvents: "none" })
    setShowRestart(false)

    // Reset body to center the container
    gsap.set("body", {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    })

    // Reset everything to initial state
    resetToInitialState()

    // Get references to elements
    const wrappers = document.querySelectorAll(".image-wrapper")
    const finalWrapper = document.querySelector("#final-image")
    const finalImage = finalWrapper?.querySelector("img")
    const textVE = document.querySelector("#text-ve")
    const textLA = document.querySelector("#text-la")
    const gridColumns = document.querySelectorAll(".grid-column")
    const headerLeft = document.querySelector(".header-left")
    const headerMiddle = document.querySelector(".header-middle")
    const socialLinks = document.querySelector(".social-links")
    const titleLines = document.querySelectorAll(".title-line span")

    // Create a new timeline
    const mainTl = gsap.timeline({
      onComplete: () => {
        setShowRestart(true)
        setTimeout(() => {
          setIsVisible(false)
          onComplete?.()
        }, 2000) // Show final state for 2 seconds
      }
    })

    mainTlRef.current = mainTl

    // PHASE 1: Fast image loading sequence
    wrappers.forEach((wrapper, index) => {
      if (index > 0) {
        mainTl.add("image" + index, "<0.15")
      }

      mainTl.to(
        wrapper,
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 0.65,
          ease: smoothBlur
        },
        index > 0 ? "image" + index : 0
      )
    })

    mainTl.add("pauseBeforeZoom", ">0.2")
    mainTl.add("finalAnimation", "pauseBeforeZoom")

    // Get grid positions for text alignment
    const gridPositions = getGridPositions()
    if (gridPositions) {
      alignHeaderToGrid(gridPositions)
    }

    const padding = gridPositions?.padding || 32

    // Store the initial position of LA for FLIP animation
    const laElement = document.querySelector("#text-la")
    const laInitialState = laElement ? Flip.getState(laElement) : null

    // Animate the final image
    mainTl.add(() => {
      if (!finalWrapper || !finalImage) return

      const state = Flip.getState(finalWrapper)

      gsap.set(".preloader-container", { overflow: "visible" })

      gsap.set(finalWrapper, {
        position: "fixed",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        width: "100dvw",
        height: "100dvh"
      })

      Flip.from(state, {
        duration: 1.2,
        ease: customEase,
        absolute: true
      })

      gsap.to(finalImage, {
        scale: 1.0,
        duration: 1.2,
        ease: customEase
      })
    }, "finalAnimation")

    // Animate VE to the padding position
    if (textVE) {
      mainTl.to(
        textVE,
        {
          left: padding + "px",
          fontSize: "3rem",
          duration: 1.2,
          ease: directionalEase
        },
        "finalAnimation"
      )
    }

    // For LA, use FLIP to ensure smooth animation
    if (laElement && laInitialState) {
      mainTl.add(() => {
        gsap.set(laElement, {
          left: "auto",
          right: padding + "px",
          fontSize: "3rem"
        })

        Flip.from(laInitialState, {
          duration: 1.2,
          ease: directionalEase,
          absolute: true
        })
      }, "finalAnimation")
    }

    mainTl.add("pauseAfterZoom", ">0.3")
    mainTl.add("gridReveal", "pauseAfterZoom")

    // Show the grid overlay
    mainTl.to(
      ".grid-overlay",
      {
        opacity: 1,
        duration: 0.4,
        ease: gentleIn
      },
      "gridReveal"
    )

    // Stagger animate the grid columns
    mainTl.to(
      ".grid-column",
      {
        borderLeftColor: "rgba(255, 255, 255, 0.2)",
        borderRightColor: "rgba(255, 255, 255, 0.2)",
        duration: 0.6,
        stagger: 0.08,
        ease: gentleIn
      },
      "gridReveal"
    )

    mainTl.add("headerFooter", ">-0.3")

    // Stagger animate header elements
    if (headerLeft) {
      mainTl.to(
        headerLeft,
        {
          opacity: 1,
          transform: "translateY(0)",
          duration: 0.6,
          ease: directionalEase
        },
        "headerFooter"
      )
    }

    if (headerMiddle) {
      mainTl.to(
        headerMiddle,
        {
          opacity: 1,
          transform: "translateY(0)",
          duration: 0.6,
          ease: directionalEase,
          delay: 0.15
        },
        "headerFooter"
      )
    }

    if (socialLinks) {
      mainTl.to(
        socialLinks,
        {
          opacity: 1,
          transform: "translateY(0)",
          duration: 0.6,
          ease: directionalEase,
          delay: 0.3
        },
        "headerFooter"
      )
    }

    // Animate footer
    mainTl.to(
      ".footer",
      {
        transform: "translateY(0)",
        duration: 0.7,
        ease: directionalEase
      },
      "headerFooter+=0.4"
    )

    mainTl.add("titleReveal", ">-0.2")

    // Make title visible
    mainTl.to(
      ".big-title",
      {
        opacity: 1,
        duration: 0.3
      },
      "titleReveal"
    )

    // Animate each line of the title
    mainTl.to(
      titleLines,
      {
        y: "0%",
        duration: 0.9,
        stagger: 0.15,
        ease: customEase,
        onComplete: () => {
          gsap.to(".restart-btn", {
            opacity: 1,
            duration: 0.4,
            pointerEvents: "auto"
          })
        }
      },
      "titleReveal+=0.1"
    )

    return mainTl
  }

  const handleRestart = () => {
    initAnimation()
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Delay initialization slightly to ensure all elements are properly rendered
    const timer = setTimeout(initAnimation, 100)

    return () => {
      clearTimeout(timer)
      if (mainTlRef.current) {
        mainTlRef.current.kill()
      }
    }
  }, [initAnimation])

  if (!isVisible) return null

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-gray-100 overflow-hidden ${className}`}
      style={{ fontFamily: 'PP Neue Montreal, sans-serif' }}
    >
      {/* Background noise effect */}
      <div 
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.03] pointer-events-none z-[100]"
        style={{
          background: 'transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0',
          backgroundSize: '300px 300px',
          animation: 'noise-animation 0.3s steps(5) infinite'
        }}
      />

      {/* Header */}
      <header className="header fixed top-0 left-0 w-full py-8 z-50 text-[1.75rem] tracking-[-0.02em] text-white">
        <div className="header-inner w-full px-8 flex justify-between">
          <div className="header-left font-bold opacity-0 transform -translate-y-5">
            CABO NEGRO
          </div>
          <div className="header-middle flex gap-12 opacity-0 transform -translate-y-5">
            <a href="#" className="nav-link font-bold text-white no-underline">INVESTMENTS</a>
            <a href="#" className="nav-link font-bold text-white no-underline">DEVELOPMENT</a>
          </div>
          <div className="header-right flex gap-8">
            <div className="social-links opacity-0 transform -translate-y-5 font-medium">
              <a href="#" className="text-white no-underline">IG</a>
              <a href="#" className="text-white no-underline ml-4">IN</a>
            </div>
          </div>
        </div>
      </header>

      {/* Text elements */}
      <div className="text-element fixed text-[5rem] font-bold text-white z-20 top-1/2 transform -translate-y-1/2 tracking-[-0.02em]" id="text-ve">
        CA
      </div>

      {/* Preloader container */}
      <div className="preloader-container relative w-[400px] h-[300px] overflow-hidden z-[5]">
        <div className="image-wrapper absolute top-0 left-0 w-full h-full invisible">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop" 
            alt="Industrial Development 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="image-wrapper absolute top-0 left-0 w-full h-full invisible">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop" 
            alt="Industrial Development 2"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="image-wrapper absolute top-0 left-0 w-full h-full invisible">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop" 
            alt="Industrial Development 3"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="image-wrapper absolute top-0 left-0 w-full h-full invisible z-10" id="final-image">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop" 
            alt="Industrial Development 4"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="text-element fixed text-[5rem] font-bold text-white z-20 top-1/2 transform -translate-y-1/2 tracking-[-0.02em]" id="text-la">
        BO
      </div>

      {/* Big Title */}
      <div className="big-title fixed bottom-[5%] left-8 text-white z-25 font-bold text-[clamp(2.5rem,14vh,12rem)] tracking-[-0.02em] leading-[0.9] opacity-0">
        <div className="title-line overflow-hidden h-40">
          <span className="block transform translate-y-full">INDUSTRIAL</span>
        </div>
        <div className="title-line overflow-hidden h-40">
          <span className="block transform translate-y-full">EXCELLENCE</span>
        </div>
        <div className="title-line overflow-hidden h-40">
          <span className="block transform translate-y-full">BEYOND LIMITS</span>
        </div>
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay fixed top-0 left-0 w-screen h-screen z-[5] pointer-events-none opacity-0">
        <div className="grid-overlay-inner w-full h-full px-8 flex justify-between">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="grid-column flex-1 h-full border-l border-r border-transparent mx-2" />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer fixed bottom-0 left-0 w-full p-8 flex justify-center items-center z-50 text-[1.2rem] tracking-[-0.02em] text-white transform translate-y-full">
        <div className="coordinates font-medium opacity-80">
          51.5074° N, 0.1278° W
        </div>
      </footer>

      {/* Restart button */}
      {showRestart && (
        <button 
          className="restart-btn fixed bottom-[30px] right-[30px] w-[30px] h-[30px] bg-transparent border-none cursor-pointer z-[60] opacity-0 pointer-events-none transition-transform duration-300 hover:rotate-45"
          onClick={handleRestart}
        >
          <div className="dot-container relative w-full h-full grid grid-cols-2 grid-rows-2 gap-1 transition-transform duration-300">
            <div className="dot w-[6px] h-[6px] bg-white rounded-full m-auto" />
            <div className="dot w-[6px] h-[6px] bg-white rounded-full m-auto" />
            <div className="dot w-[6px] h-[6px] bg-white rounded-full m-auto" />
            <div className="dot w-[6px] h-[6px] bg-white rounded-full m-auto" />
          </div>
        </button>
      )}
    </div>
  )
}
