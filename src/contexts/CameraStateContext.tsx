'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CameraPosition {
  x: number
  y: number
  z: number
}

export interface CameraDirection {
  x: number
  y: number
  z: number
}

export interface MinimapState {
  position: { x: number; z: number }
  latLng: { lat: number; lng: number }
  angle: number
  direction: CameraDirection
}

export interface CameraState {
  position: CameraPosition
  angle: number
  direction: CameraDirection
}

interface CameraStateContextType {
  minimapState: MinimapState | null
  cameraState: CameraState | null
  setMinimapState: (state: MinimapState) => void
  setCameraState: (state: CameraState) => void
  // Navigation functions for camera controls
  navigateToNextWaypoint: (() => void) | null
  navigateToPreviousWaypoint: (() => void) | null
  toggleFreeFlight: (() => void) | null
  setNavigateToNextWaypoint: (fn: (() => void) | null) => void
  setNavigateToPreviousWaypoint: (fn: (() => void) | null) => void
  setToggleFreeFlight: (fn: (() => void) | null) => void
}

const CameraStateContext = createContext<CameraStateContextType | undefined>(undefined)

export function CameraStateProvider({ children }: { children: ReactNode }) {
  const [minimapState, setMinimapState] = useState<MinimapState | null>(null)
  const [cameraState, setCameraState] = useState<CameraState | null>(null)
  const [navigateToNextWaypoint, setNavigateToNextWaypoint] = useState<(() => void) | null>(null)
  const [navigateToPreviousWaypoint, setNavigateToPreviousWaypoint] = useState<(() => void) | null>(null)
  const [toggleFreeFlight, setToggleFreeFlight] = useState<(() => void) | null>(null)

  return (
    <CameraStateContext.Provider
      value={{
        minimapState,
        cameraState,
        setMinimapState,
        setCameraState,
        navigateToNextWaypoint,
        navigateToPreviousWaypoint,
        toggleFreeFlight,
        setNavigateToNextWaypoint,
        setNavigateToPreviousWaypoint,
        setToggleFreeFlight,
      }}
    >
      {children}
    </CameraStateContext.Provider>
  )
}

export function useCameraState() {
  const context = useContext(CameraStateContext)
  if (context === undefined) {
    throw new Error('useCameraState must be used within a CameraStateProvider')
  }
  return context
}
