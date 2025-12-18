'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLngToWorld } from '@/lib/terrain/coordinates'

interface LaserMarkerProps {
  lat: number
  lng: number
  height?: number
  color?: string
  pulseSpeed?: number
}

/**
 * Vertical laser marker component
 * Renders a glowing vertical beam at specified lat/lng coordinates
 */
export default function LaserMarker({
  lat,
  lng,
  height = 5000, // 5km height for visibility
  color = '#00ff00', // Bright green laser
  pulseSpeed = 2
}: LaserMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const timeRef = useRef(0)
  
  // Store material ref
  useEffect(() => {
    if (meshRef.current?.material) {
      materialRef.current = meshRef.current.material as THREE.ShaderMaterial
    }
  }, [])

  // Convert lat/lng to world coordinates
  const [x, , z] = latLngToWorld(lat, lng)
  
  // Get terrain height at this position (will be updated via raycast)
  const [terrainHeight, setTerrainHeight] = useState(0)

  // Raycast to get terrain height
  useEffect(() => {
    const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
    if (!terrainMesh) return

    const raycaster = new THREE.Raycaster()
    raycaster.set(
      new THREE.Vector3(x, 1000, z), // Start high above
      new THREE.Vector3(0, -1, 0)   // Cast downward
    )

    const intersects = raycaster.intersectObject(terrainMesh, false)
    if (intersects.length > 0) {
      setTerrainHeight(intersects[0].point.y)
    }
  }, [x, z])

  // Create laser beam geometry (vertical cylinder)
  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(2, 2, height, 8) // Thin cylinder, 8 segments
  }, [height])

  // Create glowing shader material for laser effect
  const material = useMemo(() => {
    const laserColor = new THREE.Color(color)
    const halfHeight = height / 2
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: laserColor },
        pulseSpeed: { value: pulseSpeed },
        height: { value: height },
        halfHeight: { value: halfHeight },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float pulseSpeed;
        uniform float height;
        uniform float halfHeight;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Create pulsing effect
          float pulse = sin(time * pulseSpeed) * 0.3 + 0.7;
          
          // Create glow effect (brighter at center, dimmer at edges)
          float dist = length(vPosition.xz);
          float glow = 1.0 - smoothstep(0.0, 2.0, dist);
          
          // Add vertical gradient (brighter at bottom, dimmer at top)
          float verticalGradient = 1.0 - (vPosition.y + halfHeight) / height;
          
          vec3 finalColor = color * pulse * glow * (0.5 + verticalGradient * 0.5);
          float alpha = glow * pulse * 0.8;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [color, height, pulseSpeed])

  // Animate pulse
  useFrame((state, delta) => {
    timeRef.current += delta
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = timeRef.current
    }
  })

  return (
    <group position={[x, terrainHeight + height / 2, z]}>
      <mesh
        ref={(ref) => {
          meshRef.current = ref
          if (ref?.material) {
            materialRef.current = ref.material as THREE.ShaderMaterial
          }
        }}
        geometry={geometry}
        material={material}
        renderOrder={100} // Render on top
      />
      {/* Add a bright point at the base */}
      <mesh position={[0, -height / 2, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  )
}

