import { useState, type ReactNode } from 'react';
import { ProjectAbout } from './ProjectAbout';
import { useLanguage } from '../../providers/LanguageProvider';
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

/**
 * Row of independent accordions rendered at the top of a project page.
 * Each cell can be opened / closed on its own; only one cell is expanded at
 * a time (the user can also close the open cell by clicking it again).
 *
 * Cells, in order:
 *   1. contesto      — context narrative
 *   2. sfida         — challenge narrative
 *   3. soluzione     — solution narrative
 *   4. credits       — structured credits list
 *   5. links         — process and live project links
 */
export function ProjectDetailsGrid({ columns }: ProjectDetailsGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  if (columns.length === 0) return null;

  return (
    <section className="project-details-grid" aria-label="Project header details">
      {columns.map((column, index) => {
        const description = column.text ?? '';
        const hasCredits = column.credits && column.credits.length > 0;
        const hasCtas = column.cta && column.cta.length > 0;
        const isOpen = openIndex === index;

        const children: ReactNode = (
          <>
            {hasCredits && (
              <dl className="project-about-credits">
                {column.credits!.map((entry, entryIndex) => (
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
            )}
            {hasCtas && (
              <ul className="project-about-cta">
                {column.cta!.map((link) => (
                  <li key={link.href}>
                    <AnimatedLink
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      label={link.href.includes('behance.net') ? t('cta.process') : t('cta.live')}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        );

        return (
          <ProjectAbout
            key={`${column.label}-${index}`}
            label={column.label}
            description={description}
            isOpen={isOpen}
            onToggle={() => setOpenIndex(isOpen ? null : index)}
          >
            {children}
          </ProjectAbout>
        );
      })}
    </section>
  );
}
