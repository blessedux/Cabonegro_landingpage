'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useRef, useState, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import ProceduralTerrainShader from '@/components/scenes/ProceduralTerrainShader'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'

/**
 * Drag controls for panning terrain - exact match to example
 */
function TerrainDragControls({ setControlsEnabled }: { setControlsEnabled: (enabled: boolean) => void }) {
  const { camera, raycaster, gl } = useThree()
  const [dragState, setDragState] = useState({ down: false, hover: false })
  const prevWorldCoordsRef = useRef(new THREE.Vector3())
  const worldCoordsRef = useRef(new THREE.Vector3())
  const screenCoordsRef = useRef(new THREE.Vector2())
  const dragPlaneRef = useRef<THREE.Mesh>(null)

  // Handle pointer move - exact match to example
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      screenCoordsRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      screenCoordsRef.current.y = -(event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  // Get intersect function - exact match to example
  const getIntersect = () => {
    if (!dragPlaneRef.current) return null
    raycaster.setFromCamera(screenCoordsRef.current, camera)
    const intersects = raycaster.intersectObject(dragPlaneRef.current)
    if (intersects.length) return intersects[0]
    return null
  }

  // Update drag state - exact match to example
  useFrame(() => {
    const intersect = getIntersect()

    if (intersect) {
      setDragState(prev => {
        if (!prev.down) {
          gl.domElement.style.cursor = 'grab'
        }
        return { ...prev, hover: true }
      })

      if (dragState.down && dragState.hover) {
        worldCoordsRef.current.copy(intersect.point)
        const delta = prevWorldCoordsRef.current.clone().sub(worldCoordsRef.current)
        
        // Update terrain offset using the exposed function
        const setOffset = (window as any).__setTerrainOffset
        if (setOffset && typeof setOffset === 'function') {
          const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
          if (terrainMesh?.material instanceof THREE.ShaderMaterial) {
            const offsetUniform = terrainMesh.material.uniforms.offset
            if (offsetUniform) {
              // Update the offset ref through the exposed function
              setOffset(
                offsetUniform.value.x + delta.x,
                offsetUniform.value.y + delta.z
              )
            }
          }
        }
      }

      prevWorldCoordsRef.current.copy(worldCoordsRef.current)
    } else {
      if (!dragState.down) {
        setDragState(prev => ({ ...prev, hover: false }))
        gl.domElement.style.cursor = 'default'
      }
    }
  })

  // Handle pointer events - exact match to example
  useEffect(() => {
    const handlePointerDown = () => {
      if (dragState.hover) {
        gl.domElement.style.cursor = 'grabbing'
        setControlsEnabled(false) // Disable OrbitControls
        setDragState(prev => ({ ...prev, down: true }))
        
        // Scale up drag plane like example
        if (dragPlaneRef.current) {
          dragPlaneRef.current.scale.setScalar(10)
        }

        const intersect = getIntersect()
        if (intersect) {
          prevWorldCoordsRef.current.copy(intersect.point)
          worldCoordsRef.current.copy(intersect.point)
        }
      }
    }

    const handlePointerUp = () => {
      setDragState(prev => ({ ...prev, down: false }))
      setControlsEnabled(true) // Re-enable OrbitControls
      if (dragPlaneRef.current) {
        dragPlaneRef.current.scale.setScalar(1)
      }
    }

    gl.domElement.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      gl.domElement.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState.hover, gl, camera, raycaster])

  return (
    <mesh
      ref={dragPlaneRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <planeGeometry args={[10, 10, 1, 1]} /> {/* Exact match to example */}
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export default function TestTilesPage() {
  const [controlsEnabled, setControlsEnabled] = useState(true)

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{
          position: [-10, 8, -2.2], // Exact match to example
          fov: 35, // Exact match to example
          near: 0.1, // Exact match to example
          far: 100 // Exact match to example
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        shadows
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true
          // Set background color like example
          scene.background = new THREE.Color(0x201919)
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting - exact match to example */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[6.25, 3, 4]} // Exact match to example
            intensity={2} // Exact match to example
            castShadow={true}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={30} // Exact match to example
            shadow-camera-top={8} // Exact match to example
            shadow-camera-right={8} // Exact match to example
            shadow-camera-bottom={-8} // Exact match to example
            shadow-camera-left={-8} // Exact match to example
            shadow-normalBias={0.05}
            shadow-bias={0}
          />

          {/* Procedural terrain with shader-based displacement - scaled to match example */}
          <ProceduralTerrainShader 
            heightmapUrl="/assets/terrain/punta-arenas-cabonegro-heightmap.png"
            heightScale={10} // Scaled down to match example's strength (10)
            segments={500} // Exact match to example
            terrainSize={10} // Exact match to example (10x10 units)
            roughness={0.5} // Exact match to example
            metalness={0.0} // Exact match to example
          />

          {/* Drag controls for panning terrain */}
          <TerrainDragControls setControlsEnabled={setControlsEnabled} />

          {/* Orbit controls - exact match to example */}
          <OrbitControls
            enabled={controlsEnabled}
            maxPolarAngle={Math.PI * 0.45} // Exact match
            target={[0, -0.5, 0]} // Exact match (target.y = -0.5)
            enableDamping={true} // Exact match
            minDistance={0.1} // Exact match
            maxDistance={50} // Exact match
          />
        </Suspense>
      </Canvas>

      {/* Debug info */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded text-sm font-mono z-10">
        <h2 className="font-bold mb-2">Procedural Terrain Shader</h2>
        <p>• Shader-based displacement using real heightmap data</p>
        <p>• Satellite texture overlay for realistic colors</p>
        <p>• 500×500 segments for smooth terrain detail</p>
        <p>• Drag to pan terrain (click and drag on terrain)</p>
        <p>• Mouse to orbit camera (OrbitControls)</p>
        <p className="mt-2 text-yellow-400">Based on Three.js Journey procedural terrain example</p>
        <p className="mt-1 text-xs text-gray-400">Adapted for WebGL with real geographic data</p>
      </div>
    </div>
  )
}
