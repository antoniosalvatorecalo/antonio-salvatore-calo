import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import './LinkWithArrow.css';

export const LinkComponent = ({
  href,
  children,
  className = '',
  ...props
}: {
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} className={cn(className, 'hover-underline')} {...props}>
    {children}
  </a>
);

export default LinkComponent;