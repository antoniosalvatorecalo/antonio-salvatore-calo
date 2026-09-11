import { useEffect, useState, type CSSProperties } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import './EntranceIntro.css';

interface EntranceIntroProps {
  ready: boolean;
  error: boolean;
}
const VOICES = {
  EN: ['Designer', 'Creative developer', 'Art direction', 'Digital experiences'],
  IT: ['Designer', 'Creative developer', 'Art direction', 'Esperienze digitali'],
};

export function EntranceIntro({ ready, error }: EntranceIntroProps) {
  const { locale } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const startedAt = performance.now();
    const duration = 1900;
    let frame = 0;
    const tick = (now: number) => {
      const target = ready || error ? 100 : 92;
      const next = Math.min(target, Math.round(((now - startedAt) / duration) * target));
      setProgress(next);
      if (next < target) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [error, ready]);
  useEffect(() => {
    if (!ready && !error) return;
    const timeout = window.setTimeout(() => {
      document.documentElement.dataset.introComplete = 'true';
      window.dispatchEvent(new CustomEvent('portfolio:intro-complete'));
      setDismissed(true);
    }, 4300);
    return () => window.clearTimeout(timeout);
  }, [error, ready]);
  if (dismissed) return null;
  const voices = VOICES[locale] ?? VOICES.EN;
  return (
    <div className="entrance-intro" data-ready={ready || error ? 'true' : 'false'}>
      <div className="entrance-intro__voices" aria-hidden="true">
        {voices.map((voice, index) => (
          <span key={voice} style={{ '--voice-index': index } as CSSProperties}>
            {voice}
          </span>
        ))}
      </div>
      <output className="entrance-intro__percentage" aria-live="polite">
        [{progress}%]
      </output>
      <div className="entrance-intro__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  );
}
