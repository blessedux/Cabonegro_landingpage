'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeJSAlternativesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<'standalone' | 'leaflet' | 'coordinate'>('standalone');

  // Punta Arenas coordinates
  const LAT = -52.847785;
  const LNG = -70.192089;

  useEffect(() => {
    if (selectedDemo === 'standalone') {
      initStandaloneThreeJS();
    } else if (selectedDemo === 'coordinate') {
      initCoordinateSystem();
    }

    return () => {
      cleanup();
    };
  }, [selectedDemo]);

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  const initStandaloneThreeJS = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane (representing the terrain)
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Industrial buildings (representing Cabo Negro)
    const buildings = [];
    for (let i = 0; i < 10; i++) {
      const buildingGeometry = new THREE.BoxGeometry(
        Math.random() * 20 + 10,
        Math.random() * 30 + 20,
        Math.random() * 20 + 10
      );
      const buildingMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.3, 0.4 + Math.random() * 0.3)
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      building.position.set(
        (Math.random() - 0.5) * 150,
        building.geometry.parameters.height / 2,
        (Math.random() - 0.5) * 150
      );
      building.castShadow = true;
      building.receiveShadow = true;
      
      buildings.push(building);
      scene.add(building);
    }

    // Animated cube (our main object)
    const cubeGeometry = new THREE.BoxGeometry(15, 15, 15);
    const cubeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6a00,
      metalness: 0.3,
      roughness: 0.4
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 7.5, 0);
    cube.castShadow = true;
    scene.add(cube);

    // Wind turbines (representing green energy)
    for (let i = 0; i < 5; i++) {
      const turbineGroup = new THREE.Group();
      
      // Tower
      const towerGeometry = new THREE.CylinderGeometry(1, 1.5, 40);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.y = 20;
      tower.castShadow = true;
      turbineGroup.add(tower);
      
      // Blades
      const bladeGeometry = new THREE.BoxGeometry(0.2, 20, 2);
      const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      
      for (let j = 0; j < 3; j++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 40;
        blade.rotation.z = (j * Math.PI * 2) / 3;
        blade.castShadow = true;
        turbineGroup.add(blade);
      }
      
      turbineGroup.position.set(
        (Math.random() - 0.5) * 100,
        0,
        (Math.random() - 0.5) * 100
      );
      scene.add(turbineGroup);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Rotate the main cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      // Rotate wind turbine blades
      scene.traverse((child) => {
        if (child instanceof THREE.Group && child.children.length > 1) {
          child.children.forEach((blade, index) => {
            if (index > 0) { // Skip the tower
              blade.rotation.x += 0.05;
            }
          });
        }
      });
      
      // Orbit camera around the scene
      const time = Date.now() * 0.0005;
      camera.position.x = Math.cos(time) * 100;
      camera.position.z = Math.sin(time) * 100;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
  };

  const initCoordinateSystem = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Coordinate system visualization
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Latitude/Longitude representation
    const latLngText = new THREE.Group();
    
    // Create text representation (simplified with basic shapes)
    const latMarker = new THREE.Mesh(
      new THREE.SphereGeometry(2),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    latMarker.position.set(0, 0, 0);
    latLngText.add(latMarker);

    const lngMarker = new THREE.Mesh(
      new THREE.SphereGeometry(2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    lngMarker.position.set(20, 0, 0);
    latLngText.add(lngMarker);

    scene.add(latLngText);

    // Floating objects representing the industrial park
    const objects = [];
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.BoxGeometry(
        Math.random() * 5 + 2,
        Math.random() * 10 + 5,
        Math.random() * 5 + 2
      );
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 80
      );
      
      objects.push(mesh);
      scene.add(mesh);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Rotate all objects
      objects.forEach((obj, index) => {
        obj.rotation.x += 0.01 * (index % 3 + 1);
        obj.rotation.y += 0.01 * (index % 2 + 1);
        obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.1;
      });
      
      // Rotate camera around the scene
      const time = Date.now() * 0.0003;
      camera.position.x = Math.cos(time) * 80;
      camera.position.z = Math.sin(time) * 80;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Three.js Alternatives (No API Key Required)
            </h1>
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Main Site
            </a>
          </div>
        </div>
      </div>

      {/* Demo Selector */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedDemo('standalone')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'standalone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-100'
              }`}
            >
              🏭 Industrial Park Scene
            </button>
            <button
              onClick={() => setSelectedDemo('coordinate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'coordinate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-100'
              }`}
            >
              📍 Coordinate System
            </button>
            <a
              href="/leaflet-threejs"
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-blue-600 hover:bg-blue-100"
            >
              🗺️ Leaflet + Three.js
            </a>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-yellow-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">💡</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                No API Key Required!
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  These demos use pure Three.js without any external map services. 
                  Perfect for prototyping and development before implementing with Google Maps.
                </p>
                <p className="mt-2">
                  <strong>Punta Arenas Coordinates:</strong> {LAT}, {LNG}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three.js Container */}
      <div className="relative">
        <div 
          ref={containerRef} 
          className="w-full"
          style={{ height: 'calc(100vh - 200px)' }}
        />
        
        {/* Controls Info */}
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm font-mono">
          {selectedDemo === 'standalone' && '🏭 Industrial Park Simulation'}
          {selectedDemo === 'coordinate' && '📍 3D Coordinate System'}
          {selectedDemo === 'leaflet' && '🗺️ Leaflet Integration (Coming Soon)'}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm">
          <div>Mouse: Orbit around scene</div>
          <div>Scroll: Zoom in/out</div>
        </div>
      </div>
    </div>
  );
}
