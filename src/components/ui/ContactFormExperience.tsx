import { useState, useRef, useEffect, useCallback, memo, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowIcon } from './ArrowIcon';
import { useEntranceReveal } from '@/hooks/animation/useEntranceReveal';
import { useLanguage } from '../../providers/LanguageProvider';
import { createTextEnterTimeline } from '@/motion/TextRevealMotion';
import { useReducedMotionPreference } from '@/providers/MotionPreferenceProvider';
import './ContactFormExperience.css';

type StepId = 'name' | 'type' | 'client' | 'focus' | 'budget' | 'timeline' | 'email';

interface StepDef {
  id: StepId;
  label: string;
  inputType: 'text' | 'email' | 'select';
  options?: string[];
  placeholder: string;
  connector: string;
}

type Translate = (key: string) => string;

function getSteps(t: Translate, compact = false): StepDef[] {
  return [
    {
      id: 'name',
      label: t('contact.form.name.label'),
      inputType: 'text',
      connector: t('contact.form.name.connector'),
      placeholder: t('contact.form.name.placeholder'),
    },
    {
      id: 'type',
      label: t('contact.form.type.label'),
      inputType: 'select',
      connector: t('contact.form.type.connector'),
      placeholder: t('contact.form.type.placeholder'),
      options: compact
        ? [
            t('contact.form.compact.type.option.web'),
            t('contact.form.compact.type.option.brand'),
            t('contact.form.compact.type.option.product'),
          ]
        : ['website', 'brand identity', 'product design'].map((option) =>
            t(`contact.form.type.option.${option.replaceAll(' ', '-')}`),
          ),
    },
    {
      id: 'client',
      label: t('contact.form.client.label'),
      inputType: 'select',
      connector: t('contact.form.client.connector'),
      placeholder: t('contact.form.client.placeholder'),
      options: ['startup', 'studio', 'company'].map((option) =>
        t(`contact.form.client.option.${option.replaceAll(' ', '-')}`),
      ),
    },
    {
      id: 'focus',
      label: t('contact.form.focus.label'),
      inputType: 'select',
      connector: t('contact.form.focus.connector'),
      placeholder: t('contact.form.focus.placeholder'),
      options: compact
        ? [
            t('contact.form.compact.focus.option.ui'),
            t('contact.form.compact.focus.option.ux'),
            t('contact.form.compact.focus.option.brand'),
          ]
        : ['UI design', 'UX strategy', 'brand identity'].map((option) =>
            t(`contact.form.focus.option.${option.toLowerCase().replaceAll(' ', '-')}`),
          ),
    },
    {
      id: 'budget',
      label: t('contact.form.budget.label'),
      inputType: 'select',
      connector: t('contact.form.budget.connector'),
      placeholder: t('contact.form.budget.placeholder'),
      options: compact
        ? [
            t('contact.form.compact.budget.option.under-3k'),
            t('contact.form.compact.budget.option.3-8k'),
            t('contact.form.compact.budget.option.8-20k'),
          ]
        : ['under-3k', '3-8k', '8-20k'].map((option) => t(`contact.form.budget.option.${option}`)),
    },
    {
      id: 'timeline',
      label: t('contact.form.timeline.label'),
      inputType: 'select',
      connector: t('contact.form.timeline.connector'),
      placeholder: t('contact.form.timeline.placeholder'),
      options: compact
        ? [
            t('contact.form.compact.timeline.option.1-2w'),
            t('contact.form.compact.timeline.option.1-2m'),
            t('contact.form.compact.timeline.option.flexible'),
          ]
        : ['1-2-weeks', '1-2-months', 'flexible'].map((option) =>
            t(`contact.form.timeline.option.${option}`),
          ),
    },
    {
      id: 'email',
      label: t('contact.form.email.label'),
      inputType: 'email',
      connector: t('contact.form.email.connector'),
      placeholder: t('contact.form.email.placeholder'),
    },
  ];
}

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const capitalizeFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface TypingTextProps {
  value: string;
}

interface TypingTextWithCompleteProps extends TypingTextProps {
  onComplete?: () => void;
}

const TypingText = ({ value, onComplete }: TypingTextWithCompleteProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useLayoutEffect(() => {
    if (!ref.current) return;
    const timeline = createTextEnterTimeline([ref.current], {
      mobile: window.matchMedia('(max-width: 767px)').matches,
      reducedMotion,
    });
    if (reducedMotion) completeRef.current?.();
    else timeline.eventCallback('onComplete', () => completeRef.current?.());
    return () => {
      timeline.kill();
    };
  }, [value, reducedMotion]);
  return (
    <span ref={ref} className="contact-text-reveal">
      {value}
    </span>
  );
};

const StaticAnswer = ({ value }: TypingTextProps) => (
  <span className="contact-answer">{value}</span>
);

interface CompletedStepPhraseProps {
  step: StepDef;
  value: string;
  isConnectorTyped: boolean;
  onConnectorTyped: (stepId: StepId) => void;
}

const CompletedStepPhrase = memo(
  ({ step, value, isConnectorTyped, onConnectorTyped }: CompletedStepPhraseProps) => {
    const handleConnectorComplete = useCallback(() => {
      onConnectorTyped(step.id);
    }, [onConnectorTyped, step.id]);

    return (
      <span className="inline">
        {isConnectorTyped ? (
          step.connector
        ) : (
          <TypingText value={step.connector} onComplete={handleConnectorComplete} />
        )}
        {isConnectorTyped && <StaticAnswer value={value} />}
      </span>
    );
  },
);

CompletedStepPhrase.displayName = 'CompletedStepPhrase';

interface SelectStackProps {
  step: StepDef;
  onSelect: (value: string) => void;
  compact?: boolean;
  prompt: string;
}

const SelectStack = ({ step, onSelect, compact = false, prompt }: SelectStackProps) => {
  const optionsRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotionPreference();
  useLayoutEffect(() => {
    if (!optionsRef.current) return;
    const options = Array.from(optionsRef.current.children) as HTMLButtonElement[];
    const timeline = createTextEnterTimeline(options, {
      mobile: window.matchMedia('(max-width: 767px)').matches,
      reducedMotion,
    });
    options[0]?.focus({ preventScroll: true });
    return () => {
      timeline.kill();
    };
  }, [step.id, reducedMotion]);

  return (
    <span className="contact-select">
      <span className="contact-select-trigger">{prompt}</span>
      <span
        ref={optionsRef}
        role="group"
        aria-label={step.label.toLowerCase()}
        className="contact-select-options"
      >
        {step.options!.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={compact ? 'dropdown-option compact' : 'dropdown-option'}
          >
            {capitalizeFirst(option)}
          </button>
        ))}
      </span>
    </span>
  );
};

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

async function submitToApi(
  data: Record<string, string>,
  locale: 'EN' | 'IT',
): Promise<{ success: boolean; fallback?: string; mailtoHref?: string }> {
  const payload = {
    name: data.name,
    projectType: data.type,
    clientType: data.client,
    focus: data.focus,
    budget: data.budget,
    timeline: data.timeline,
    email: data.email,
    locale,
  };

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return response.json();
}

export const ContactFormExperience = ({ compact = false }: { compact?: boolean }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<Record<StepId, string>>>({});
  const [inputValue, setInputValue] = useState('');
  const [typedConnectors, setTypedConnectors] = useState<Partial<Record<StepId, boolean>>>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const entranceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEntranceReveal(entranceRef, {
    selector: '[data-entrance-item]',
    y: 14,
    blur: 4,
    stagger: 0.1,
    duration: 0.55,
    start: 'top 92%',
    disabled: compact,
  });

  const { locale, t } = useLanguage();
  const localeRef = useRef(locale);
  const steps = getSteps(t, compact);

  const step = steps[stepIndex] as StepDef | undefined;
  const isDone = stepIndex >= steps.length;
  const isTypingStep = !isDone && !!step && step.inputType !== 'select';
  const isSelectStep = !isDone && !!step && step.inputType === 'select';
  const isCurrentConnectorTyped = !!step && !!typedConnectors[step.id];

  // Compact spacing values for header context
  const headerSpacing = compact ? 'pt-0 pb-1' : 'pt-16 md:pt-24 pb-8';
  const contentPadding = compact ? 'pt-0 pb-1' : 'pt-2 pb-4';

  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;
    setStepIndex(0);
    setData({});
    setInputValue('');
    setTypedConnectors({});
    setSubmissionState('idle');
    setSubmissionError(null);
  }, [locale]);

  useEffect(() => {
    if (step && step.inputType !== 'select' && isCurrentConnectorTyped) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isCurrentConnectorTyped, step]);

  useEffect(() => {
    if (submissionState === 'success' && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [submissionState]);

  const markConnectorTyped = useCallback((stepId: StepId) => {
    setTypedConnectors((prev) => (prev[stepId] ? prev : { ...prev, [stepId]: true }));
  }, []);

  const handleCurrentConnectorComplete = useCallback(() => {
    if (step) {
      markConnectorTyped(step.id);
    }
  }, [markConnectorTyped, step]);

  const advance = useCallback(
    (value: string) => {
      if (!step || !value.trim()) return;
      setData((prev) => ({ ...prev, [step.id]: value }));
      setInputValue('');
      setStepIndex((i) => i + 1);
    },
    [step],
  );

  const handleSend = useCallback(async () => {
    const d = data as Record<StepId, string>;
    setSubmissionState('loading');
    setSubmissionError(null);

    try {
      const result = await submitToApi(d, locale);

      if (result.success && !result.fallback) {
        setSubmissionState('success');
      } else if (result.fallback === 'mailto' && result.mailtoHref) {
        window.location.href = result.mailtoHref;
        setSubmissionState('success');
      } else {
        setSubmissionState('success');
      }
    } catch (err) {
      console.error('Contact submission failed:', err);
      setSubmissionState('error');
      setSubmissionError(err instanceof Error ? err.message : t('contact.form.error.detail'));
    }
  }, [data, locale, t]);

  const handleReset = useCallback(() => {
    setStepIndex(0);
    setData({});
    setInputValue('');
    setTypedConnectors({});
    setSubmissionState('idle');
    setSubmissionError(null);
  }, []);

  return (
    <div
      ref={entranceRef}
      className={`contact-form-experience flex flex-col h-full min-h-0 justify-between${compact ? ' contact-form-experience--compact' : ''}`}
    >
      {!isDone && step && submissionState === 'idle' && (
        <div data-entrance-item className={`shrink-0 ${headerSpacing} flex items-center gap-3`}>
          <span className="contact-step-label">[{step.label}]</span>
          <span className="sr-only" aria-live="polite">
            {t('contact.form.step')} {stepIndex + 1} {t('contact.form.of')} {steps.length}:{' '}
            {step.label.toLowerCase()}
          </span>
        </div>
      )}

      <div
        ref={contentRef}
        data-entrance-item
        className={`contact-form-content flex-1 min-h-0 ${contentPadding}`}
        aria-live="polite"
        aria-busy={submissionState === 'loading'}
      >
        {submissionState === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO }}
          >
            <p
              className="font-[400] text-[var(--text-primary)] mb-4 sentence-line"
              style={{
                letterSpacing: '-0.015em',
                lineHeight: '1.35',
              }}
            >
              {t('contact.form.success.title')}
            </p>
            <p className="text-[var(--text-muted)] text-base mb-6">
              {t('contact.form.success.detail')}{' '}
              <span className="font-[500] text-[var(--text-primary)]">{data.email}</span>.
            </p>
            <motion.button
              onClick={handleReset}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EXPO, delay: 0.3 }}
              className="group inline-flex items-center gap-2 font-[500] text-sm text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="relative hover-underline">{t('cta.send-another')}</span>
              <ArrowIcon size={12} />
            </motion.button>
          </motion.div>
        )}

        {submissionState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO }}
          >
            <p
              className="font-[400] text-[var(--text-primary)] mb-4 sentence-line"
              style={{
                letterSpacing: '-0.015em',
                lineHeight: '1.35',
              }}
            >
              {t('contact.couldnt-send')}
            </p>
            <p className="text-[var(--text-muted)] text-base mb-2">
              {submissionError || t('contact.something-wrong')}
            </p>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleReset}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EXPO, delay: 0.3 }}
                className="group inline-flex items-center gap-2 font-[500] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="relative hover-underline">{t('cta.start-over')}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {submissionState === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EXPO }}
          >
            <p
              className="font-[400] text-[var(--text-primary)] mb-2 sentence-line"
              style={{
                letterSpacing: '-0.015em',
                lineHeight: '1.35',
              }}
            >
              <span className="inline-flex items-center gap-3">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('contact.form.loading.title')}
              </span>
            </p>
            <p className="text-[var(--text-muted)] text-base">{t('contact.form.loading.detail')}</p>
          </motion.div>
        )}

        {submissionState === 'idle' && (
          <div
            className="sentence-line leading-[1.4]"
            style={{
              letterSpacing: '-0.008em',
              overflowWrap: 'break-word',
              wordBreak: 'normal',
            }}
          >
            {steps.slice(0, stepIndex).map((s) => (
              <CompletedStepPhrase
                key={s.id}
                step={s}
                value={data[s.id] ?? ''}
                isConnectorTyped={!!typedConnectors[s.id]}
                onConnectorTyped={markConnectorTyped}
              />
            ))}

            {!isDone && step && isSelectStep && (
              <motion.span
                key={step.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EXPO }}
                className="inline"
              >
                {isCurrentConnectorTyped ? (
                  step.connector
                ) : (
                  <TypingText value={step.connector} onComplete={handleCurrentConnectorComplete} />
                )}
                {isCurrentConnectorTyped && (
                  <SelectStack
                    step={step}
                    onSelect={advance}
                    compact={compact}
                    prompt={t(`contact.form.${step.id}.prompt`)}
                  />
                )}
              </motion.span>
            )}

            {step?.id === 'email' && <span className="inline">. </span>}
            {!isDone && step && !isSelectStep && (
              <motion.span
                key={step.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EXPO }}
                className={step.id === 'email' ? 'block' : 'inline'}
              >
                {isCurrentConnectorTyped ? (
                  step.connector
                ) : (
                  <TypingText value={step.connector} onComplete={handleCurrentConnectorComplete} />
                )}

                {isTypingStep && isCurrentConnectorTyped && (
                  <span className="contact-input-group">
                    <span className="contact-input-field">
                      <span aria-hidden="true" className="contact-input-mirror">
                        {inputValue || step.placeholder}
                      </span>
                      <input
                        ref={inputRef}
                        type={step.inputType}
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                            event.preventDefault();
                            if (event.currentTarget.checkValidity()) advance(inputValue.trim());
                            else event.currentTarget.reportValidity();
                          }
                        }}
                        required
                        size={1}
                        placeholder={step.placeholder}
                        aria-label={step.label.toLowerCase()}
                        autoComplete={step.id === 'email' ? 'email' : 'name'}
                        autoCapitalize={step.id === 'email' ? 'none' : 'words'}
                        inputMode={step.id === 'email' ? 'email' : 'text'}
                        className="contact-input"
                      />
                    </span>
                    {inputValue.trim() && (
                      <button
                        type="button"
                        className="contact-continue"
                        aria-label={t('contact.form.continue')}
                        onClick={() => {
                          if (inputRef.current?.reportValidity()) advance(inputValue.trim());
                        }}
                      >
                        <span aria-hidden="true">[Enter]</span>
                      </button>
                    )}
                  </span>
                )}
              </motion.span>
            )}

            {isDone && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EXPO }}
                className="block mt-2"
              >
                <motion.button
                  type="button"
                  onClick={handleSend}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EXPO }}
                  className="group inline-flex items-center gap-2 font-[600] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                  style={{ verticalAlign: 'middle' }}
                >
                  <span className="relative hover-underline">
                    <span className="text-[length:var(--text-base)] font-[600] leading-[1.4] tracking-[-0.005em]">
                      {t('cta.send-message')}
                    </span>
                  </span>
                  <span className="w-3 h-3 transform transition-transform duration-300 ease-out group-hover:-rotate-45 origin-center">
                    <ArrowIcon size={12} />
                  </span>
                </motion.button>
              </motion.span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
