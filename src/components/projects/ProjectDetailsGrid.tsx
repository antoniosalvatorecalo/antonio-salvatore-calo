import { useId, useState, type ReactNode } from 'react';
import { ProjectAbout } from './ProjectAbout';
import './ProjectDetailsGrid.css';
import { AnimatedLink } from '../ui/AnimatedLink';

export interface ProjectDetailColumn {
  /** Small uppercase label (e.g. "contesto", "sfida", "soluzione", "credits", "links"). */
  label: string;
  /** Long-form body copy for the cell. */
  text?: string;
  /** Optional list of {label, values} entries — used by the "credits" cell. */
  credits?: { label: string; values: string[] }[];
  /**
   * Optional list of links rendered in the dedicated links cell.
   */
  cta?: { label: string; href: string }[];
}

export interface ProjectDetailsGridProps {
  columns: ProjectDetailColumn[];
}

interface ProjectMetaAccordionProps {
  label: string;
  children: ReactNode;
}

function ProjectMetaAccordion({ label, children }: ProjectMetaAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <section className={`project-details-meta-block${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="project-details-meta-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="project-details-meta-label">{label}</span>
        <span className="project-details-meta-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div
        id={contentId}
        className={`project-details-meta-content${isOpen ? ' is-expanded' : ''}`}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Static editorial details rendered at the top of a project page.
 */
export function ProjectDetailsGrid({ columns }: ProjectDetailsGridProps) {
  if (columns.length === 0) return null;

  const about = columns
    .map((column) => column.text?.trim())
    .filter((text): text is string => Boolean(text))
    .join(' ');
  const credits = columns.flatMap((column) => column.credits ?? []);
  const links = columns.flatMap((column) => column.cta ?? []);

  return (
    <section className="project-details-grid" aria-label="Project header details">
      {about && <ProjectAbout label="[about]" description={about} entranceIndex={1} />}

      {(credits.length > 0 || links.length > 0) && (
        <div className="project-details-meta" data-motion-text data-motion-order="2">
          {credits.length > 0 && (
            <ProjectMetaAccordion label="credits">
              <dl className="project-about-credits">
                {credits.map((entry, entryIndex) => (
                  <div key={`${entry.label}-${entryIndex}`} className="project-about-credit-item">
                    <dt className="project-about-credit-label">{entry.label}</dt>
                    {entry.values.map((value, valueIndex) => (
                      <dd key={valueIndex} className="project-about-credit-value">
                        {value}
                      </dd>
                    ))}
                  </div>
                ))}
              </dl>
            </ProjectMetaAccordion>
          )}

          {links.length > 0 && (
            <ProjectMetaAccordion label="links">
              <ul className="project-about-cta">
                {links.map((link) => (
                  <li key={link.href}>
                    <AnimatedLink
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      label={link.label}
                    />
                  </li>
                ))}
              </ul>
            </ProjectMetaAccordion>
          )}
        </div>
      )}
    </section>
  );
}
