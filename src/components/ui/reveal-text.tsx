"use client"

import { motion } from "framer-motion"
import { useState } from "react"

import { cn } from "@/lib/utils"

/** Local assets for footer title hover fills (cycled per letter). */
export const FOOTER_TITLE_LETTER_IMAGES: string[] = [
  "/patagon_valley_thumbnail.webp",
  "/terminal_maritimo_thumbnail.webp",
  "/Puerto_v2.webp",
  "/macrolote.webp",
  "/macrolote2_thumbnail.webp",
]

export interface RevealTextProps {
  text?: string
  textColor?: string
  fontSize?: string
  letterImages?: string[]
  interactive?: boolean
  align?: "start" | "end"
  className?: string
}

export function RevealText({
  text = "STUNNING",
  textColor = "text-white",
  fontSize = "text-[250px]",
  letterImages = FOOTER_TITLE_LETTER_IMAGES,
  interactive = true,
  align = "start",
  className,
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const imgs = letterImages.length > 0 ? letterImages : FOOTER_TITLE_LETTER_IMAGES

  let letterOrdinal = 0
  const justifyClass = align === "end" ? "justify-end" : "justify-start"

  return (
    <div className={cn("flex flex-wrap items-end", justifyClass, className)}>
      <div className={cn("flex flex-wrap items-end gap-y-1", justifyClass)}>
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
              onMouseEnter={interactive ? () => setHoveredIndex(li) : undefined}
              onMouseLeave={interactive ? () => setHoveredIndex(null) : undefined}
              className={cn(
                fontSize,
                "inline-block relative overflow-hidden align-bottom leading-none",
                interactive ? "cursor-pointer" : "cursor-default",
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
                  opacity: interactive && hoveredIndex === li ? 0 : 1,
                }}
                transition={{ duration: 0.1 }}
              >
                {letter}
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-cover bg-center bg-no-repeat"
                animate={{
                  opacity: interactive && hoveredIndex === li ? 1 : 0,
                  backgroundPosition: interactive && hoveredIndex === li ? "10% center" : "0% center",
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
