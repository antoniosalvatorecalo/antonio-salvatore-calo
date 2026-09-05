import { useState, useId, type ReactNode } from 'react';
import './ProjectAbout.css';

interface ProjectAboutProps {
  /** Visible label on the toggle button (e.g. "about project", "contesto"). */
  label: string;
  /** Description text revealed when the accordion opens. */
  description: string;
  /**
   * Optional supporting content rendered below the description inside the
   * accordion panel (e.g. links, credit lists).
   */
  children?: ReactNode;
  /**
   * Controlled open state. When provided, the accordion does not manage its
   * own state and stays in sync with the parent. Used when several
   * accordions are rendered in a row so they can share a single toggle.
   */
  isOpen?: boolean;
  /** Called when the user clicks the toggle. Required when `isOpen` is controlled. */
  onToggle?: () => void;
}

/**
 * Single accordion cell rendered as part of the project header row.
 *
 * Renders a button labelled with `label` + a "+"/"−" icon. When clicked,
 * reveals `description` (and any `children`) below. Can be controlled
 * (via `isOpen`/`onToggle`) when used inside the multi-accordion row.
 */
export function ProjectAbout({
  label,
  description,
  children,
  isOpen: controlledOpen,
  onToggle,
}: ProjectAboutProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const contentId = useId();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? Boolean(controlledOpen) : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <section
      className={`project-about ${isOpen ? 'is-open' : ''}`}
      aria-label={label}
    >
      <button
        type="button"
        className="project-about-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="project-about-title">{label}</span>
        <span className="project-about-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        id={contentId}
        className={`project-about-content ${isOpen ? 'is-expanded' : ''}`}
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        <p className="project-about-description">{description}</p>
        {children}
      </div>
    </section>
  );
}

export default ProjectAbout;