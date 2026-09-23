import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

type EntranceState = 'pending' | 'playing' | 'settled';

/** One entrance per mounted project; scroll motion owns a separate inner wrapper. */
export function useProjectGalleryEntrance(
  viewportRef: RefObject<HTMLDivElement | null>,
  cardsRef: RefObject<Array<HTMLButtonElement | null>>,
  phase: 'idle' | 'opening' | 'project' | 'closing',
  reducedMotion: boolean,
  filter: string,
  revealReady: boolean,
  enteredThroughRotation: boolean,
) {
  const [introComplete, setIntroComplete] = useState(false);
  const [entrance, setEntrance] = useState<EntranceState>('pending');
  const played = useRef(false);
  const previousFilter = useRef(filter);
  const timer = useRef<number | undefined>(undefined);
  const transitionCards = useRef<HTMLButtonElement[]>([]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || phase !== 'opening') return;
    const cards = (cardsRef.current ?? []).filter((card): card is HTMLButtonElement =>
      Boolean(card),
    );
    const firstIndex = Math.max(
      0,
      cards.findIndex((card) => card.offsetLeft >= viewport.scrollLeft - 1),
    );
    const group = cards.slice(firstIndex, firstIndex + 3);
    const first = group[0];
    const last = group.at(-1);
    if (!first || !last) return;
    const padding = parseFloat(getComputedStyle(first.parentElement!).paddingLeft) || 0;
    const span = last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const fit = Math.min(1, (viewport.clientWidth - padding * 2) / Math.max(span, 1));
    viewport.style.setProperty('--project-gallery-fit', `${fit}`);
    viewport.style.setProperty('--project-gallery-origin', `${viewport.scrollLeft + padding}px`);
    transitionCards.current = group;
  }, [cardsRef, viewportRef, phase]);

  useEffect(() => {
    const ready = () => setIntroComplete(true);
    window.addEventListener('portfolio:intro-complete', ready);
    if (document.documentElement.dataset.introComplete === 'true') ready();
    return () => window.removeEventListener('portfolio:intro-complete', ready);
  }, []);

  useLayoutEffect(() => {
    const filterChanged = previousFilter.current !== filter;
    previousFilter.current = filter;
    if (reducedMotion || phase === 'closing' || filterChanged) {
      window.clearTimeout(timer.current);
      played.current = true;
      setEntrance('settled');
      return;
    }

    // Home -> Project already revealed the media while the shared 3D scene
    // was rotating. Do not replay a second curtain after the route endpoint.
    if (enteredThroughRotation && phase === 'project') {
      window.clearTimeout(timer.current);
      played.current = true;
      setEntrance('settled');
      return;
    }

    if (played.current || !revealReady || !introComplete) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Selection has already been positioned. Only the visible composition staggers.
    // Layout coordinates remain stable while the entire plane is still rotating.
    const left = viewport.scrollLeft;
    const right = left + viewport.clientWidth;
    const visible = (cardsRef.current ?? [])
      .filter((card): card is HTMLButtonElement => Boolean(card))
      .filter(
        (card) =>
          transitionCards.current.includes(card) ||
          (card.offsetLeft + card.offsetWidth > left + 1 && card.offsetLeft < right - 1),
      )
      .sort((a, b) => a.offsetLeft - b.offsetLeft);
    const stagger = window.matchMedia('(max-width: 767px)').matches ? 65 : 90;
    visible.forEach((card, index) => {
      card.dataset.entranceVisible = 'true';
      card.style.setProperty('--project-reveal-delay', `${Math.min(index * stagger, 270)}ms`);
    });
    played.current = true;
    setEntrance('playing');

    // Release animation fill modes after the longest image has reached its endpoint.
    timer.current = window.setTimeout(() => setEntrance('settled'), 1400);
  }, [
    cardsRef,
    viewportRef,
    phase,
    reducedMotion,
    introComplete,
    filter,
    revealReady,
    enteredThroughRotation,
  ]);

  useEffect(() => {
    const settle = () => {
      if (!played.current) return;
      window.clearTimeout(timer.current);
      setEntrance('settled');
    };
    window.addEventListener('resize', settle);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('resize', settle);
    };
  }, []);

  return reducedMotion ? 'settled' : entrance;
}
