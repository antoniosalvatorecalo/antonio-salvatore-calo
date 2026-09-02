import { useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useEntranceReveal, type EntranceRevealOptions } from '@/hooks/animation/useEntranceReveal';

interface RevealProps extends EntranceRevealOptions {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Reveal({
  as: Component = 'div',
  children,
  className,
  selector = '&',
  ...options
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const resolvedSelector = selector === '&' ? '[data-entrance-root]' : selector;

  useEntranceReveal(ref, { ...options, selector: resolvedSelector });

  return (
    <Component ref={ref} className={className} data-entrance-root>
      {children}
    </Component>
  );
}

export function RevealGroup({
  as: Component = 'div',
  children,
  className,
  selector = '[data-entrance-item]',
  ...options
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEntranceReveal(ref, { ...options, selector });

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
