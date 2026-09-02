import './RevealLabel.css';

interface RevealLabelProps {
  title: string;
  light?: boolean;
  className?: string;
  /** Use 'title' for sequential reveal (Title → Paragraph → CTA), 'label' for legacy */
  variant?: 'label' | 'title';
}

export const RevealLabel = ({ title, light = false, className = '', variant = 'label' }: RevealLabelProps) => {
  return (
    <div className={`reveal-label-overflow ${className}`}>
      <span
        data-reveal={variant}
        className={`reveal-label-text ${light ? 'reveal-label-text--light' : 'reveal-label-text--dark'}`}
      >
        {title}
      </span>
    </div>
  );
};
