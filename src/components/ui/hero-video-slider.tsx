"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScroll } from 'framer-motion';

interface HeroVideoSliderProps {
  videos: string[];
  images?: string[]; // Fallback images for better performance
  slideDuration?: number;
  className?: string;
  showDots?: boolean;
  onSlideChange?: (index: number, direction?: 'left' | 'right') => void;
  disableAutoSlide?: boolean; // Disable auto-sliding when project options are open
}

export function HeroVideoSlider({ 
  videos, 
  images = [], 
  slideDuration = 4000,
  className = '',
  showDots = true,
  onSlideChange,
  disableAutoSlide = false
}: HeroVideoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onSlideChangeRef = useRef(onSlideChange);
  const { scrollYProgress } = useScroll();
  
  // Keep callback ref updated
  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  }, [onSlideChange]);

  // Handle manual slide change - always slide from right to left
  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    // Always use 'left' direction (slide from right to left)
    setDirection('left');
    setCurrentIndex(index);
    // Defer callback to avoid state updates during render
    setTimeout(() => {
      if (onSlideChangeRef.current) {
        onSlideChangeRef.current(index, 'left');
      }
    }, 0);
    // Reset auto-slide timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Only restart auto-slide if not disabled, not locked, and auto-sliding is enabled
    if (isAutoSliding && lockedIndex === null && !disableAutoSlide) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % videos.length;
          setDirection('left');
          if (onSlideChange) {
            onSlideChange(next);
          }
          return next;
        });
      }, slideDuration);
    }
  };

  // Track scroll position to stop auto-slide when scrolled and lock current video
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Stop auto-sliding if scrolled past 0.005 (0.5% of page) - very sensitive to catch any scroll
      if (latest > 0.005) {
        setIsAutoSliding(false);
        // Lock the current video when scrolled (so it stays visible during scroll)
        if (lockedIndex === null) {
          setLockedIndex(currentIndex);
        }
      } else {
        // Only resume auto-sliding when at the very top (scroll position 0)
        if (latest <= 0.005) {
          setIsAutoSliding(true);
          // When unlocking, update currentIndex to the locked index so we continue from where we were
          if (lockedIndex !== null) {
            setCurrentIndex(lockedIndex);
            setLockedIndex(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, currentIndex, lockedIndex]);

  // Auto-slide logic - only when at top, not locked, and not disabled
  useEffect(() => {
    if (!isAutoSliding || lockedIndex !== null || disableAutoSlide) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % videos.length;
        setDirection('left');
        // Defer callback to avoid state updates during render
        setTimeout(() => {
          if (onSlideChangeRef.current) {
            onSlideChangeRef.current(next, 'left');
          }
        }, 0);
        return next;
      });
    }, slideDuration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoSliding, slideDuration, videos.length, lockedIndex, disableAutoSlide]);

  // Handle video loading
  const handleVideoLoad = (index: number) => {
    setLoadedVideos((prev) => new Set([...prev, index]));
  };

  // Preload next video for smooth transitions - use requestIdleCallback for performance
  useEffect(() => {
    if (!isAutoSliding || disableAutoSlide) return; // Only preload when auto-sliding and not disabled
    
    const preloadNext = () => {
      const nextIndex = (currentIndex + 1) % videos.length;
      const nextVideo = videoRefs.current[nextIndex];
      if (nextVideo && !loadedVideos.has(nextIndex)) {
        // Use requestIdleCallback to preload during idle time
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            nextVideo.load();
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => nextVideo.load(), 100);
        }
      }
    };

    preloadNext();
  }, [currentIndex, videos.length, loadedVideos, isAutoSliding, disableAutoSlide]);

  // Use locked index if scrolled, otherwise use current index
  const displayIndex = lockedIndex !== null ? lockedIndex : currentIndex;
  
  // Track previous index to keep it visible underneath during transitions
  // Use a ref to track the previous displayIndex value
  const prevDisplayIndexRef = useRef<number>(displayIndex);
  const [previousIndex, setPreviousIndex] = useState<number>(displayIndex);
  
  // Update previous index when displayIndex changes
  useEffect(() => {
    if (displayIndex !== prevDisplayIndexRef.current) {
      // Index changed - set previous to the old value, then update after transition
      setPreviousIndex(prevDisplayIndexRef.current);
      prevDisplayIndexRef.current = displayIndex;
      
      // Update previousIndex to current after transition completes
      const timer = setTimeout(() => {
        setPreviousIndex(displayIndex);
      }, 600); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [displayIndex]);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-black ${className}`}>
      {/* Previous video - stays visible underneath (no exit animation) */}
      {/* Show previous video when it's different from current to prevent white background */}
      {previousIndex !== displayIndex && (
        <div className="absolute inset-0 z-0">
          {images[previousIndex] ? (
            <img
              src={images[previousIndex]}
              alt={`Hero background ${previousIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <video
              ref={(el) => {
                videoRefs.current[previousIndex] = el;
                if (el) {
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              onLoadedData={() => handleVideoLoad(previousIndex)}
              preload="auto"
            >
              <source src={videos[previousIndex]} type="video/mp4" />
            </video>
          )}
        </div>
      )}
      
      {/* Current video - always slides from right to left */}
      <motion.div
        key={displayIndex}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 z-10"
      >
          {images[displayIndex] ? (
            // Use image if available (better performance)
            <img
              src={images[displayIndex]}
              alt={`Hero background ${displayIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading={displayIndex === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            // Fallback to video - optimized loading
            <video
              ref={(el) => {
                videoRefs.current[displayIndex] = el;
                // Ensure video plays when it becomes visible
                if (el) {
                  el.play().catch(() => {
                    // Ignore play errors (browser autoplay policies)
                  });
                }
              }}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              onLoadedData={() => handleVideoLoad(displayIndex)}
              preload={displayIndex === 0 ? 'auto' : 'auto'}
              // Performance optimizations
              style={{
                willChange: 'opacity',
              }}
            >
              <source src={videos[displayIndex]} type="video/mp4" />
            </video>
          )}
        </motion.div>

      {/* Dot Navigation */}
      {showDots && videos.length > 1 && (
        <div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === displayIndex
                  ? 'w-2 h-2 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              style={{ pointerEvents: 'auto' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

