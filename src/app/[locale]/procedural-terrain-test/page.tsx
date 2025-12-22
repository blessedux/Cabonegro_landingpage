'use client'

/**
 * Procedural Terrain Test Page
 * 
 * This page implements the Three.js WebGPU procedural terrain example.
 * 
 * Requirements:
 * - Three.js r150+ with WebGPU support
 * - TSL (Three.js Shading Language) support
 * - WebGPU-enabled browser (Chrome 113+, Edge 113+, Safari 16.4+)
 * 
 * Note: The full implementation requires specific Three.js builds with TSL.
 * You may need to install: npm install three@latest
 * Or use a CDN version that includes WebGPU and TSL support.
 */

import { useEffect, useRef } from 'react'

export default function ProceduralTerrainTestPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    // Load the procedural terrain implementation
    loadProceduralTerrain()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProceduralTerrain = async () => {
    if (!containerRef.current) return

    // Check for WebGPU support
    if (!navigator.gpu) {
      containerRef.current.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; background: #201919; font-family: monospace;">
          <div style="text-align: center;">
            <h1>WebGPU Not Supported</h1>
            <p>This demo requires WebGPU support.</p>
            <p>Please use Chrome 113+, Edge 113+, or Safari 16.4+</p>
          </div>
        </div>
      `
      return
    }

    // Create info overlay
    const infoDiv = document.createElement('div')
    infoDiv.id = 'info'
    infoDiv.innerHTML = `
      <div class="title-wrapper">
        <a href="https://threejs.org/" target="_blank" rel="noopener">three.js</a><span>Procedural Terrain</span>
      </div>
      <small>
        Based on <a href="https://threejs-journey.com/lessons/procedural-terrain-shader" target="_blank" rel="noopener">Three.js Journey</a> lessons.
      </small>
    `
    containerRef.current.appendChild(infoDiv)

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        overflow: hidden;
        font-family: 'Courier New', monospace;
      }

      #info {
        position: absolute;
        top: 0;
        width: 100%;
        padding: 10px;
        text-align: center;
        color: #fff;
        z-index: 100;
        pointer-events: none;
      }

      #info a {
        color: #fff;
        text-decoration: none;
      }

      #info a:hover {
        text-decoration: underline;
      }

      .title-wrapper {
        font-size: 18px;
        margin-bottom: 5px;
      }

      .title-wrapper a {
        font-weight: bold;
      }

      .title-wrapper span {
        margin-left: 10px;
        opacity: 0.7;
      }

      #info small {
        display: block;
        font-size: 12px;
        opacity: 0.7;
      }
    `
    document.head.appendChild(style)

    // Try to load Three.js modules
    try {
      // Dynamic import of Three.js
      // Note: This may need to be adjusted based on your Three.js version
      const THREE = await import('three')
      
      // Try to import WebGPU renderer and other modules
      // These may not be available in all Three.js versions
      let WebGPURenderer: any
      let OrbitControls: any
      let HDRLoader: any
      let Inspector: any
      
      try {
        // Try to import from three-stdlib or examples
        const controlsModule = await import('three/examples/jsm/controls/OrbitControls.js')
        OrbitControls = controlsModule.OrbitControls
        
        // Try to import GLTFLoader for terrain model
        try {
          const gltfModule = await import('three/examples/jsm/loaders/GLTFLoader.js')
          ;(THREE as any).GLTFLoader = gltfModule.GLTFLoader
        } catch (e) {
          console.warn('GLTFLoader not available')
        }
        
        // Try to import HDRLoader
        try {
          const hdrModule = await import('three/examples/jsm/loaders/HDRLoader.js')
          HDRLoader = hdrModule.HDRLoader
        } catch (e) {
          console.warn('HDRLoader not available')
        }
      } catch (error) {
        console.error('Failed to load Three.js modules:', error)
      }

      // Initialize the scene
      initScene(THREE, WebGPURenderer, OrbitControls, HDRLoader, Inspector)
    } catch (error) {
      console.error('Failed to initialize:', error)
      containerRef.current.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; background: #201919; font-family: monospace;">
          <div style="text-align: center;">
            <h1>Initialization Error</h1>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p>This demo requires Three.js with WebGPU and TSL support.</p>
          </div>
        </div>
      `
    }
  }

  const initScene = async (
    THREE: any,
    WebGPURenderer: any,
    OrbitControls: any,
    HDRLoader: any,
    Inspector: any
  ) => {
    if (!containerRef.current) return

    let renderer: any, controls: any, terrain: any

    // Camera - adjust position to see terrain better
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 50, 100)
    camera.lookAt(0, 0, 0)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb) // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 50, 500)

    // Lights - add multiple lights for better visibility
    const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
    directionalLight.position.set(6.25, 3, 4)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 30
    directionalLight.shadow.camera.top = 8
    directionalLight.shadow.camera.right = 8
    directionalLight.shadow.camera.bottom = -8
    directionalLight.shadow.camera.left = -8
    directionalLight.shadow.normalBias = 0.05
    directionalLight.shadow.bias = 0
    scene.add(directionalLight)

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    scene.add(ambientLight)

    // Add hemisphere light for natural lighting
    const hemisphereLight = new THREE.HemisphereLight('#ffffff', '#87ceeb', 0.6)
    scene.add(hemisphereLight)

    // Load GLB terrain model
    const GLTFLoader = (THREE as any).GLTFLoader
    if (!GLTFLoader) {
      console.error('GLTFLoader not available')
      return
    }

    const loader = new GLTFLoader()
    const terrainOffset = new THREE.Vector3(0, 0, 0) // For dragging/panning
    const terrainBounds = { minX: -200, maxX: 200, minZ: -200, maxZ: 200 } // Bounds for dragging
    
    // Initialize terrain as null, will be set when GLB loads
    terrain = null

    loader.load(
      '/assets/models/terrain-tiles.glb',
      (gltf: any) => {
        console.log('GLB terrain loaded:', gltf)
        
        // Get the terrain mesh from the GLB
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.receiveShadow = true
            child.castShadow = true
            
            // Ensure materials are properly set up
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material]
              materials.forEach((mat: any) => {
                if (mat.map) {
                  mat.map.colorSpace = THREE.SRGBColorSpace
                }
              })
            }
          }
        })

        // Create a group to hold the terrain for easy translation
        const terrainGroup = new THREE.Group()
        terrainGroup.add(gltf.scene)
        terrainGroup.position.copy(terrainOffset)
        
        // Calculate bounding box to center the terrain
        const box = new THREE.Box3().setFromObject(terrainGroup)
        const center = box.getCenter(new THREE.Vector3())
        terrainGroup.position.sub(center) // Center the terrain
        
        terrain = terrainGroup
        scene.add(terrain)
        
        // Update global reference
        if ((window as any).setTerrain) {
          ;(window as any).setTerrain(terrain)
        }

        // Update camera to look at terrain
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        camera.position.set(0, maxDim * 0.8, maxDim * 1.2)
        camera.lookAt(0, 0, 0)
        
        if (controls) {
          controls.target.set(0, 0, 0)
          controls.update()
        }
        
        // Update terrain bounds based on actual size
        const halfSize = maxDim / 2
        terrainBounds.minX = -halfSize
        terrainBounds.maxX = halfSize
        terrainBounds.minZ = -halfSize
        terrainBounds.maxZ = halfSize

        console.log('Terrain loaded and added to scene:', {
          size: size,
          center: center,
          position: terrain.position,
          bounds: terrainBounds
        })
      },
      (progress: any) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error: any) => {
        console.error('Error loading GLB terrain:', error)
        // Fallback: create a simple plane
        const geometry = new THREE.PlaneGeometry(100, 100, 10, 10)
        geometry.rotateX(-Math.PI * 0.5)
        const material = new THREE.MeshStandardMaterial({ color: '#85d534' })
        terrain = new THREE.Mesh(geometry, material)
        terrain.receiveShadow = true
        scene.add(terrain)
        
        // Update global reference
        if ((window as any).setTerrain) {
          ;(window as any).setTerrain(terrain)
        }
      }
    )

    // Water - position below terrain (optional, can be removed if causing issues)
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 1, 1),
      new THREE.MeshPhysicalMaterial({
        transmission: 1,
        roughness: 0.5,
        ior: 1.333,
        color: '#4db2ff',
        transparent: true,
        opacity: 0.6
      })
    )
    water.rotation.x = -Math.PI * 0.5
    water.position.y = -3 // Position water well below terrain
    water.receiveShadow = true
    scene.add(water)

    // Create a larger invisible plane for dragging (covers the terrain area)
    const dragObject = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400, 1, 1),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    dragObject.rotation.x = -Math.PI * 0.5
    dragObject.position.y = 0
    dragObject.visible = false
    scene.add(dragObject)

    // Drag setup - define all properties upfront
    const drag = {
      screenCoords: new THREE.Vector2(),
      prevWorldCoords: new THREE.Vector3(),
      worldCoords: new THREE.Vector3(),
      raycaster: new THREE.Raycaster(),
      down: false,
      hover: false,
      object: dragObject,
      getIntersect: () => {
        drag.raycaster.setFromCamera(drag.screenCoords, camera)
        const intersects = drag.raycaster.intersectObject(drag.object)
        if (intersects.length) return intersects[0]
        return null
      },
      update: () => {
        // Get terrain from global reference or local variable
        const currentTerrain = terrain || (window as any).terrain
        if (!currentTerrain) return
        
        const intersect = drag.getIntersect()
        if (intersect) {
          drag.hover = true
          if (!drag.down) {
            if (renderer.domElement) {
              renderer.domElement.style.cursor = 'grab'
            }
          }
        } else {
          drag.hover = false
          if (renderer.domElement) {
            renderer.domElement.style.cursor = 'default'
          }
        }

        // Pan terrain when dragging (translate instead of regenerating)
        if (drag.hover && drag.down && currentTerrain) {
          const delta = drag.prevWorldCoords.clone().sub(drag.worldCoords)
          
          // Apply panning to terrain position (invert delta for natural dragging)
          const panSpeed = 1.0 // Adjust this to control panning speed
          const newX = currentTerrain.position.x - delta.x * panSpeed
          const newZ = currentTerrain.position.z - delta.z * panSpeed
          
          // Clamp to bounds
          currentTerrain.position.x = Math.max(terrainBounds.minX, Math.min(terrainBounds.maxX, newX))
          currentTerrain.position.z = Math.max(terrainBounds.minZ, Math.min(terrainBounds.maxZ, newZ))
          
          // Update offset for reference
          terrainOffset.x = currentTerrain.position.x
          terrainOffset.z = currentTerrain.position.z
        }
      }
    }

    // Renderer - try WebGPU first, fallback to WebGL
    try {
      if (WebGPURenderer) {
        renderer = new WebGPURenderer({ antialias: true })
      } else {
        // Fallback to WebGL
        renderer = new THREE.WebGLRenderer({ antialias: true })
        console.warn('WebGPURenderer not available, using WebGLRenderer')
      }
    } catch (error) {
      console.warn('WebGPU renderer failed, using WebGL:', error)
      renderer = new THREE.WebGLRenderer({ antialias: true })
    }

    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    
    if (renderer.setAnimationLoop) {
      renderer.setAnimationLoop(animate)
    } else {
      // Fallback for WebGLRenderer
      const animateLoop = () => {
        animate()
        requestAnimationFrame(animateLoop)
      }
      animateLoop()
    }
    
    containerRef.current.appendChild(renderer.domElement)

    // Inspector (if available)
    if (Inspector) {
      try {
        renderer.inspector = new Inspector()
        containerRef.current.appendChild(renderer.inspector.domElement)
      } catch (error) {
        console.warn('Inspector not available:', error)
      }
    }

    // Controls
    if (OrbitControls) {
      controls = new OrbitControls(camera, renderer.domElement)
      controls.maxPolarAngle = Math.PI * 0.45
      controls.target.set(0, 0, 0) // Look at center
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.minDistance = 0.1
      controls.maxDistance = 50
      controls.update()
    }

    // Events
    const handlePointerMove = (event: PointerEvent) => {
      drag.screenCoords.x = (event.clientX / window.innerWidth - 0.5) * 2
      drag.screenCoords.y = -(event.clientY / window.innerHeight - 0.5) * 2
    }

    const handlePointerDown = () => {
      if (drag.hover) {
        if (renderer.domElement) {
          renderer.domElement.style.cursor = 'grabbing'
        }
        if (controls) controls.enabled = false
        drag.down = true
        drag.object.scale.setScalar(10)
        const intersect = drag.getIntersect()
        if (intersect) {
          drag.prevWorldCoords.copy(intersect.point)
          drag.worldCoords.copy(intersect.point)
        }
      }
    }

    // Store terrain reference globally for access (will be updated when GLB loads)
    ;(window as any).terrain = terrain
    ;(window as any).terrainOffset = terrainOffset
    ;(window as any).setTerrain = (t: any) => { terrain = t; (window as any).terrain = t }

    const handlePointerUp = () => {
      drag.down = false
      if (controls) controls.enabled = true
      drag.object.scale.setScalar(1)
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('resize', handleResize)

    function animate() {
      if (controls) controls.update()
      drag.update()
      
      // Ensure renderer and scene are valid
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }
    
    // Initial render
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }

    // Cleanup function
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('resize', handleResize)
      if (renderer.dispose) renderer.dispose()
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
