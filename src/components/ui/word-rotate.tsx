"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface WordRotateProps {
  words: string[];
  duration?: number;
  framerProps?: HTMLMotionProps<"span">;
  className?: string;
  controlledIndex?: number; // Optional controlled index for syncing with external state
}

export function WordRotate({
  words,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  controlledIndex,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  // Use controlled index if provided, otherwise auto-rotate
  useEffect(() => {
    if (controlledIndex !== undefined) {
      setIndex(controlledIndex);
      return;
    }
  }, [controlledIndex]);

  // Auto-rotate only if not controlled
  useEffect(() => {
    if (controlledIndex !== undefined) return; // Don't auto-rotate if controlled

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration, controlledIndex]);

  return (
    <span className="inline-block overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className={cn("inline-block", className)}
          {...framerProps}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

