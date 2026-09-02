import type { ReactNode } from 'react';
import { AnimatedLink } from './AnimatedLink';
import { ArrowIcon } from './ArrowIcon';
import './LinkWithArrow.css';

export const LinkWithArrow = ({
  href,
  children,
  className,
  light,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  light?: boolean;
}) => (
  <AnimatedLink href={href} className={`group${className ? ` ${className}` : ''}`} light={light}>
    <span className="flex items-center gap-2">
      {children}
      <ArrowIcon className="transform transition-transform duration-300 ease-out origin-center group-hover:-rotate-45" />
    </span>
  </AnimatedLink>
);
