import { motion } from 'motion/react';
import { useFilter } from '@/providers/FilterContext';
import { useProjectCatalog } from '@/cms/ProjectCatalogProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { TEXT_MOTION } from '@/motion/TextRevealMotion';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import { FilterDisclosureOptions } from '@/components/FilterDisclosureOptions';
import './FilterBar.css';

const FILTER_LABELS: Record<string, { EN: string; IT: string }> = {
  'web design': { EN: 'Web Design', IT: 'Web Design' },
  'ui/ux': { EN: 'UI/UX', IT: 'UI/UX' },
  development: { EN: 'Development', IT: 'Sviluppo' },
  'ui design': { EN: 'UI Design', IT: 'UI Design' },
  'ux design': { EN: 'UX Design', IT: 'UX Design' },
};

export function FilterBar({ entranceReady }: { entranceReady: boolean }) {
  const { active, setActive, isOpen, setIsOpen } = useFilter();
  const { projects } = useProjectCatalog();
  const { locale } = useLanguage();
  const reducedMotion = useReducedMotionPreference();

  const servicesWithCounts = projects.reduce<Array<{ name: string; count: number }>>(
    (services, project) => {
      const name = project.category.trim();
      if (!name) return services;

      const existingService = services.find((service) => service.name === name);
      if (existingService) {
        existingService.count += 1;
      } else {
        services.push({ name, count: 1 });
      }
      return services;
    },
    [],
  );

  const getLabel = (name: string) => FILTER_LABELS[name.toLowerCase()]?.[locale] ?? name;
  const activeService = servicesWithCounts.find(({ name }) => name === active);
  const activeLabel =
    active === 'all'
      ? locale === 'IT'
        ? 'Tutti'
        : 'All'
      : getLabel(activeService?.name ?? active);
  const activeCount = active === 'all' ? projects.length : (activeService?.count ?? 0);
  const panelId = 'project-filter-options';
  const options = [
    { value: 'all', label: locale === 'IT' ? 'Tutti' : 'All', count: projects.length },
    ...servicesWithCounts.map(({ name, count }) => ({ value: name, label: getLabel(name), count })),
  ];
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const hiddenY = mobile ? 10 : 18;
  const isEntranceVisible = entranceReady || reducedMotion;

  return (
    <nav
      className="filter-bar"
      data-motion-home-surface
      aria-label={locale === 'IT' ? 'Filtri progetti' : 'Project filters'}
    >
      <motion.div
        className="filter-bar-summary"
        initial={reducedMotion ? false : { opacity: 0, y: hiddenY }}
        animate={isEntranceVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY }}
        transition={{
          duration: reducedMotion ? 0 : TEXT_MOTION.enterDuration,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <button
          type="button"
          className="filter-bar-toggle"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{locale === 'IT' ? 'Filtri' : 'Filter'}</span>
          <span className="filter-bar-symbol" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
        {!isOpen && (
          <span className="filter-bar-current" aria-live="polite">
            {activeLabel} <span className="filter-bar-count">[{activeCount}]</span>
          </span>
        )}
      </motion.div>
      <FilterDisclosureOptions
        open={isOpen}
        panelId={panelId}
        groupLabel={locale === 'IT' ? 'Filtra per servizio' : 'Filter projects by service'}
        options={options}
        activeValue={active}
        onSelect={setActive}
      />
    </nav>
  );
}
