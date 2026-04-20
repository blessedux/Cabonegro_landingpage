'use client'

import { useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Renders into `document.body` so `z-index` competes with other portaled explore UI (narrative card, mobile drawer). */
export default function ExploreBodyPortal({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setNode(document.body)
  }, [])
  if (!node) return null
  return createPortal(children, node)
}
