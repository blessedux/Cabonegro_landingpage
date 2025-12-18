'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'

interface WaterProps {
  size?: number
  segments?: number
  waveAmplitude?: number
  waveSpeed?: number
  heightScale?: number // Match terrain heightScale for sea level calculation
}

export default function Water({
  size = TERRAIN_SIZE,
  segments = 32, // Reduced for low-poly aesthetic
  waveAmplitude = 1.5, // Slightly reduced for stylized look
  waveSpeed = 0.5,
  heightScale = 1500 // Match terrain heightScale
}: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Create low-poly water geometry - fewer segments for faceted look
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size * 1.1, size * 1.1, segments, segments)
    // Rotate to lay flat on XZ plane (facing up)
    geo.rotateX(-Math.PI / 2)
    // Compute flat normals for low-poly faceted appearance
    geo.computeVertexNormals()
    return geo
  }, [size, segments])

  // Create animated shader material with realistic ocean movement
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waveAmplitude: { value: waveAmplitude },
        waveSpeed: { value: waveSpeed },
        waterColor: { value: new THREE.Color(0x0066cc) }, // Bright blue for ocean - very visible
        shallowColor: { value: new THREE.Color(0x3399ff) }, // Light blue for shallow water - very visible
        foamColor: { value: new THREE.Color(0xffffff) }, // White foam on wave peaks
      },
      vertexShader: `
        uniform float time;
        uniform float waveAmplitude;
        uniform float waveSpeed;
        
        varying vec3 vPosition;
        varying float vElevation;
        varying vec3 vNormal;
        varying float vFoam;
        
        void main() {
          vPosition = position;
          
          // Create realistic ocean wave pattern using multiple sine waves
          // Large waves (primary ocean movement)
          float wave1 = sin(position.x * 0.08 + time * waveSpeed) * waveAmplitude;
          float wave2 = sin(position.z * 0.12 + time * waveSpeed * 1.2) * waveAmplitude * 0.8;
          
          // Medium waves (secondary movement)
          float wave3 = sin((position.x + position.z) * 0.15 + time * waveSpeed * 0.9) * waveAmplitude * 0.6;
          float wave4 = sin((position.x - position.z) * 0.1 + time * waveSpeed * 1.1) * waveAmplitude * 0.5;
          
          // Small ripples (surface detail)
          float ripple1 = sin(position.x * 0.3 + time * waveSpeed * 2.0) * waveAmplitude * 0.2;
          float ripple2 = sin(position.z * 0.25 + time * waveSpeed * 1.8) * waveAmplitude * 0.15;
          
          // Combine all waves for realistic ocean movement
          float elevation = wave1 + wave2 + wave3 + wave4 + ripple1 + ripple2;
          vElevation = elevation;
          
          // Calculate foam intensity (foam appears on wave peaks)
          vFoam = smoothstep(0.3, 1.0, (elevation + waveAmplitude) / (waveAmplitude * 2.0));
          
          // Calculate normal for lighting (affects wave appearance)
          float dx = cos(position.x * 0.08 + time * waveSpeed) * 0.08 * waveAmplitude +
                     cos((position.x + position.z) * 0.15 + time * waveSpeed * 0.9) * 0.15 * waveAmplitude * 0.6;
          float dz = cos(position.z * 0.12 + time * waveSpeed * 1.2) * 0.12 * waveAmplitude * 0.8 +
                     cos((position.x - position.z) * 0.1 + time * waveSpeed * 1.1) * 0.1 * waveAmplitude * 0.5;
          
          vNormal = normalize(vec3(-dx, 1.0, -dz));
          
          vec3 newPosition = position;
          newPosition.y += elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform vec3 shallowColor;
        uniform vec3 foamColor;
        uniform float time;
        
        varying vec3 vPosition;
        varying float vElevation;
        varying vec3 vNormal;
        varying float vFoam;
        
        void main() {
          // Base color - make water BRIGHT BLUE and very distinct from green terrain
          vec3 baseColor = waterColor;
          
          // Mix with shallow color based on elevation (wave peaks are lighter)
          float mixFactor = (vElevation + 2.0) / 4.0;
          mixFactor = clamp(mixFactor, 0.0, 1.0);
          baseColor = mix(waterColor, shallowColor, mixFactor * 0.5); // Keep it mostly blue
          
          // Add foam on wave peaks (white foam effect)
          vec3 color = mix(baseColor, foamColor, vFoam * 0.4);
          
          // Add bright specular highlights for realistic water reflection
          float specular = pow(max(dot(vNormal, normalize(vec3(0.5, 1.0, 0.3))), 0.0), 32.0);
          color += vec3(specular * 0.3);
          
          // Add depth variation (darker in troughs, lighter on peaks)
          float depthVariation = sin(vPosition.x * 0.1 + vPosition.z * 0.1 + time * 0.5) * 0.15;
          color += vec3(depthVariation);
          
          // Make water BRIGHT and very visible - ensure it's clearly blue
          color = clamp(color, vec3(0.1, 0.3, 0.6), vec3(0.4, 0.7, 1.0)); // Force blue range
          
          // Make water fully opaque
          float alpha = 1.0;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: false, // Fully opaque for maximum visibility
      opacity: 1.0,
      side: THREE.FrontSide, // Only render top side (visible from above)
      depthWrite: true,
      depthTest: true,
      // Note: ShaderMaterial doesn't support flatShading - flat normals are handled in geometry
    })
  }, [waveAmplitude, waveSpeed])

  // Animate water with smooth, continuous movement
  useFrame((state, delta) => {
    if (meshRef.current && material && material.uniforms && material.uniforms.time) {
      // Smooth time progression for fluid animation
      timeRef.current += delta * waveSpeed * 0.5
      material.uniforms.time.value = timeRef.current
      
      // Update wave amplitude dynamically for more realistic movement
      if (material.uniforms.waveAmplitude) {
        // Slight variation in wave amplitude for natural ocean movement
        const amplitudeVariation = Math.sin(timeRef.current * 0.1) * 0.1
        material.uniforms.waveAmplitude.value = waveAmplitude + amplitudeVariation
      }
    }
  })

  // Calculate sea level offset to match terrain
  // Position water slightly above terrain's sea level to ensure it's visible
  // Terrain uses seaLevelThreshold = 0.25, so sea level is at -0.25 * heightScale
  const seaLevelThreshold = 0.25
  const seaLevelY = -seaLevelThreshold * heightScale + 5 // Add 5 units above to ensure visibility
  
  // Always render water (geometry and material are created in useMemo, so they're always available)
  // Position water at sea level to show coastline where terrain is above/below
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, seaLevelY, 0]} // Water slightly above sea level for visibility
      visible={true} // Ensure water is always visible
      receiveShadow={true}
      castShadow={false}
      frustumCulled={true}
      renderOrder={2} // Render after terrain to ensure visibility
    />
  )
}
