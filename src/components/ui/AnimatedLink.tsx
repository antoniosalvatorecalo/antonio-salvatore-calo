import type { ReactNode, HTMLAttributes } from 'react';
import './AnimatedLink.css';

export const AnimatedLink = ({
  href,
  children,
  className = "",
  light = false,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
  light?: boolean;
} & HTMLAttributes<HTMLAnchorElement>) => (
  <a
    href={href}
    className={`${light ? 'text-(--text-inverse) hover:text-(--text-inverse)' : 'text-(--text-primary) hover:text-(--text-primary)'} transition-colors relative inline-block ${className}`}
    {...props}
  >
    {children}
  </a>
);