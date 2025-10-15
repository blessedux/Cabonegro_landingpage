'use client';

import { useEffect, useRef, useState } from 'react';

export default function SketchfabTestPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(0);
  const [totalAnnotations, setTotalAnnotations] = useState(0);
  const [controls, setControls] = useState<Record<string, boolean | number>>({
    annotations: true,
    autostart: true, // Enable autostart
    autospin: 0,
    camera: 0,
    ui_controls: 0, // Hide UI controls
    ui_infos: 0, // Hide UI infos
    ui_stop: 0, // Hide stop button
    ui_watermark: 0, // Hide watermark
    ui_hint: 0, // Hide hints
    ui_help: 0, // Hide help
    ui_settings: 0, // Hide settings
    ui_vr: 0, // Hide VR button
    ui_fullscreen: 0, // Hide fullscreen button
    ui_annotations: 0 // Hide annotation controls
  });

  const updateEmbedUrl = () => {
    const baseUrl = 'https://sketchfab.com/models/8b9d8c7bd5f94181bd034c5a6bc1c77a/embed';
    const params = new URLSearchParams();
    
    Object.entries(controls).forEach(([key, value]) => {
      if (value !== false && value !== 0) {
        params.append(key, value ? '1' : '0');
      }
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleControlChange = (key: string, value: any) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    if (iframeRef.current) {
      const embedUrl = updateEmbedUrl();
      console.log('🔄 Updating iframe with URL:', embedUrl);
      iframeRef.current.src = embedUrl;
    }
  }, [controls]);

  // Log state changes
  useEffect(() => {
    console.log('📊 State update - Current annotation:', currentAnnotation + 1, 'Total annotations:', totalAnnotations, 'Loaded:', isLoaded);
  }, [currentAnnotation, totalAnnotations, isLoaded]);

  // Poll for annotation changes (fallback method)
  useEffect(() => {
    if (!isLoaded) return;
    
    const pollForChanges = () => {
      if (iframeRef.current?.contentWindow) {
        // Try to get current annotation state
        iframeRef.current.contentWindow.postMessage({
          type: 'getCurrentAnnotation'
        }, 'https://sketchfab.com');
        
        // Try to get all annotations
        iframeRef.current.contentWindow.postMessage({
          type: 'getAnnotations'
        }, 'https://sketchfab.com');
      }
    };
    
    // Poll every 2 seconds
    const interval = setInterval(pollForChanges, 2000);
    
    return () => clearInterval(interval);
  }, [isLoaded]);

  // Handle scroll-based annotation navigation
  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (!isLoaded || totalAnnotations === 0) return;
      
      event.preventDefault();
      
      const scrollDirection = event.deltaY > 0 ? 1 : -1;
      const newAnnotation = Math.max(0, Math.min(totalAnnotations - 1, currentAnnotation + scrollDirection));
      
      console.log(`🖱️ Scroll event: deltaY=${event.deltaY}, direction=${scrollDirection > 0 ? 'down' : 'up'}, current=${currentAnnotation + 1}, new=${newAnnotation + 1}`);
      
      if (newAnnotation !== currentAnnotation) {
        setCurrentAnnotation(newAnnotation);
        navigateToAnnotation(newAnnotation);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLoaded || totalAnnotations === 0) return;
      
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const newAnnotation = Math.min(totalAnnotations - 1, currentAnnotation + 1);
        console.log(`⌨️ Keyboard event: ${event.key}, current=${currentAnnotation + 1}, new=${newAnnotation + 1}`);
        setCurrentAnnotation(newAnnotation);
        navigateToAnnotation(newAnnotation);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const newAnnotation = Math.max(0, currentAnnotation - 1);
        console.log(`⌨️ Keyboard event: ${event.key}, current=${currentAnnotation + 1}, new=${newAnnotation + 1}`);
        setCurrentAnnotation(newAnnotation);
        navigateToAnnotation(newAnnotation);
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoaded, currentAnnotation, totalAnnotations]);

  // Listen for Sketchfab API messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log all messages to see what's available
      console.log('📨 Message received from:', event.origin, 'Data:', event.data);
      
      if (event.origin !== 'https://sketchfab.com') return;
      
      const data = event.data;
      
      // Handle different types of Sketchfab messages
      if (data.type === 'sketchfab-viewer-ready') {
        console.log('🚀 Sketchfab viewer is ready!');
        // Try to get the API
        if (iframeRef.current?.contentWindow) {
          console.log('🔑 Requesting API access...');
          iframeRef.current.contentWindow.postMessage({
            type: 'getApi'
          }, 'https://sketchfab.com');
        }
      }
      
      if (data.type === 'api') {
        console.log('✅ API access granted!');
        // Now we can use the API to get annotations
        if (iframeRef.current?.contentWindow) {
          console.log('📋 Getting annotations via API...');
          iframeRef.current.contentWindow.postMessage({
            type: 'getAnnotations'
          }, 'https://sketchfab.com');
        }
      }
      
      if (data.type === 'annotations') {
        const annotationCount = data.annotations?.length || 0;
        console.log(`📝 Found ${annotationCount} annotations:`, data.annotations);
        setTotalAnnotations(annotationCount);
      }
      
      // Listen for annotation changes
      if (data.type === 'annotation-changed') {
        console.log('🎯 Annotation changed to:', data.annotation);
        setCurrentAnnotation(data.annotationIndex || 0);
      }
      
      // Listen for camera changes (which might indicate annotation changes)
      if (data.type === 'camera-changed') {
        console.log('📷 Camera changed:', data.camera);
      }
      
      // Try to detect annotation changes by looking for any relevant data
      if (data.annotationIndex !== undefined) {
        console.log('🎯 Detected annotation index:', data.annotationIndex);
        setCurrentAnnotation(data.annotationIndex);
      }
      
      if (data.currentAnnotation !== undefined) {
        console.log('🎯 Detected current annotation:', data.currentAnnotation);
        setCurrentAnnotation(data.currentAnnotation);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const navigateToAnnotation = (annotationIndex: number) => {
    console.log(`🎯 Navigating to annotation ${annotationIndex + 1} of ${totalAnnotations}`);
    
    if (iframeRef.current?.contentWindow) {
      // Try different API methods to navigate to annotation
      iframeRef.current.contentWindow.postMessage({
        type: 'navigateToAnnotation',
        annotationIndex: annotationIndex
      }, 'https://sketchfab.com');
      
      // Alternative method
      iframeRef.current.contentWindow.postMessage({
        type: 'setAnnotation',
        index: annotationIndex
      }, 'https://sketchfab.com');
      
      // Another alternative
      iframeRef.current.contentWindow.postMessage({
        type: 'goToAnnotation',
        annotation: annotationIndex
      }, 'https://sketchfab.com');
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Full Screen Sketchfab Embed */}
      <div 
        className="sketchfab-embed-wrapper w-full h-full"
      >
        <iframe
          ref={iframeRef}
          title="Windpark in the Valley (Test Scene)"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src={updateEmbedUrl()}
          className="w-full h-full"
          onLoad={() => {
            console.log('🎬 Sketchfab iframe loaded successfully!');
            setIsLoaded(true);
            
            // Try to inject a script to access the Sketchfab viewer directly
            setTimeout(() => {
              if (iframeRef.current?.contentWindow) {
                console.log('🔧 Attempting to inject annotation listener script...');
                try {
                  const script = `
                    console.log('🔍 Injected script running in Sketchfab iframe');
                    
                    // Try to find the Sketchfab viewer
                    const findViewer = () => {
                      // Look for common Sketchfab viewer objects
                      if (window.viewer) {
                        console.log('✅ Found window.viewer:', window.viewer);
                        return window.viewer;
                      }
                      if (window.SketchfabViewer) {
                        console.log('✅ Found window.SketchfabViewer:', window.SketchfabViewer);
                        return window.SketchfabViewer;
                      }
                      if (window.sketchfab) {
                        console.log('✅ Found window.sketchfab:', window.sketchfab);
                        return window.sketchfab;
                      }
                      return null;
                    };
                    
                    // Try to set up annotation listeners
                    const setupListeners = () => {
                      const viewer = findViewer();
                      if (viewer) {
                        console.log('🎯 Setting up annotation listeners on viewer');
                        
                        // Try different methods to listen for annotation changes
                        if (viewer.addEventListener) {
                          viewer.addEventListener('annotation-changed', (event) => {
                            console.log('🎯 Annotation changed event:', event);
                            window.parent.postMessage({
                              type: 'annotation-changed',
                              annotation: event.annotation,
                              annotationIndex: event.index
                            }, '*');
                          });
                        }
                        
                        if (viewer.on) {
                          viewer.on('annotation-changed', (data) => {
                            console.log('🎯 Annotation changed via on():', data);
                            window.parent.postMessage({
                              type: 'annotation-changed',
                              annotation: data,
                              annotationIndex: data.index
                            }, '*');
                          });
                        }
                        
                        // Try to get annotations
                        if (viewer.getAnnotations) {
                          const annotations = viewer.getAnnotations();
                          console.log('📝 Found annotations via getAnnotations():', annotations);
                          window.parent.postMessage({
                            type: 'annotations',
                            annotations: annotations
                          }, '*');
                        }
                      } else {
                        console.log('❌ No viewer found, retrying...');
                        setTimeout(setupListeners, 1000);
                      }
                    };
                    
                    // Start trying to set up listeners
                    setupListeners();
                  `;
                  
                  (iframeRef.current.contentWindow as any).eval(script);
                } catch (error) {
                  console.log('❌ Could not inject script:', error);
                }
              }
            }, 3000); // Wait 3 seconds for Sketchfab to fully load
          }}
        />
      </div>
    </div>
  );
}
