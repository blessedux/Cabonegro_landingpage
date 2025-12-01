'use client'

import { cn } from "@/lib/utils"
import { useState } from "react"

interface ImageGalleryProps {
  images: string[]
  className?: string
}

export default function ImageGallery({ images, className }: ImageGalleryProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Calculate base width for each image (equal distribution)
  const baseWidth = 100 / images.length

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredIndex(null)
      }}
    >
      <div className="flex items-stretch h-full w-full" style={{ gap: '0' }}>
        {images.map((src, idx) => {
          const isExpanded = isHovered && hoveredIndex === idx
          const isCollapsed = isHovered && hoveredIndex !== null && hoveredIndex !== idx
          
          // Calculate widths: expanded gets more space, collapsed gets less, default is equal
          let widthPercent: number
          if (!isHovered) {
            // Default: all images equal width
            widthPercent = baseWidth
          } else if (isExpanded) {
            // Expanded image takes 45% of space
            widthPercent = 45
          } else if (isCollapsed) {
            // Collapsed images share remaining 55% equally
            widthPercent = 55 / (images.length - 1)
          } else {
            widthPercent = baseWidth
          }

          return (
            <div
              key={idx}
              className={cn(
                "relative overflow-hidden h-full cursor-pointer",
                "flex-shrink-0"
              )}
              style={{
                width: `${widthPercent}%`,
                minWidth: isCollapsed ? '120px' : undefined, // Ensure collapsed images are still visible
                transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1), min-width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: isExpanded ? 0 : 1,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                className="h-full w-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  transition: 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isExpanded ? 'scale(1.03)' : 'scale(1)',
                  willChange: 'transform',
                }}
                src={src}
                alt={`gallery-image-${idx}`}
                loading="lazy"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

