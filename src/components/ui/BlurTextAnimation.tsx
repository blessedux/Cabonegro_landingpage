"use client";

import React, { useEffect, useState, useMemo } from "react";

interface WordData {
  text: string;
  duration: number;
  delay: number;
  blur: number;
  scale?: number;
}

interface BlurTextAnimationProps {
  text?: string;
  words?: WordData[];
  className?: string;
  fontSize?: string;
  fontFamily?: string;
  textColor?: string;
  animationDelay?: number;
}

export default function BlurTextAnimation({
  text = "Elegant blur animation that brings your words to life with cinematic transitions.",
  words,
  className = "",
  fontSize = "text-4xl md:text-5xl lg:text-6xl",
  fontFamily = "font-['Avenir_Next',_'Avenir',_system-ui,_sans-serif]",
  textColor = "text-white",
  animationDelay = 4000
}: BlurTextAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const textWords = useMemo(() => {
    if (words) return words;
    
    const splitWords = text.split(" ");
    const totalWords = splitWords.length;
    
    return splitWords.map((word, index) => {
      const progress = index / totalWords;
      
      const exponentialDelay = Math.pow(progress, 0.8) * 0.5;
      
      const baseDelay = index * 0.06;
      
      // Use deterministic values for SSR, random only on client
      const microVariation = isClient ? (Math.random() - 0.5) * 0.05 : 0;
      const blurVariation = isClient ? Math.floor(Math.random() * 8) : 4;
      
      return {
        text: word,
        duration: 2.2 + Math.cos(index * 0.3) * 0.3,
        delay: baseDelay + exponentialDelay + microVariation,
        blur: 12 + blurVariation,
        scale: 0.9 + Math.sin(index * 0.2) * 0.05
      };
    });
  }, [text, words, isClient]);

  useEffect(() => {
    // Set client state to enable random values
    setIsClient(true);
    
    // Start animation once and keep it visible
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`${className}`}>
      <p className={`${textColor} ${fontSize} ${fontFamily} font-light leading-relaxed tracking-wide`}>
        {textWords.map((word, index) => (
          <span
            key={index}
            className={`inline-block transition-all ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transitionDuration: `${word.duration}s`,
              transitionDelay: `${word.delay}s`,
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              filter: isAnimating 
                ? 'blur(0px) brightness(1)' 
                : `blur(${word.blur}px) brightness(0.6)`,
              transform: isAnimating 
                ? 'translateY(0) scale(1) rotateX(0deg)' 
                : `translateY(20px) scale(${word.scale || 1}) rotateX(-15deg)`,
              marginRight: '0.35em',
              willChange: 'filter, transform, opacity',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              textShadow: isAnimating 
                ? '0 2px 8px rgba(255,255,255,0.1)' 
                : '0 0 40px rgba(255,255,255,0.4)'
            }}
          >
            {word.text}
          </span>
        ))}
      </p>
    </div>
  );
}

export function Component() {
  return <BlurTextAnimation />;
}
