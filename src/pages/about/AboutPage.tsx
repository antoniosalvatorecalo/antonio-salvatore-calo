import { useEffect } from 'react';
import { useReducedMotionPreference } from '../../providers/MotionPreferenceProvider';
import { motion } from 'motion/react';
import { SiteHeader } from '../../components/ui/SiteHeader';
import { AboutSection } from '../../components/ui/AboutSection';
import { Footer } from '../../components/ui/Footer';
import { orchestrator } from '../../animations/orchestrator';

/* ═══════════════════════════════════════════════════════════════════════════════
   About Page
   ═══════════════════════════════════════════════════════════════════════════════ */
const AboutPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    // Reset orchestrator for clean state
    orchestrator.reset();
  }, [prefersReducedMotion]);

  return (
    <motion.div
      className="flex flex-col min-h-screen"
      data-scroll-root
    >
      <SiteHeader />
      <main className="flex-1 pt-[calc(var(--header-height)+var(--header-content-gap))] lg:px-[var(--space-4)]">
        <AboutSection enabled={true} />
      </main>
      <Footer />
    </motion.div>
  );
};

export default AboutPage;