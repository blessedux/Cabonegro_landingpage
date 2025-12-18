"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  words: string[];
  duration?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export function TypingAnimation({
  words,
  duration = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [charIndex, setCharIndex] = useState<number>(0);

  // Reset state when word changes
  useEffect(() => {
    setCharIndex(0);
    setDisplayedText("");
    setIsDeleting(false);
  }, [currentWordIndex]);

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];
    
    // If we just finished typing, wait before starting to delete
    if (!isDeleting && charIndex === currentWord.length) {
      const pauseTimer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    // If we just finished deleting, move to next word
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? deleteSpeed : duration;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (charIndex < currentWord.length) {
          setDisplayedText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }
      } else {
        // Deleting backward
        if (charIndex > 0) {
          setDisplayedText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentWordIndex, words, duration, deleteSpeed, pauseTime]);

  return (
    <span
      className={cn(
        "inline-block",
        className,
      )}
    >
      {displayedText}
    </span>
  );
}


