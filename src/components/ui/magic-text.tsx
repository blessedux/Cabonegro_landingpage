"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"

export interface MagicTextProps {
  text: string
  className?: string
}

/**
 * Word-by-word fade-in when the block enters the viewport.
 */
export const MagicText: React.FC<MagicTextProps> = ({ text, className = "" }) => {
  const container = React.useRef<HTMLParagraphElement>(null)
  const isInView = useInView(container, { once: true, amount: 0.35, margin: "0px 0px -8% 0px" })
  const words = text.split(" ")

  return (
    <p ref={container} className={`flex flex-wrap leading-relaxed ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={`w-${i}`}
          className="mr-[0.25em] inline-block"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.45,
            delay: i * 0.035,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}
