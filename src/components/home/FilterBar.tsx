import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFilter } from '@/providers/FilterContext';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import './FilterBar.css';

const FILTER_LABELS: Record<string, { EN: string; IT: string }> = {
  'web design': { EN: 'Web Design', IT: 'Web Design' },
  'ui/ux': { EN: 'UI/UX', IT: 'UI/UX' },
  development: { EN: 'Development', IT: 'Sviluppo' },
  'ui design': { EN: 'UI Design', IT: 'UI Design' },
  'ux design': { EN: 'UX Design', IT: 'UX Design' },
};

export function FilterBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { active, setActive } = useFilter();
  const { projects } = useProjectCatalog();
  const { locale } = useLanguage();

  const servicesWithCounts = projects.reduce<Array<{ name: string; count: number }>>((services, project) => {
    const name = project.category.trim();
    if (!name) return services;

    const existingService = services.find((service) => service.name === name);
    if (existingService) {
      existingService.count += 1;
    } else {
      services.push({ name, count: 1 });
    }
    return services;
  }, []);

  const getLabel = (name: string) => FILTER_LABELS[name.toLowerCase()]?.[locale] ?? name;
  const activeService = servicesWithCounts.find(({ name }) => name === active);
  const activeLabel = active === 'all'
    ? (locale === 'IT' ? 'Tutti' : 'All')
    : getLabel(activeService?.name ?? active);
  const activeCount = active === 'all' ? projects.length : activeService?.count ?? 0;
  const panelId = 'project-filter-options';

  return (
    <nav className="filter-bar" aria-label={locale === 'IT' ? 'Filtri progetti' : 'Project filters'}>
      <div className="filter-bar-summary">
        <button
          type="button"
          className="filter-bar-toggle"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{locale === 'IT' ? 'Filtri' : 'Filter'}</span>
          <span className="filter-bar-symbol" aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>
        {!isOpen && (
          <span className="filter-bar-current" aria-live="polite">
            {activeLabel} <span className="filter-bar-count">[{activeCount}]</span>
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            className="filter-bar-panel"
            initial={{ width: 0, opacity: 0, x: -8 }}
            animate={{ width: 'auto', opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="filter-bar-options" role="group" aria-label={locale === 'IT' ? 'Filtra per servizio' : 'Filter projects by service'}>
              <button
                type="button"
                className={`filter-bar-item${active === 'all' ? ' is-active' : ''}`}
                onClick={() => setActive('all')}
                aria-pressed={active === 'all'}
              >
                {locale === 'IT' ? 'Tutti' : 'All'} <span className="filter-bar-count">[{projects.length}]</span>
              </button>
              {servicesWithCounts.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  className={`filter-bar-item${active === name ? ' is-active' : ''}`}
                  onClick={() => setActive(name)}
                  aria-pressed={active === name}
                >
                  {getLabel(name)} <span className="filter-bar-count">[{count}]</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
