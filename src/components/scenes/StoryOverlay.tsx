'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export interface StoryPoint {
  position: [number, number, number]
  title: string
  description: string
  triggerDistance?: number
}

export const DEFAULT_STORY_POINTS: StoryPoint[] = [
  {
    position: [0, 0, 0],
    title: 'Cabo Negro',
    description: 'Strategic Gateway to Patagonia',
    triggerDistance: 100
  },
  {
    position: [150, 0, 150],
    title: 'Maritime Terminal',
    description: 'Future deep-water port facility',
    triggerDistance: 80
  },
  {
    position: [-150, 0, -150],
    title: 'Development Zone',
    description: 'Industrial and logistics hub',
    triggerDistance: 80
  },
]

interface StoryOverlayControllerProps {
  storyPoints?: StoryPoint[]
}

/**
 * Controller component that runs inside Canvas
 * Monitors camera position and updates shared state
 */
export function StoryOverlayController({ storyPoints = DEFAULT_STORY_POINTS }: StoryOverlayControllerProps) {
  const { camera } = useThree()
  const lastCheckTime = useRef(0)
  const THROTTLE_MS = 100 // Check every 100ms instead of every frame
  const currentStoryRef = useRef<StoryPoint | null>(null)
  const opacityRef = useRef(0)

  // Check camera proximity to story points using useFrame for better performance
  useFrame(() => {
    // Safety check - ensure camera is properly initialized
    if (!camera || !camera.position) return
    
    const now = Date.now()
    if (now - lastCheckTime.current < THROTTLE_MS) return
    lastCheckTime.current = now
    
    let closestStory: StoryPoint | null = null
    let closestDistance = Infinity

    storyPoints.forEach((story) => {
      try {
        const storyPosition = new THREE.Vector3(...story.position)
        const distance = camera.position.distanceTo(storyPosition)
        const triggerDistance = story.triggerDistance || 100

        if (distance < triggerDistance && distance < closestDistance) {
          closestDistance = distance
          closestStory = story
        }
      } catch (error) {
        // Silently handle any errors in distance calculation
        console.warn('Error calculating story point distance:', error)
      }
    })

    // Update shared state via window object (for communication with UI component)
    if (typeof window !== 'undefined') {
      const storyChanged = closestStory !== currentStoryRef.current
      
      if (storyChanged) {
        currentStoryRef.current = closestStory
        
        // Update window state for UI component to read
        ;(window as any).__storyOverlay = {
          activeStory: closestStory,
          cameraPosition: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          }
        }

        // Trigger custom event for UI component
        window.dispatchEvent(new CustomEvent('storyoverlay-update', {
          detail: { activeStory: closestStory }
        }))
      }
    }
  })

  return null // This component doesn't render anything
}

/**
 * UI component that renders outside Canvas
 * Reads state from window object and renders HTML overlays
 */
export default function StoryOverlay({ storyPoints = DEFAULT_STORY_POINTS }: { storyPoints?: StoryPoint[] }) {
  const [activeStory, setActiveStory] = useState<StoryPoint | null>(null)
  const [opacity, setOpacity] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  // Listen for updates from controller
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUpdate = (event: CustomEvent) => {
      const newStory = event.detail.activeStory as StoryPoint | null
      
      if (newStory && newStory !== activeStory) {
        setActiveStory(newStory)
        // Fade in
        if (animationRef.current) {
          animationRef.current.kill()
        }
        animationRef.current = gsap.to({ opacity: 0 }, {
          opacity: 1,
          duration: 0.5,
          onUpdate: function() {
            setOpacity(this.targets()[0].opacity)
          }
        })
      } else if (!newStory && activeStory) {
        // Fade out
        if (animationRef.current) {
          animationRef.current.kill()
        }
        animationRef.current = gsap.to({ opacity: opacity }, {
          opacity: 0,
          duration: 0.5,
          onUpdate: function() {
            setOpacity(this.targets()[0].opacity)
          },
          onComplete: () => {
            setActiveStory(null)
          }
        })
      }
    }

    window.addEventListener('storyoverlay-update', handleUpdate as EventListener)
    
    // Initial check
    if ((window as any).__storyOverlay) {
      handleUpdate(new CustomEvent('storyoverlay-update', {
        detail: { activeStory: (window as any).__storyOverlay.activeStory }
      }))
    }

    return () => {
      window.removeEventListener('storyoverlay-update', handleUpdate as EventListener)
    }
  }, [activeStory, opacity])

  // Navigation controls UI
  const NavigationControls = () => {
    return (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 flex gap-4 items-center">
          <button
            onClick={() => {
              if ((window as any).navigateToPreviousWaypoint) {
                (window as any).navigateToPreviousWaypoint()
              }
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              if ((window as any).toggleFreeFlight) {
                (window as any).toggleFreeFlight()
              }
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
          >
            Toggle Free Flight
          </button>
          <button
            onClick={() => {
              if ((window as any).navigateToNextWaypoint) {
                (window as any).navigateToNextWaypoint()
              }
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
          >
            Next →
          </button>
        </div>
        <div className="mt-2 text-center text-white/60 text-sm">
          <p>Space: Toggle Free Flight | Arrow Keys: Navigate Tour</p>
        </div>
      </div>
    )
  }

  // Story overlay content
  const StoryContent = () => {
    if (!activeStory) return null

    return (
      <div
        ref={overlayRef}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        style={{ opacity }}
      >
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{activeStory.title}</h2>
          <p className="text-gray-300">{activeStory.description}</p>
        </div>
      </div>
    )
  }

  // Render to document body using portal
  if (typeof window === 'undefined') return null

  return (
    <>
      {createPortal(<StoryContent />, document.body)}
      {createPortal(<NavigationControls />, document.body)}
    </>
  )
}
