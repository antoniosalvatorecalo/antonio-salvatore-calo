import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { instantTransition } from '@/lib/reduced-motion';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import './MagneticButton.css';

export const MagneticButton = ({ children, onClick, isActive }: { children: React.ReactNode, onClick: () => void, isActive: boolean }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotionPreference();

  const updatePosition = (clientX: number, clientY: number) => {
    if (prefersReducedMotion || !buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2;
    const y = (clientY - (top + height / 2)) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => updatePosition(e.clientX, e.clientY);
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    if (touch) updatePosition(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={prefersReducedMotion ? { x: 0, y: 0 } : { x: position.x, y: position.y }}
      transition={prefersReducedMotion ? instantTransition : { type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`flex-1 h-full rounded-[4px] text-center [font-size:var(--text-base)] transition-all duration-200 px-5 ${isActive ? 'font-[500] text-[var(--glass-nav-text)]' : 'font-[400] text-[var(--glass-nav-text-inactive)] hover:text-[var(--glass-nav-text)]'}`}
    >
      {children}
    </motion.button>
  );
};
