'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Declare Google Maps types for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface WebGLOverlayView {
  onAdd: () => void;
  onContextRestored: (context: { gl: WebGLRenderingContext }) => void;
  onDraw: (context: { gl: WebGLRenderingContext; transformer: any }) => void;
  onContextLost: () => void;
  onRemove: () => void;
  setMap: (map: any) => void;
  requestRedraw: () => void;
}

export default function WebGLTestPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<WebGLOverlayView | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const animationTimeRef = useRef(0);

  // Target location (Punta Arenas area)
  const LAT = -52.847785;
  const LNG = -70.192089;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    if (!apiKey || !mapId || apiKey === 'YOUR_API_KEY' || mapId === 'YOUR_MAP_ID') {
      console.error('Please set up your Google Maps API key and Map ID in .env.local');
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=maps`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeMap();
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Create the map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: LAT, lng: LNG },
      zoom: 17,
      heading: 20,
      tilt: 67.5,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
      disableDefaultUI: true,
    });

    // Create WebGL overlay
    const overlay = new window.google.maps.WebGLOverlayView();
    overlayRef.current = overlay;

    // Initialize Three.js scene
    overlay.onAdd = () => {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Lighting
      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
      hemi.position.set(0, 1, 0);
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(10, 10, 10);
      scene.add(dir);

      // Create a visible cube
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xff6a00, 
        metalness: 0.1, 
        roughness: 0.6 
      });
      const cube = new THREE.Mesh(geometry, material);
      cubeRef.current = cube;
      scene.add(cube);

      const camera = new THREE.PerspectiveCamera();
      cameraRef.current = camera;
    };

    // Use Maps' GL context
    overlay.onContextRestored = ({ gl }: { gl: WebGLRenderingContext }) => {
      const renderer = new THREE.WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        antialias: true,
        alpha: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      });
      
      renderer.autoClear = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      
      const MAX_DPR = 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
      
      rendererRef.current = renderer;
    };

    // Draw loop
    overlay.onDraw = ({ gl, transformer }: { gl: WebGLRenderingContext; transformer: any }) => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current) return;

      // Georeference the object
      const elevationMeters = 15;
      const matrix = transformer.fromLatLngAltitude({
        lat: LAT,
        lng: LNG,
        altitude: elevationMeters,
      });

      cameraRef.current.projectionMatrix.fromArray(matrix);

      // Animate the cube
      animationTimeRef.current += 0.01;
      cubeRef.current.rotation.y = animationTimeRef.current;
      cubeRef.current.rotation.x = animationTimeRef.current * 0.5;
      cubeRef.current.position.set(0, 0, 0);

      rendererRef.current.state.reset();
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      overlay.requestRedraw();
      gl.disable(gl.SCISSOR_TEST);
    };

    overlay.onContextLost = () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };

    overlay.onRemove = () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };

    overlay.setMap(map);

    // Handle window resize
    const handleResize = () => {
      if (!rendererRef.current) return;
      const MAX_DPR = 2;
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
      overlay.requestRedraw();
    };

    window.addEventListener('resize', handleResize);

    // Smooth camera animation
    map.addListener('tilesloaded', () => {
      map.moveCamera({ tilt: 67.5, heading: 30, zoom: 18 });
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              WebGL Google Maps Test
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

      {/* Instructions */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Setup Required
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  To use this test page, you need to:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a Google Maps API key in Google Cloud Console</li>
                  <li>Enable Maps JavaScript API (beta version)</li>
                  <li>Create a vector map style and get the Map ID</li>
                  <li>Update the <code className="bg-blue-100 px-1 rounded">.env.local</code> file with your API key and Map ID</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-screen"
          style={{ height: 'calc(100vh - 200px)' }}
        />
        
        {/* Debug Badge */}
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm font-mono">
          WebGL overlay running
        </div>

        {/* Coordinates Display */}
        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-55 text-white px-3 py-2 rounded-lg text-sm font-mono">
          <div>Lat: {LAT}</div>
          <div>Lng: {LNG}</div>
        </div>
      </div>
    </div>
  );
}
