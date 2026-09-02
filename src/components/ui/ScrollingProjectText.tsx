import { motion, AnimatePresence } from "motion/react";
import { ProjectLeftTextReveal } from "./ProjectLeftTextReveal";
import type { RefObject, ReactNode } from "react";
import { useProjectTextScroll } from "@/hooks/animation/useProjectTextScroll";
import './ScrollingProjectText.css';

type SectionData = {
  title: string;
  paragraph: string;
  cta?: { label: string; href: string };
  customContent?: ReactNode;
};

interface Props {
  sections: SectionData[];
  imageRefs: RefObject<HTMLElement | null>[];
}

/**
 * ScrollingProjectText Component
 *
 * Renders project sections in the left column, cross-fading between them
 * as the user scrolls through right-column images.
 *
 * Standard sections use ProjectSection with sequential reveal:
 * 1. Title (slide up, no blur)
 * 2. Paragraph (blur reveal)
 * 3. CTA (last, if present)
 *
 * Custom sections (like Credits) can provide customContent instead.
 *
 * AnimatePresence mode="wait" ensures exit finishes before enter starts.
 */
export const ScrollingProjectText: React.FC<Props> = ({ sections, imageRefs }) => {
  const visibleIdx = useProjectTextScroll(imageRefs);

  const currentSection = sections[visibleIdx];

  return (
    <div className="scrolling-project-text relative min-h-30 self-end pb-10">
      <AnimatePresence mode="wait">
        {currentSection && (
          <motion.div
            key={visibleIdx}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentSection.customContent ? (
              currentSection.customContent
            ) : (
              <ProjectLeftTextReveal
                title={currentSection.title}
                paragraph={currentSection.paragraph}
                cta={currentSection.cta}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollingProjectText;
