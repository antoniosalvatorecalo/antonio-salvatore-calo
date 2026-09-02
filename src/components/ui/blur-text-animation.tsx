"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./blur-text-animation.css";

interface BlurTextAnimationProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  from?: "top" | "bottom" | "left" | "right";
  blur?: number;
  y?: number;
  x?: number;
  onAnimationComplete?: () => void;
  as?: React.ElementType;
}

export const BlurTextAnimation = ({
  text,
  className = "",
  duration = 1.2,
  delay = 0,
  stagger = 0.02,
  from = "bottom",
  blur = 20,
  y = 40,
  x = 0,
  onAnimationComplete,
  as: Component = "span",
}: BlurTextAnimationProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const chars = containerRef.current?.querySelectorAll(".char");
      if (!chars || chars.length === 0) return;

      const getInitialProps = () => {
        switch (from) {
          case "top":
            return { y: -y, opacity: 0, filter: `blur(${blur}px)` };
          case "bottom":
            return { y: y, opacity: 0, filter: `blur(${blur}px)` };
          case "left":
            return { x: -x || -y, opacity: 0, filter: `blur(${blur}px)` };
          case "right":
            return { x: x || y, opacity: 0, filter: `blur(${blur}px)` };
          default:
            return { y: y, opacity: 0, filter: `blur(${blur}px)` };
        }
      };

      const getMiddleProps = () => ({
        opacity: 0.5,
        filter: `blur(${blur / 2}px)`,
      });

      const getFinalProps = () => ({
        y: 0,
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        ease: "power3.out",
      });

      gsap.set(chars, getInitialProps());

      const tl = gsap.timeline({
        delay,
        onComplete: onAnimationComplete,
      });

      tl.to(chars, {
        ...getMiddleProps(),
        duration: duration * 0.4,
        stagger,
        ease: "power2.out",
      }).to(chars, {
        ...getFinalProps(),
        duration: duration * 0.6,
        stagger,
        ease: "power3.out",
      });

      return () => ctx.revert();
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isMounted, text, from, blur, x, y, duration, stagger, delay, onAnimationComplete]);

  const chars = text.split("");

  return (
    <Component ref={containerRef} className={className}>
      {chars.map((char, index) => (
        <span
          key={index}
          className="char inline-block whitespace-pre"
        >
          {char}
        </span>
      ))}
    </Component>
  );
};

export default BlurTextAnimation;
