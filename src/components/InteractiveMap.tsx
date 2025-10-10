'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

interface InteractiveMapProps {
  className?: string;
  showControls?: boolean;
  showInfo?: boolean;
  isExploreMode?: boolean;
  onExploreModeChange?: (isExplore: boolean) => void;
}

export default function InteractiveMap({ 
  className = '', 
  showControls = true, 
  showInfo = false,
  isExploreMode = false,
  onExploreModeChange
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Punta Arenas coordinates
  const LAT = -52.847785;
  const LNG = -70.192089;

  useEffect(() => {
    // Initialize Three.js directly without Leaflet map
    initThreeJS();

    // Add ESC key listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExploreMode && onExploreModeChange) {
        onExploreModeChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExploreMode, onExploreModeChange]);

  // Update controls when explore mode changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isExploreMode;
    }
  }, [isExploreMode]);

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
  };

  // Leaflet map removed - using pure Three.js scene

  const initThreeJS = () => {
    if (!mapRef.current) return;

    // Create Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    sceneRef.current = scene;

    // Camera with proper 3D perspective - adjusted for wider view
    const camera = new THREE.PerspectiveCamera(
      60,
      mapRef.current.clientWidth / mapRef.current.clientHeight,
      0.1,
      3000
    );
    camera.position.set(0, 150, 200); // Higher and further back for wider view
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
    });
    renderer.setSize(mapRef.current.clientWidth, mapRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Position the Three.js canvas as background
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1'; // Negative z-index to ensure it stays behind everything
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // Make sure the container has relative positioning and stays behind
    mapRef.current.style.position = 'relative';
    mapRef.current.style.zIndex = '-1';
    mapRef.current.appendChild(canvas);

    // Add orbital controls for 3D navigation - adjusted for wider view
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    controls.minDistance = 80; // Increased minimum distance
    controls.maxDistance = 800; // Increased maximum distance for wider view
    controls.enabled = isExploreMode; // Disabled by default, enabled in explore mode
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Create 3D terrain representation
    create3DTerrain();

    // Initialize visual mesh system
    initVisualMeshSystem();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Animate objects
      animateObjects();
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mapRef.current || !camera || !renderer) return;
      
      camera.aspect = mapRef.current.clientWidth / mapRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mapRef.current.clientWidth, mapRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
  };

  const create3DTerrain = () => {
    if (!sceneRef.current) return;

    // Create realistic terrain based on Punta Arenas area
    createRealisticTerrain();
    createCaboNegroIndustrialPark();
    createCoastalFeatures();
    createRoadsAndInfrastructure();
  };

  const createRealisticTerrain = () => {
    if (!sceneRef.current) return;

    // Create terrain based on real Punta Arenas geography
    // Punta Arenas is relatively flat with some rolling hills
    const terrainSize = 400; // Doubled the size for wider view
    const segments = 128; // Higher resolution for better detail
    
    // Create plane geometry with more segments for displacement
    const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    
    // Get vertices for displacement
    const vertices = terrainGeometry.attributes.position.array;
    
    // Apply realistic elevation based on Punta Arenas terrain
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Create realistic terrain variation
      // Punta Arenas area has gentle rolling hills and flat areas
      let elevation = 0;
      
      // Add some gentle hills (Punta Arenas area has rolling terrain)
      elevation += Math.sin(x * 0.02) * Math.cos(z * 0.02) * 8;
      elevation += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
      elevation += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
      
      // Add some noise for natural variation
      elevation += (Math.random() - 0.5) * 3;
      
      // Ensure minimum elevation (sea level is around 0)
      elevation = Math.max(elevation, 0);
      
      vertices[i + 2] = elevation;
    }
    
    // Update geometry
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();
    
    // Create realistic material with multiple textures
    const terrainMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8FBC8F, // Dark sea green (Patagonian steppe color)
      transparent: true,
      opacity: 0.9
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    terrain.userData = { type: 'realistic-terrain' };
    sceneRef.current.add(terrain);
  };

  const createCaboNegroIndustrialPark = () => {
    if (!sceneRef.current) return;

    // Create the actual Cabo Negro Industrial Park
    // Based on real location: Ruta 9, KM. 28 Punta Arenas
    
    // Main industrial buildings
    const buildings = [
      { x: -20, z: -30, width: 25, height: 15, depth: 20, color: 0x2C3E50, name: 'Main Facility' },
      { x: 15, z: -25, width: 20, height: 12, depth: 18, color: 0x34495E, name: 'Storage Building' },
      { x: -10, z: 20, width: 18, height: 10, depth: 15, color: 0x2C3E50, name: 'Office Complex' },
      { x: 25, z: 15, width: 22, height: 14, depth: 16, color: 0x34495E, name: 'Processing Plant' },
      { x: -30, z: 0, width: 16, height: 8, depth: 12, color: 0x2C3E50, name: 'Maintenance Building' },
    ];

    buildings.forEach((building, index) => {
      const buildingGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: building.color,
        metalness: 0.3,
        roughness: 0.4
      });
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      buildingMesh.position.set(building.x, building.height / 2, building.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      buildingMesh.userData = { type: 'industrial-building', name: building.name, index };
      if (sceneRef.current) {
        sceneRef.current.add(buildingMesh);
      }
    });

    // Add storage tanks (typical for industrial parks)
    for (let i = 0; i < 8; i++) {
      const tankGeometry = new THREE.CylinderGeometry(3, 3, 12);
      const tankMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x34495E,
        metalness: 0.8,
        roughness: 0.2
      });
      const tank = new THREE.Mesh(tankGeometry, tankMaterial);
      
      tank.position.set(
        (Math.random() - 0.5) * 40 + 5,
        6,
        (Math.random() - 0.5) * 40 - 10
      );
      tank.castShadow = true;
      tank.receiveShadow = true;
      tank.userData = { type: 'storage-tank', index: i };
      sceneRef.current.add(tank);
    }

    // Add wind turbines (green energy - common in Patagonia)
    for (let i = 0; i < 6; i++) {
      const turbineGroup = new THREE.Group();
      
      // Tower
      const towerGeometry = new THREE.CylinderGeometry(1, 1.5, 45);
      const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.y = 22.5;
      tower.castShadow = true;
      turbineGroup.add(tower);
      
      // Blades
      const bladeGeometry = new THREE.BoxGeometry(0.3, 20, 2);
      const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      for (let j = 0; j < 3; j++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 45;
        blade.rotation.z = (j * Math.PI * 2) / 3;
        blade.castShadow = true;
        blade.userData = { type: 'turbine-blade', index: j };
        turbineGroup.add(blade);
      }
      
      turbineGroup.position.set(
        (Math.random() - 0.5) * 60 + 10,
        0,
        (Math.random() - 0.5) * 60 - 20
      );
      turbineGroup.userData = { type: 'wind-turbine', index: i };
      sceneRef.current.add(turbineGroup);
    }
  };

  const createCoastalFeatures = () => {
    if (!sceneRef.current) return;

    // Punta Arenas is on the Strait of Magellan
    // Add some coastal features
    
    // Create water plane (Strait of Magellan) - much larger now
    const waterGeometry = new THREE.PlaneGeometry(600, 200);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4682B4, // Steel blue
      transparent: true,
      opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.5, -150); // Position further south to show more ocean
    water.userData = { type: 'water' };
    sceneRef.current.add(water);

    // Add additional water areas to show more of the strait
    const water2Geometry = new THREE.PlaneGeometry(400, 150);
    const water2 = new THREE.Mesh(water2Geometry, waterMaterial);
    water2.rotation.x = -Math.PI / 2;
    water2.position.set(-100, -0.5, -100); // West side
    water2.userData = { type: 'water-west' };
    sceneRef.current.add(water2);

    const water3Geometry = new THREE.PlaneGeometry(400, 150);
    const water3 = new THREE.Mesh(water3Geometry, waterMaterial);
    water3.rotation.x = -Math.PI / 2;
    water3.position.set(100, -0.5, -100); // East side
    water3.userData = { type: 'water-east' };
    sceneRef.current.add(water3);

    // Add some coastal vegetation (Patagonian steppe) - expanded area
    for (let i = 0; i < 60; i++) {
      const vegetationGroup = new THREE.Group();
      
      // Small shrubs typical of Patagonian steppe
      const shrubGeometry = new THREE.SphereGeometry(1.5, 6, 4);
      const shrubMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F }); // Dark olive green
      const shrub = new THREE.Mesh(shrubGeometry, shrubMaterial);
      shrub.position.y = 1.5;
      shrub.castShadow = true;
      vegetationGroup.add(shrub);
      
      vegetationGroup.position.set(
        (Math.random() - 0.5) * 350, // Expanded area
        0,
        (Math.random() - 0.5) * 350
      );
      vegetationGroup.userData = { type: 'patagonian-vegetation', index: i };
      sceneRef.current.add(vegetationGroup);
    }

    // Add some coastal rocks and cliffs
    for (let i = 0; i < 15; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(2 + Math.random() * 3);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      rock.position.set(
        (Math.random() - 0.5) * 200,
        1 + Math.random() * 2,
        -120 + Math.random() * 40 // Near the coast
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      rock.userData = { type: 'coastal-rock', index: i };
      sceneRef.current.add(rock);
    }
  };

  const createRoadsAndInfrastructure = () => {
    if (!sceneRef.current) return;

    // Create Ruta 9 (main road to Punta Arenas) - extended
    const roadGeometry = new THREE.PlaneGeometry(400, 4);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.1, 0);
    road.userData = { type: 'ruta-9' };
    sceneRef.current.add(road);

    // Add road markings - extended
    const markingGeometry = new THREE.PlaneGeometry(400, 0.3);
    const markingMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const marking = new THREE.Mesh(markingGeometry, markingMaterial);
    marking.rotation.x = -Math.PI / 2;
    marking.position.set(0, 0.11, 0);
    marking.userData = { type: 'road-marking' };
    sceneRef.current.add(marking);

    // Add secondary roads
    const secondaryRoadGeometry = new THREE.PlaneGeometry(4, 150);
    const secondaryRoad = new THREE.Mesh(secondaryRoadGeometry, roadMaterial);
    secondaryRoad.rotation.x = -Math.PI / 2;
    secondaryRoad.position.set(50, 0.1, 0);
    secondaryRoad.userData = { type: 'secondary-road' };
    sceneRef.current.add(secondaryRoad);

    const secondaryRoad2 = new THREE.Mesh(secondaryRoadGeometry, roadMaterial);
    secondaryRoad2.rotation.x = -Math.PI / 2;
    secondaryRoad2.position.set(-50, 0.1, 0);
    secondaryRoad2.userData = { type: 'secondary-road' };
    sceneRef.current.add(secondaryRoad2);
  };

  const initVisualMeshSystem = () => {
    if (!sceneRef.current) return;

    // Create a visual mesh system for location visualization
    createLocationVisualization();
    
    // No map click handler needed - pure 3D scene
  };

  const createLocationVisualization = () => {
    if (!sceneRef.current) return;

    // Create a subtle grid overlay to show the area
    const gridSize = 100;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
    gridHelper.position.y = 0.1; // Slightly above ground
    gridHelper.userData = { type: 'grid' };
    sceneRef.current.add(gridHelper);

    // Create a selection area indicator (initially hidden)
    const selectionGeometry = new THREE.RingGeometry(5, 8, 16);
    const selectionMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6a00,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const selectionRing = new THREE.Mesh(selectionGeometry, selectionMaterial);
    selectionRing.position.y = 0.2;
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.visible = false; // Hidden until location is selected
    selectionRing.userData = { type: 'selection-ring' };
    sceneRef.current.add(selectionRing);

    // Create a location marker (invisible until needed)
    const markerGeometry = new THREE.ConeGeometry(2, 15, 8);
    const markerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6a00,
      metalness: 0.3,
      roughness: 0.4
    });
    const locationMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    locationMarker.position.y = 7.5;
    locationMarker.visible = false; // Hidden until location is selected
    locationMarker.userData = { type: 'location-marker' };
    sceneRef.current.add(locationMarker);
  };

  // Map click handlers removed - using pure 3D scene

  const animateObjects = () => {
    if (!sceneRef.current) return;

    sceneRef.current.traverse((child) => {
      if (child.userData.type === 'selection-ring') {
        // Rotate the selection ring
        child.rotation.y += 0.01;
      } else if (child.userData.type === 'location-marker') {
        // Subtle rotation of the location marker
        child.rotation.y += 0.005;
      } else if (child.userData.type === 'turbine-blade') {
        // Animate wind turbine blades
        child.rotation.x += 0.05;
      } else if (child.userData.type === 'water' || child.userData.type === 'water-west' || child.userData.type === 'water-east') {
        // Subtle water animation for all water areas
        child.rotation.z = Math.sin(Date.now() * 0.001) * 0.01;
      }
    });
  };

  return (
    <div className={`relative ${className}`} style={{ zIndex: -1 }}>
      <div 
        ref={mapRef} 
        className="w-full h-full relative"
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          zIndex: -1
        }}
      />
      
      {showInfo && (
        <>
          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm font-mono">
            🏭 Cabo Negro Industrial Park
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm font-mono">
            <div>Lat: {LAT}</div>
            <div>Lng: {LNG}</div>
            <div className="text-xs mt-1">Cabo Negro Industrial Park</div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm">
            <div>🖱️ Mouse: Orbit around expanded area</div>
            <div>🌊 Extended view: More of Strait of Magellan</div>
            <div>🏭 Industrial park + surrounding terrain</div>
          </div>
        </>
      )}
    </div>
  );
}
