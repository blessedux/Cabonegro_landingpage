"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
  id: string | number;
  title: string;
  phaseTitle?: string;
  description?: string;
  date?: string;
}

// Create infinite items by triplicating the array
const createInfiniteItems = (originalItems: CarouselItem[]) => {
  const items: Array<CarouselItem & { originalIndex: number }> = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      items.push({
        ...item,
        id: `${i}-${item.id}`,
        originalIndex: index,
      });
    });
  }
  return items;
};

const RulerLines = ({
  top = true,
  totalLines = 100,
}: {
  top?: boolean;
  totalLines?: number;
}) => {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = "h-1.5";
    let color = "bg-gray-500 dark:bg-gray-400";

    if (isCenter) {
      height = "h-4";
      color = "bg-primary dark:bg-white";
    } else if (isFifth) {
      height = "h-2";
      color = "bg-primary dark:bg-white";
    }

    const positionClass = top ? "" : "bottom-0";

    lines.push(
      <div
        key={i}
        className={`absolute w-0.5 ${height} ${color} ${positionClass}`}
        style={{ left: `${i * lineSpacing}%` }}
      />
    );
  }

      return <div className="relative w-full h-4 px-2">{lines}</div>;
};

export function RulerCarousel({
  originalItems,
}: {
  originalItems: CarouselItem[];
}) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  // Start with the middle set, item 4 (UNIQLO)
  const [activeIndex, setActiveIndex] = useState(itemsPerSet + 4);
  const [isResetting, setIsResetting] = useState(false);
  const previousIndexRef = useRef(itemsPerSet + 4);

  const handleItemClick = (newIndex: number) => {
    if (isResetting) return;

    // Find the original item index (0-8)
    const targetOriginalIndex = newIndex % itemsPerSet;

    // Find all instances of this item across the 3 copies
    const possibleIndices = [
      targetOriginalIndex, // First copy
      targetOriginalIndex + itemsPerSet, // Second copy
      targetOriginalIndex + itemsPerSet * 2, // Third copy
    ];

    // Find the closest index to current position
    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    }

    previousIndexRef.current = activeIndex;
    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev + 1);
  };

  // Handle infinite scrolling
  useEffect(() => {
    if (isResetting) return;

    // If we're in the first set, jump to the equivalent position in the middle set
    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
    // If we're in the last set, jump to the equivalent position in the middle set
    else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isResetting) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((prev) => prev - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetting]);

  // Calculate target position - center the active item
  const centerPosition = 5; // We want item 5 (index 4) to be centered initially
  const targetX = -250 + (centerPosition - (activeIndex % itemsPerSet)) * 250;

  // Get current page info
  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;
  const isFirstSlide = currentPage === 1;
  const isSecondSlide = currentPage === 2;
  const isThirdSlide = currentPage === 3;
  const isFourthSlide = currentPage === 4;
  const isFifthSlide = currentPage === 5;
  const isSixthSlide = currentPage === 6;
  const isSeventhSlide = currentPage === 7;
  const isEighthSlide = currentPage === 8;
  const isNinthSlide = currentPage === 9;

  // Helper to select current media node
  const renderMedia = () => {
    if (isFirstSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/lots_model.png" alt="Cabo Negro lots model" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isSecondSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/stage2.png" alt="Stage 2 development render" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isThirdSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/h2v.png" alt="Green hydrogen hub illustration" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isFourthSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/wind_turbine.png" alt="Wind energy integration" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isFifthSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/maritime_terminal.png" alt="Maritime terminal expansion" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isSixthSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/logistics.png" alt="Logistics network development" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isSeventhSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/certification.png" alt="Regulatory compliance certification" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isEighthSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/opeartional_launch.png" alt="Operational launch" fill className="object-cover" priority />
          </div>
        </div>
      );
    } else if (isNinthSlide) {
      return (
        <div className="w-full aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden bg-black">
          <div className="relative w-full h-full">
            <Image src="/global_expansion.png" alt="Global expansion" fill className="object-cover" priority />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video max-w-3xl mx-auto border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center bg-black">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg font-medium mb-2">Media Placeholder</div>
          <div className="text-sm">Image/Video will go here</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[50vh] flex flex-col items-center justify-between bg-black py-6">
      <div className="w-full h-[100px] flex flex-col justify-start relative mb-8">
        <div className="flex items-center justify-center">
          <RulerLines top />
        </div>
        <div className="flex items-center justify-center w-full h-full relative overflow-hidden">
          <motion.div
            className="flex items-center gap-[50px]"
            animate={{
              x: isResetting ? targetX : targetX,
            }}
            transition={
              isResetting
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 1,
                  }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(index)}
                      className={`text-lg md:text-xl font-bold cursor-pointer flex items-center justify-center ${
                    // On desktop, allow 2-line wrap for slide 5 and 7 to align vertically
                    (item as any).originalIndex === 4 || (item as any).originalIndex === 6
                      ? 'md:whitespace-normal md:break-words whitespace-nowrap'
                      : 'whitespace-nowrap'
                  } ${
                    isActive
                      ? "text-primary dark:text-white"
                      : "text-muted-foreground dark:text-gray-500 hover:text-foreground dark:hover:text-gray-400"
                  }`}
                  animate={{
                    scale: isActive ? 1 : 0.75,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={
                    isResetting
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }
                  }
                  style={{
                    width: "200px",
                  }}
                >
                  {item.title}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="flex items-center justify-center">
          <RulerLines top={false} />
        </div>
      </div>
      
      {/* Description Section */}
      <div className="w-full max-w-4xl px-4">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {infiniteItems[activeIndex]?.phaseTitle || infiniteItems[activeIndex]?.title}
          </h3>
          <p
            className={`text-lg text-gray-300 leading-relaxed mx-auto mb-4 max-w-3xl ${
              isFifthSlide
                ? 'md:max-w-[60ch]'
                : isSeventhSlide
                  ? 'md:max-w-[36ch]'
                  : ''
            }`}
          >
            {infiniteItems[activeIndex]?.description}
          </p>
          {infiniteItems[activeIndex]?.date && (
            <div className="text-xl font-semibold text-white">
              {infiniteItems[activeIndex]?.date}
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer"
          aria-label="Previous item"
        >
          <Rewind className="w-5 h-5 text-primary/80" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            {currentPage}
          </span>
          <span className="text-sm text-muted-foreground dark:text-gray-500">
            /
          </span>
          <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            {totalPages}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer"
          aria-label="Next item"
        >
          <FastForward className="w-5 h-5 text-primary/80" />
        </button>
      </div>

      {/* Media area with smooth crossfade */}
      <div className="w-full max-w-5xl px-4 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderMedia()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
