/**
 * AnimationOrchestrator — Synchronous Deterministic State Machine
 *
 * State: idle → visible → playing → done
 * Cascade: markComplete → next = visible → sync _play
 * Late-binding: registerPlayFn fires _play if section already visible
 *
 * STRICTLY SYNCHRONOUS — no queueMicrotask, no async.
 * Every _play call fires immediately, or not at all.
 * The cascade is driven by ScrollTrigger + registerPlayFn late-binding.
 */

export type SectionState = 'idle' | 'visible' | 'playing' | 'done';
export type SectionId =
  | 'hero'
  | 'bio'
  | 'principles'
  | 'services'
  | 'contact'
  | 'about';

const SECTIONS: readonly SectionId[] = [
  'hero',
  'bio',
  'principles',
  'services',
  'contact',
  'about',
] as const;

const SECTION_TYPES: Record<SectionId, 'standard' | 'instant'> = {
  hero: 'instant',
  bio: 'standard',
  principles: 'standard',
  services: 'standard',
  contact: 'standard',
  about: 'standard',
};

function createOrchestrator() {
  const status = new Map<SectionId, SectionState>();
  const playFns = new Map<SectionId, () => void>();

  const init = () => {
    for (const id of SECTIONS) status.set(id, 'idle');
  };

  init();

  const getStatus = (id: SectionId) => status.get(id) ?? 'idle';

  const _canPlay = (id: SectionId): boolean => {
    const idx = SECTIONS.indexOf(id);
    const prev = SECTIONS[idx - 1];
    if (idx === 0) return status.get(id) === 'visible';
    return status.get(id) === 'visible' && status.get(prev) === 'done';
  };

  /** Sync play — idempotent guard: only plays from 'visible' state */
  const _play = (id: SectionId): void => {
    if (status.get(id) !== 'visible') return;

    // Instant sections complete immediately without needing a playFn
    if (SECTION_TYPES[id] === 'instant') {
      status.set(id, 'done');
      _advance(id);
      return;
    }

    const fn = playFns.get(id);
    if (!fn) return;

    status.set(id, 'playing');
    fn();
  };

  /** Sync cascade - try to play the next section only after its ScrollTrigger fired */
  const _advance = (current: SectionId): void => {
    const idx = SECTIONS.indexOf(current);
    const next = SECTIONS[idx + 1];
    if (!next) return;

    if (_canPlay(next)) {
      _play(next);
    }
  };

  /** Mark visible — ScrollTrigger calls this. Sync, no queue. */
  const markVisible = (id: SectionId): void => {
    if (status.get(id) !== 'idle') return;
    status.set(id, 'visible');

    if (_canPlay(id)) {
      _play(id);
    }
  };

  /** Mark complete — called by tl.onComplete. Sync cascade. */
  const markComplete = (id: SectionId): void => {
    if (status.get(id) !== 'playing') return;
    status.set(id, 'done');
    _advance(id);
  };

  /** Register playFn — late-binding: fires immediately if already visible */
  const registerPlayFn = (id: SectionId, fn: () => void): void => {
    playFns.set(id, fn);

    if (status.get(id) === 'visible' && _canPlay(id)) {
      _play(id);
    }
  };

  const deregisterPlayFn = (id: SectionId): void => {
    playFns.delete(id);
  };

  const reset = (): void => init();

  return {
    reset,
    markVisible,
    markComplete,
    registerPlayFn,
    deregisterPlayFn,
    getStatus,
  };
}

export const orchestrator = createOrchestrator();
export { SECTIONS };
