import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowIcon } from './ArrowIcon';
import { useEntranceReveal } from '@/hooks/animation/useEntranceReveal';
import { useLanguage } from '../../providers/LanguageProvider';
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

const STEPS: StepDef[] = [
  {
    id: 'name',
    label: 'YOUR NAME',
    inputType: 'text',
    connector: 'Hi Antonio, my name is ',
    placeholder: 'your name',
  },
  {
    id: 'type',
    label: 'PROJECT TYPE',
    inputType: 'select',
    connector: '. I need a ',
    placeholder: 'project type',
    options: ['website', 'brand identity', 'product design', 'campaign'],
  },
  {
    id: 'client',
    label: 'CLIENT',
    inputType: 'select',
    connector: ' for a ',
    placeholder: 'client type',
    options: ['startup', 'studio', 'company', 'personal project'],
  },
  {
    id: 'focus',
    label: 'MAIN FOCUS',
    inputType: 'select',
    connector: ', focused on ',
    placeholder: 'main focus',
    options: ['UI design', 'UX strategy', 'brand identity', 'performance'],
  },
  {
    id: 'budget',
    label: 'BUDGET',
    inputType: 'select',
    connector: '. Budget ',
    placeholder: 'budget',
    options: ['under 3k', '3–8k', '8–20k', '20k+'],
  },
  {
    id: 'timeline',
    label: 'TIMELINE',
    inputType: 'select',
    connector: ', in ',
    placeholder: 'timeline',
    options: ['1–2 weeks', '1–2 months', '3–6 months', 'flexible'],
  },
  {
    id: 'email',
    label: 'YOUR EMAIL',
    inputType: 'email',
    connector: 'Reach me at ',
    placeholder: 'your@email.com',
  },
];

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SELECT_PROMPTS: Partial<Record<StepId, string>> = {
  type: 'project type',
  client: 'client',
  focus: 'focus',
  budget: 'budget range',
  timeline: 'timeline',
};

interface TypingTextProps {
  value: string;
}

interface TypingTextWithCompleteProps extends TypingTextProps {
  onComplete?: () => void;
}

const TypingText = ({ value, onComplete }: TypingTextWithCompleteProps) => {
  const [visibleLength, setVisibleLength] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setVisibleLength(0);
    if (!value) {
      onCompleteRef.current?.();
      return;
    }

    let nextLength = 0;
    let timeoutId: number | undefined;

    const typeNextCharacter = () => {
      nextLength += 1;
      setVisibleLength(nextLength);

      if (nextLength >= value.length) {
        onCompleteRef.current?.();
        return;
      }

      const nextChar = value[nextLength] ?? '';
      const delay = nextChar === ' ' ? 14 : /[.,]/.test(nextChar) ? 70 : 22;
      timeoutId = window.setTimeout(typeNextCharacter, delay);
    };

    timeoutId = window.setTimeout(typeNextCharacter, 80);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [value]);

  return (
    <>
      {value.slice(0, visibleLength)}
      {visibleLength < value.length && (
        <span aria-hidden className="contact-builder-cursor">
          |
        </span>
      )}
    </>
  );
};

const StaticAnswer = ({ value }: TypingTextProps) => (
  <span className="inline font-[700] underline underline-offset-[6px] decoration-[var(--text-primary)]">
    {value}
  </span>
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
}

const SelectStack = ({ step, onSelect, compact = false }: SelectStackProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const prompt = SELECT_PROMPTS[step.id] ?? `choose ${step.placeholder}`;

  return (
    <span className="relative inline-block align-baseline">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline font-[600] underline underline-offset-[5px] decoration-[var(--text-primary)] text-left text-[var(--text-primary)] opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]"
        style={{
          fontSize: 'inherit',
          letterSpacing: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {prompt}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: EXPO }}
            className={
              compact
                ? 'relative inline-flex flex-row flex-nowrap gap-x-2 mt-1'
                : 'absolute left-0 top-full z-20 mt-2 flex min-w-[14rem] flex-col items-start gap-1 bg-[var(--bg-primary)] py-2'
            }
          >
            {step.options!.map((opt, index) => (
              <motion.button
                key={opt}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ delay: index * 0.05, duration: 0.18, ease: EXPO }}
                onClick={() => onSelect(opt)}
                className={compact ? 'dropdown-option compact' : 'dropdown-option'}
              >
                {opt}
              </motion.button>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

async function submitToApi(
  data: Record<string, string>,
): Promise<{ success: boolean; fallback?: string; mailtoHref?: string }> {
  const payload = {
    name: data.name,
    projectType: data.type,
    clientType: data.client,
    focus: data.focus,
    budget: data.budget,
    timeline: data.timeline,
    email: data.email,
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

  const { t } = useLanguage();

  const step = STEPS[stepIndex] as StepDef | undefined;
  const isDone = stepIndex >= STEPS.length;
  const isTypingStep = !isDone && !!step && step.inputType !== 'select';
  const isSelectStep = !isDone && !!step && step.inputType === 'select';
  const isCurrentConnectorTyped = !!step && !!typedConnectors[step.id];

  // Compact spacing values for header context
  const headerSpacing = compact ? 'pt-0 pb-1' : 'pt-16 md:pt-24 pb-8';
  const contentPadding = compact ? 'pt-0 pb-1' : 'pt-2 pb-4';

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
      const result = await submitToApi(d);

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
      setSubmissionError(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.',
      );
    }
  }, [data]);

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
      className={`flex flex-col h-full min-h-0 justify-between${compact ? ' contact-form-experience--compact' : ''}`}
    >
      {!isDone && step && submissionState === 'idle' && (
        <div data-entrance-item className={`shrink-0 ${headerSpacing} flex items-center gap-3`}>
          <span className="contact-step-number">[{stepIndex + 1}]</span>
          <span className="contact-step-label">{step.label}</span>
        </div>
      )}

      <div
        ref={contentRef}
        data-entrance-item
        className={`flex-1 min-h-0 overflow-y-auto hide-scrollbar ${contentPadding}`}
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
              Message sent. Thank you! ✌️
            </p>
            <p className="text-[var(--text-muted)] text-base mb-6">
              I'll get back to you soon at{' '}
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
                Sending message...
              </span>
            </p>
            <p className="text-[var(--text-muted)] text-base">Hold tight — this takes a second.</p>
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
            {STEPS.slice(0, stepIndex).map((s) => (
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
                  <SelectStack step={step} onSelect={advance} compact={compact} />
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
                  <span className="inline relative" style={{ paddingRight: '1.5rem' }}>
                    <span
                      className="inline-grid"
                      style={{
                        verticalAlign: 'baseline',
                        minWidth: '6ch',
                      }}
                    >
                      <span
                        aria-hidden
                        className="inline-block invisible pointer-events-none font-bold"
                      >
                        {inputValue || step.placeholder}
                      </span>
                      <input
                        ref={inputRef}
                        type={step.inputType}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputValue.trim()) advance(inputValue.trim());
                        }}
                        placeholder={step.placeholder}
                        autoComplete="off"
                        autoCapitalize="words"
                        className="absolute inset-0 w-full bg-transparent outline-none font-bold text-inherit tracking-inherit leading-inherit placeholder:text-inherit placeholder:opacity-25 placeholder:font-normal"
                        style={{
                          color: 'var(--text-primary)',
                          caretColor: 'var(--text-primary)',
                        }}
                      />
                    </span>

                    {inputValue.trim() && <span className="input-enter-hint">[Enter]</span>}
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
