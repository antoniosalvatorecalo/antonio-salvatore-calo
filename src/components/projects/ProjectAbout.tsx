import type { ReactNode } from 'react';
import './ProjectAbout.css';

interface ProjectAboutProps {
  /** Visible label on the toggle button (e.g. "about project", "contesto"). */
  label: string;
  /** Description text rendered in the static about block. */
  description: string;
  /** Optional supporting content rendered below the description. */
  children?: ReactNode;
  /** Optional entrance order when rendered inside the project header. */
  entranceIndex?: number;
}

/**
 * Static editorial content block rendered as part of the project header.
 */
export function ProjectAbout({ label, description, children, entranceIndex }: ProjectAboutProps) {
  return (
    <section
      className="project-about"
      aria-label={label}
      data-motion-text={entranceIndex !== undefined ? true : undefined}
      data-motion-order={entranceIndex}
    >
      <span className="project-about-title">{label}</span>
      {description && <p className="project-about-description">{description}</p>}
      {children}
    </section>
  );
}
