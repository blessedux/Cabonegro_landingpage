"use client"

import { motion } from "framer-motion"
import { useState } from "react"

import { cn } from "@/lib/utils"

/** Local assets for footer title hover fills (cycled per letter). */
export const FOOTER_TITLE_LETTER_IMAGES: string[] = [
  "/image13.webp",
  "/cabonegro_frame1.webp",
  "/patagon_valley_thumbnail.webp",
  "/terminal_maritimo_thumbnail.webp",
  "/Puerto_v2.webp",
  "/macrolote.webp",
  "/cabo_negro1.webp",
  "/Patagon_Valley_v2.webp",
  "/image15.webp",
]

export interface RevealTextProps {
  text?: string
  textColor?: string
  fontSize?: string
  letterImages?: string[]
  className?: string
}

export function RevealText({
  text = "STUNNING",
  textColor = "text-white",
  fontSize = "text-[250px]",
  letterImages = FOOTER_TITLE_LETTER_IMAGES,
  className,
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const imgs = letterImages.length > 0 ? letterImages : FOOTER_TITLE_LETTER_IMAGES

  let letterOrdinal = 0

  return (
    <div className={cn("flex flex-wrap items-end justify-start", className)}>
      <div className="flex flex-wrap items-end justify-start gap-y-1">
        {text.split("").map((letter, index) => {
          if (letter === " ") {
            return (
              <span
                key={`space-${index}`}
                className="inline-block w-[0.28em] min-w-[0.35rem] shrink-0 sm:w-[0.35em]"
                aria-hidden
              />
            )
          }

          const li = letterOrdinal++
          const bgUrl = imgs[li % imgs.length]

          return (
            <span
              key={`${letter}-${index}`}
              onMouseEnter={() => setHoveredIndex(li)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                fontSize,
                "inline-block cursor-pointer relative overflow-hidden align-bottom leading-none",
                "select-none"
              )}
            >
              <span className="invisible block whitespace-pre" aria-hidden>
                {letter}
              </span>
              <motion.span
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  textColor
                )}
                animate={{
                  opacity: hoveredIndex === li ? 0 : 1,
                }}
                transition={{ duration: 0.1 }}
              >
                {letter}
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-cover bg-center bg-no-repeat"
                animate={{
                  opacity: hoveredIndex === li ? 1 : 0,
                  backgroundPosition: hoveredIndex === li ? "10% center" : "0% center",
                }}
                transition={{
                  opacity: { duration: 0.1 },
                  backgroundPosition: {
                    duration: 3,
                    ease: "easeInOut",
                  },
                }}
                style={{
                  backgroundImage: `url('${bgUrl}')`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {letter}
              </motion.span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
