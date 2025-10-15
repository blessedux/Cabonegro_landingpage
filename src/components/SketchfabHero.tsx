'use client';

import { useEffect, useRef, useState } from 'react';

interface SketchfabHeroProps {
  className?: string;
  isExploreMode?: boolean;
  onExploreModeChange?: (isExplore: boolean) => void;
}

export default function SketchfabHero({ 
  className = '', 
  isExploreMode = false,
  onExploreModeChange
}: SketchfabHeroProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(0);
  const [totalAnnotations, setTotalAnnotations] = useState(0);

  // Sketchfab embed URL with clean UI settings
  const embedUrl = 'https://sketchfab.com/models/8b9d8c7bd5f94181bd034c5a6bc1c77a/embed?annotations_visible=1&autostart=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_hint=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0';

  useEffect(() => {
    // Add ESC key listener for explore mode
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExploreMode && onExploreModeChange) {
        onExploreModeChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExploreMode, onExploreModeChange]);

  // Handle scroll-based annotation navigation when in explore mode
  useEffect(() => {
    if (!isExploreMode || !isLoaded || totalAnnotations === 0) return;
    
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();
      
      const scrollDirection = event.deltaY > 0 ? 1 : -1;
      const newAnnotation = Math.max(0, Math.min(totalAnnotations - 1, currentAnnotation + scrollDirection));
      
      if (newAnnotation !== currentAnnotation) {
        setCurrentAnnotation(newAnnotation);
        navigateToAnnotation(newAnnotation);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const newAnnotation = Math.min(totalAnnotations - 1, currentAnnotation + 1);
        setCurrentAnnotation(newAnnotation);
        navigateToAnnotation(newAnnotation);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const newAnnotation = Math.max(0, currentAnnotation - 1);
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
  }, [isExploreMode, isLoaded, currentAnnotation, totalAnnotations]);

  // Listen for Sketchfab API messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://sketchfab.com') return;
      
      const data = event.data;
      
      if (data.type === 'sketchfab-viewer-ready') {
        setIsLoaded(true);
        // Try to get annotations
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'getAnnotations'
          }, 'https://sketchfab.com');
        }
      }
      
      if (data.type === 'annotations') {
        setTotalAnnotations(data.annotations?.length || 0);
      }
      
      if (data.type === 'annotation-changed') {
        setCurrentAnnotation(data.annotationIndex || 0);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const navigateToAnnotation = (annotationIndex: number) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'navigateToAnnotation',
        annotationIndex: annotationIndex
      }, 'https://sketchfab.com');
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full ${className}`}>
      {/* Sketchfab Embed - Full Screen */}
      <div className="w-full h-full">
        <iframe
          ref={iframeRef}
          title="Cabo Negro Industrial Park - 3D Visualization"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src={embedUrl}
          className="w-full h-full"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      
      {/* Explore mode hint - only visible in explore mode */}
      {isExploreMode && (
        <div className="absolute top-4 right-4 text-white text-sm bg-black/50 backdrop-blur-sm rounded px-3 py-2 z-40">
          <div className="flex items-center space-x-2">
            <span>Presiona</span>
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">ESC</kbd>
            <span>para salir</span>
          </div>
        </div>
      )}
    </div>
  );
}
