import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { gsap } from '@/lib/gsap-setup';

import { StaggerWipe } from './StaggerWipe';

import './EntranceIntro.css';

interface EntranceIntroProps {
  ready: boolean;
  error: boolean;
}

const PROGRESS_RAMP_MS = 1550;
const PROGRESS_FINISH_MS = 180;
const MIN_PRELOADER_MS = 1800;
const DIGIT_ROLL_DURATION = 0.24;

function emitIntroComplete() {
  document.documentElement.dataset.introComplete = 'true';
  window.dispatchEvent(new CustomEvent('portfolio:intro-complete'));
}

function DigitSlot({
  value,
  delay,
  reducedMotion,
}: {
  value: string;
  delay: number;
  reducedMotion: boolean;
}) {
  const digitRef = useRef<HTMLSpanElement>(null);
  const previousValueRef = useRef(value);

  useLayoutEffect(() => {
    const digit = digitRef.current;
    if (!digit) return;
    const changed = previousValueRef.current !== value;
    previousValueRef.current = value;
    if (reducedMotion) return;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const context = gsap.context(() => {
      gsap.fromTo(
        digit,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: changed ? (mobile ? 0.3 : DIGIT_ROLL_DURATION) : mobile ? 0.34 : 0.38,
          delay: changed ? 0 : delay,
          ease: changed ? 'power3.inOut' : 'power3.out',
          clearProps: 'transform',
        },
      );
    }, digit);
    return () => context.revert();
  }, [delay, reducedMotion, value]);

  return (
    <span className="entrance-intro__digit" aria-label={value}>
      <span ref={digitRef} className="entrance-intro__digit-value" aria-hidden="true">
        {value}
      </span>
    </span>
  );
}

function NumericSequence({
  value,
  prefix,
  delay,
  reducedMotion,
}: {
  value: string;
  prefix: string;
  delay: number;
  reducedMotion: boolean;
}) {
  return (
    <>
      {Array.from(value).map((digit, index) => (
        <DigitSlot
          key={`${prefix}-${index}`}
          value={digit}
          delay={delay + index * 0.025}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}

export function EntranceIntro({ ready, error }: EntranceIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountedAtRef = useRef<number | null>(null);
  const exitStartedRef = useRef(false);
  const completionEmittedRef = useRef(false);
  const removeFrameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [wipeActive, setWipeActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [dateSnapshot, setDateSnapshot] = useState<Date | null>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    mountedAtRef.current = performance.now();
    return () => {
      if (removeFrameRef.current !== null) cancelAnimationFrame(removeFrameRef.current);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = (time: number) => {
      const mountedAt = mountedAtRef.current ?? time;
      const elapsed = time - mountedAt;
      let value: number;
      if (elapsed < PROGRESS_RAMP_MS) {
        const eased = 1 - Math.pow(1 - elapsed / PROGRESS_RAMP_MS, 3);
        value = 92 * eased;
      } else if (ready || error) {
        const finish = Math.min(1, (elapsed - PROGRESS_RAMP_MS) / PROGRESS_FINISH_MS);
        value = 92 + 8 * (1 - Math.pow(1 - finish, 3));
      } else {
        value = 92;
      }
      setProgress(Math.round(value));
      if (value < 100 && (elapsed < PROGRESS_RAMP_MS || ready || error)) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [error, ready]);

  useEffect(() => {
    const updateViewport = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    const initialTime = new Date();
    setDateSnapshot(initialTime);
    setNow(initialTime);
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    window.addEventListener('resize', updateViewport);
    return () => {
      window.clearInterval(clock);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      const timeline = gsap.timeline();
      const reveals: Array<[string, number]> = [
        ['[data-intro-line="name"]', 0.08],
        ['[data-intro-line="role"]', 0.15],
        ['[data-intro-line="website"]', 0.25],
        ['[data-intro-line="viewport"]', 0.4],
        ['[data-intro-line="date"]', 0.55],
        ['[data-intro-line="time"]', 0.68],
        ['[data-intro-line="location"]', 0.82],
      ];
      if (reducedMotion) {
        gsap.set(root.querySelectorAll('[data-intro-line]'), { yPercent: 0, opacity: 1 });
        return;
      }
      for (const [selector, position] of reveals) {
        const target = root.querySelector<HTMLElement>(selector);
        if (!target) continue;
        timeline.fromTo(
          target,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.42,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
          position,
        );
      }
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if ((!ready && !error) || exitStartedRef.current) return;
    exitStartedRef.current = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (!completionEmittedRef.current) {
        completionEmittedRef.current = true;
        emitIntroComplete();
      }
      removeFrameRef.current = requestAnimationFrame(() => setDismissed(true));
      return;
    }
    if (progress < 100) {
      exitStartedRef.current = false;
      return;
    }
    const elapsed = performance.now() - (mountedAtRef.current ?? performance.now());
    const remaining = Math.max(0, MIN_PRELOADER_MS - elapsed);
    const timeout = window.setTimeout(() => setWipeActive(true), remaining);
    return () => window.clearTimeout(timeout);
  }, [error, progress, ready]);

  const handleWipeComplete = useCallback(() => {
    if (completionEmittedRef.current) return;
    completionEmittedRef.current = true;
    emitIntroComplete();
    removeFrameRef.current = requestAnimationFrame(() => setDismissed(true));
  }, []);

  if (dismissed) return null;

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dateValue = dateSnapshot
    ? [dateSnapshot.getDate(), dateSnapshot.getMonth() + 1, dateSnapshot.getFullYear()].map(
        (value, index) => String(value).padStart(index === 2 ? 4 : 2, '0'),
      )
    : null;
  const timeValue = now
    ? [now.getHours(), now.getMinutes(), now.getSeconds()].map((value) =>
        String(value).padStart(2, '0'),
      )
    : null;

  return (
    <div ref={rootRef} className="entrance-intro" data-wipe-active={wipeActive ? 'true' : 'false'}>
      <div className="entrance-intro__identity">
        <div className="entrance-intro__line-mask">
          <strong className="entrance-intro__line-inner" data-intro-line="name">
            Antonio Salvatore Calò
          </strong>
        </div>
        <div className="entrance-intro__line-mask">
          <span className="entrance-intro__line-inner" data-intro-line="role">
            [Digital Frontend Developer]
          </span>
        </div>
        <div className="entrance-intro__line-mask entrance-intro__line-gap">
          <span className="entrance-intro__line-inner" data-intro-line="website">
            Website
          </span>
        </div>
        <div className="entrance-intro__metadata">
          <div className="entrance-intro__line-mask">
            <span className="entrance-intro__line-inner" data-intro-line="viewport">
              {viewport ? `${viewport.width} × ${viewport.height} px` : '\u00a0'}
            </span>
          </div>
          <div className="entrance-intro__line-mask">
            <span
              className="entrance-intro__line-inner entrance-intro__numeric-line"
              data-intro-line="date"
              aria-label={dateValue?.join('.') ?? ''}
            >
              {dateValue ? (
                <>
                  <NumericSequence
                    value={dateValue[0] ?? ''}
                    prefix="day"
                    delay={0.55}
                    reducedMotion={reducedMotion}
                  />
                  <span className="entrance-intro__separator">.</span>
                  <NumericSequence
                    value={dateValue[1] ?? ''}
                    prefix="month"
                    delay={0.62}
                    reducedMotion={reducedMotion}
                  />
                  <span className="entrance-intro__separator">.</span>
                  <NumericSequence
                    value={dateValue[2] ?? ''}
                    prefix="year"
                    delay={0.69}
                    reducedMotion={reducedMotion}
                  />
                </>
              ) : (
                '\u00a0'
              )}
            </span>
          </div>
          <div className="entrance-intro__line-mask">
            <span
              className="entrance-intro__line-inner entrance-intro__numeric-line"
              data-intro-line="time"
              aria-label={timeValue?.join(':') ?? ''}
            >
              {timeValue ? (
                <>
                  <NumericSequence
                    value={timeValue[0] ?? ''}
                    prefix="hour"
                    delay={0.68}
                    reducedMotion={reducedMotion}
                  />
                  <span className="entrance-intro__separator">:</span>
                  <NumericSequence
                    value={timeValue[1] ?? ''}
                    prefix="minute"
                    delay={0.735}
                    reducedMotion={reducedMotion}
                  />
                  <span className="entrance-intro__separator">:</span>
                  <NumericSequence
                    value={timeValue[2] ?? ''}
                    prefix="second"
                    delay={0.79}
                    reducedMotion={reducedMotion}
                  />
                </>
              ) : (
                '\u00a0'
              )}
            </span>
          </div>
          <div className="entrance-intro__line-mask">
            <span className="entrance-intro__line-inner" data-intro-line="location">
              Benevento, [IT]
            </span>
          </div>
        </div>
      </div>

      <div className="entrance-intro__loader" aria-hidden="true">
        <div className="entrance-intro__bar">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>

      <StaggerWipe
        active={wipeActive}
        columns={16}
        color="var(--bg-primary)"
        onComplete={handleWipeComplete}
      />
    </div>
  );
}
