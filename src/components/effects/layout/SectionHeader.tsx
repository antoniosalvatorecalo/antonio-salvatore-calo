import { AnimatedSectionHeader } from './AnimatedSectionHeader';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  light?: boolean;
  /** Global cascade delay in ms. If not provided, uses static header. */
  cascadeDelay?: number;
}

export const SectionHeader = ({ title, light = false, cascadeDelay }: SectionHeaderProps) => {
  if (cascadeDelay !== undefined) {
    return <AnimatedSectionHeader title={title} light={light} cascadeDelay={cascadeDelay} />;
  }

  return (
    <div className="flex items-center mb-6">
      <span className={`${light ? 'text-(--text-inverse)' : 'text-(--text-muted)'} [font-size:var(--text-base)] uppercase tracking-wider font-[500]`}>{title}</span>
    </div>
  );
};

export type { SectionHeaderProps };
