import { useState } from 'react';
import './ProjectAbout.css';

interface ProjectAboutProps {
  projectName: string;
  description: string;
  links: { label: string; href: string }[];
}

export function ProjectAbout({ projectName, description, links }: ProjectAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="project-about">
      <button
        className="project-about-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="project-about-title">{projectName}</span>
        <span className="project-about-icon">{isExpanded ? '−' : '+'}</span>
      </button>

      <div className={`project-about-content ${isExpanded ? 'is-expanded' : ''}`}>
        <p className="project-about-description">{description}</p>
        {links.length > 0 && (
          <ul className="project-about-links">
            {links.map((link, i) => (
              <li key={i}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProjectAbout;
