import type { AnchorHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type AnimatedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  label: string;
  to?: LinkProps['to'];
};

export function AnimatedLink({ label, to, className, ...props }: AnimatedLinkProps) {
  const classes = ['animated-link', className].filter(Boolean).join(' ');

  if (to !== undefined) {
    return (
      <Link to={to} className={classes} {...(props as Omit<LinkProps, 'to'>)}>
        {label}
      </Link>
    );
  }

  return (
    <a className={classes} {...props}>
      {label}
    </a>
  );
}
