'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) {
      gsap.killTweensOf(triggerElement);
      }
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow"></div>
          <div data-parallax-layers className="parallax__layers">
            {/* Layer 1 - Background (furthest) */}
            <img 
              src="/cabo_negro1.webp" 
              alt="Cabo Negro Background" 
              loading="eager" 
              className="parallax__layer-img" 
              data-parallax-layer="1"
            />
            {/* Layer 2 */}
            <img 
              src="/cabonegro_smooth_sobel.webp" 
              alt="Cabo Negro Layer 2" 
              loading="eager" 
              className="parallax__layer-img" 
              data-parallax-layer="2"
            />
            {/* Layer 3 - Title */}
            <div data-parallax-layer="3" className="parallax__layer-title">
              <h2 className="parallax__title">CABO NEGRO</h2>
            </div>
            {/* Layer 4 - Foreground (closest) */}
            <img 
              src="/cabonegro_wirefram2.webp" 
              alt="Cabo Negro Foreground" 
              loading="eager" 
              className="parallax__layer-img" 
              data-parallax-layer="4"
            />
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>
      <section className="parallax__content">
        {/* Footer content will go here - buttons, links, etc. */}
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <p className="text-white text-center text-lg">
            Footer 2.0 Content Area - Customize buttons and content here
          </p>
        </div>
      </section>
    </div>
  );
}