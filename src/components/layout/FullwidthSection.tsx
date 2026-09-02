import { ReactNode } from 'react';
import { useScroll } from '../../providers/ScrollProvider';
import './FullwidthSection.css';

interface FullwidthSectionProps {
  children: ReactNode;
  className?: string;
  background?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'inverse-subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bleed?: 'top' | 'bottom' | 'both' | 'none';
  id?: string;
}

/**
 * FullwidthSection - Brutalist breakout component
 * 
 * Allows content to break out of the dual-column layout constraint
 * while maintaining the portfolio's brutalist aesthetic and scroll behavior.
 * 
 * Usage: Wrap any content that needs to span full viewport width
 * within the work or about sections.
 */
export const FullwidthSection = ({ 
  children, 
  className = '',
  background = 'primary',
  padding = 'md',
  bleed = 'none',
  id
}: FullwidthSectionProps) => {
  const { isDesktop } = useScroll();
  
  // Background color mapping to CSS variables
  const bgClasses = {
    primary: 'bg-[var(--bg-primary)]',
    secondary: 'bg-[var(--bg-secondary)]', 
    tertiary: 'bg-[var(--bg-tertiary)]',
    inverse: 'bg-[var(--bg-inverse)]',
    'inverse-subtle': 'bg-[var(--bg-inverse-subtle)]'
  };
  
  // Padding mapping - brutalist spacing system
  const paddingClasses = {
    none: '',
    sm: 'py-[var(--section-xs)]',
    md: 'py-[var(--section-sm)]', 
    lg: 'py-[var(--section-md)]',
    xl: 'py-[var(--section-lg)]'
  };
  
  // Bleed handling for edge-to-edge effect
  const bleedClasses = {
    none: '',
    top: '-mt-4 md:-mt-2',
    bottom: '-mb-4 md:-mb-2', 
    both: '-mt-4 md:-mt-2 -mb-4 md:-mb-2'
  };
  
  // Calculate negative margins to break out of column constraints
  // Left column (30%) + gap (16px) = need to account for this offset
  const breakoutOffset = isDesktop ? 'w-screen -ml-[calc(30%+8px)]' : 'w-full';
  
  return (
    <section 
      id={id}
      className={`
        ${bgClasses[background]}
        ${paddingClasses[padding]}
        ${bleedClasses[bleed]}
        ${breakoutOffset}
        relative
        ${className}
      `}
    >
      {/* Content wrapper that respects the original column width for alignment */}
      <div className={`
        ${isDesktop ? 'ml-[calc(30%+8px)]' : ''}
        w-full
      `}>
        {children}
      </div>
    </section>
  );
};

/**
 * FullwidthContent - Inner wrapper for fullwidth sections
 * 
 * Provides consistent content boundaries while allowing 
 * background and visual elements to extend edge-to-edge
 */
export const FullwidthContent = ({ 
  children, 
  className = '',
  maxWidth = 'full'
}: { 
  children: ReactNode; 
  className?: string;
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full';
}) => {
  const widthClasses = {
    narrow: 'max-w-4xl',
    medium: 'max-w-6xl', 
    wide: 'max-w-7xl',
    full: 'w-full'
  };
  
  return (
    <div className={`mx-auto px-[var(--section-xs)] ${widthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};