import { useRef, useMemo } from 'react';
import type { RefObject } from 'react';
import ProjectBrutalistLayout, {
  LayoutSplitTextMediaStack,
} from '../../../layouts/ProjectBrutalistLayout';
import { LetterSwapBlock } from '../../../components/ui/letter-swap';
import { ProjectCreditsSection } from '../../../components/ui/ProjectCreditsSection';
import { useScroll } from '../../../providers/ScrollProvider';
import { newsquestDetail } from '@/content/projectDetails/newsquestDetail';

// Tab state is derived from URL pathname in ProjectBrutalistLayout.
interface NewsquestPageProps {
  initialTab?: 'project' | 'credits';
}

const NewsquestPage: React.FC<NewsquestPageProps> = () => {
  // Tablet uses mobile content (shorter labels) which works well on narrower viewport
  const { isDesktop, isTablet: _isTablet } = useScroll();

  const sectionRef0 = useRef<HTMLDivElement>(null);
  const sectionRef1 = useRef<HTMLDivElement>(null);
  const sectionRef2 = useRef<HTMLDivElement>(null);
  const sectionRef3 = useRef<HTMLDivElement>(null);
  const sectionRef4 = useRef<HTMLDivElement>(null);
  const sectionRef5 = useRef<HTMLDivElement>(null);
  const sectionRef6 = useRef<HTMLDivElement>(null);

  const imageRefs = useMemo<RefObject<HTMLElement | null>[]>(
    () => [sectionRef0, sectionRef1, sectionRef2, sectionRef3, sectionRef4, sectionRef5, sectionRef6],
    []
  );

  const leftColumnSections = useMemo(
    () => [
      ...newsquestDetail.sections,
      {
        title: '',
        paragraph: '',
        customContent: <ProjectCreditsSection credits={newsquestDetail.metadata.credits} />,
      },
    ],
    []
  );

  return (
    <ProjectBrutalistLayout
      projectName={newsquestDetail.projectName}
      metadata={newsquestDetail.metadata}
      leftColumnSections={leftColumnSections}
      leftColumnImageRefs={imageRefs}

      heroContent={
        <LetterSwapBlock
          lines={isDesktop ? newsquestDetail.heroLinesDesktop : newsquestDetail.heroLinesMobile}
          className="project-hero-title [font-size:var(--text-display-xl)] font-[600] leading-[0.88] text-(--text-primary)"
        />
      }
    >
      {/* CONTEXT */}
      <div ref={sectionRef0}>
        <LayoutSplitTextMediaStack
          paddingTop={0}
          paddingBottom={0}
          priorityFirstMedia
          mediaSrcs={[newsquestDetail.media.thumb]}
        />
      </div>

      {/* BRIEF */}
      <div ref={sectionRef1}>
        <LayoutSplitTextMediaStack
          paddingTop={64}
          paddingBottom={0}
          mediaSrcs={[newsquestDetail.media.image1]}
        />
      </div>

      {/* THE PROBLEM */}
      <div ref={sectionRef2}>
        <LayoutSplitTextMediaStack
          paddingTop={64}
          paddingBottom={0}
          mediaSrcs={[newsquestDetail.media.image2]}
        />
      </div>

      {/* CORE SOLUTIONS */}
      <div ref={sectionRef3}>
        <LayoutSplitTextMediaStack
          paddingTop={64}
          paddingBottom={0}
          mediaSrcs={[newsquestDetail.media.image3]}
        />
      </div>

      {/* VISUAL DESIGN */}
      <div ref={sectionRef4}>
        <LayoutSplitTextMediaStack
          paddingTop={64}
          paddingBottom={0}
          mediaSrcs={[newsquestDetail.media.image4]}
        />
      </div>

      {/* PROTOTYPE */}
      <div ref={sectionRef5}>
        <LayoutSplitTextMediaStack
          paddingTop={64}
          paddingBottom={24}
          mediaSrcs={[newsquestDetail.media.image5]}
        />
      </div>

      {/* CREDITS SENTINEL */}
      <div ref={sectionRef6} data-scroll-sentinel className="h-px shrink-0 pointer-events-none" aria-hidden="true" />
    </ProjectBrutalistLayout>
  );
};

export default NewsquestPage;
