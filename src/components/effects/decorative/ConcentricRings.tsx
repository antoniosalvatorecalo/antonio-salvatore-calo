import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { gsap } from '@/lib/gsap-setup';
import './ConcentricRings.css';

interface ConcentricRingsProps {
  className?: string;
  textColor?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  reducedMotion?: boolean;
}

const RING_COUNT = 6; // desktop ring count — unchanged
const MOBILE_RING_COUNT = 4; // mobile ring count
const MOBILE_ANIMATED_RINGS = 4; // all mobile rings spin
const REDUCED_RING_COUNT = 2; // static circles for reduced-motion mode
const TEXT = 'Antonio Salvatore Calò. ';
const DEFAULT_VIEWPORT_SIZE = { width: 390, height: 844 };

const getViewportSize = () => ({
  width: typeof window === 'undefined' ? DEFAULT_VIEWPORT_SIZE.width : window.innerWidth,
  height: typeof window === 'undefined' ? DEFAULT_VIEWPORT_SIZE.height : window.innerHeight,
});

const RESIZE_DEBOUNCE_MS = 300;

const ConcentricRings = forwardRef<HTMLDivElement, ConcentricRingsProps>(
  ({ className = '', textColor = '#0A0A0A', isMobile = false, isTablet = false, reducedMotion = false }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine ring counts based on mode
  const ringCount = reducedMotion
    ? REDUCED_RING_COUNT
    : (isMobile || isTablet) ? MOBILE_RING_COUNT : RING_COUNT;
  const animatedRingCount = reducedMotion
    ? 0
    : (isMobile || isTablet) ? MOBILE_ANIMATED_RINGS : RING_COUNT;

  const { baseRadius, radiusStep } = useMemo(() => {
    // Reduced-motion mode: use fixed small radius — no diagonal calc needed
    if (reducedMotion) {
      return { baseRadius: 60, radiusStep: 50 };
    }

    if (!isMobile && !isTablet) return { baseRadius: 120, radiusStep: 80 };
    const w = viewportSize.width;
    const h = viewportSize.height;
    const diagonal = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
    const sizeMultiplier = isTablet ? 1.45 : 1.0;
    const outerRingRadius = diagonal * 1.05 * sizeMultiplier;
    const step = outerRingRadius / ringCount;
    return { baseRadius: step, radiusStep: step };
  }, [isMobile, isTablet, ringCount, viewportSize.height, viewportSize.width, reducedMotion]);

  useImperativeHandle(ref, () => containerRef.current!);

  // Resize handling — debounced, only for non-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) return; // no resize tracking needed

    if (!isMobile && !isTablet) return;

    const handleResize = () => {
      if (resizeTimer.current !== null) {
        clearTimeout(resizeTimer.current);
      }
      resizeTimer.current = setTimeout(() => {
        resizeTimer.current = null;
        setViewportSize((currentSize) => {
          const nextSize = getViewportSize();
          return currentSize.width === nextSize.width && currentSize.height === nextSize.height
            ? currentSize
            : nextSize;
        });
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer.current !== null) {
        clearTimeout(resizeTimer.current);
      }
    };
  }, [isMobile, isTablet, reducedMotion]);

  // GSAP animation — only when motion is allowed
  useEffect(() => {
    if (reducedMotion) return;

    ctx.current = gsap.context(() => {
      const rings = gsap.utils.toArray<SVGElement>('.orbit-group');
      const maxAnimated = animatedRingCount;
      rings.forEach((ring, i) => {
        if (i >= maxAnimated) return;
        gsap.to(ring, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 14 + i * 7,
          repeat: -1,
          ease: 'none',
          transformOrigin: 'center center',
        });
      });
    }, containerRef);

    return () => {
      if (ctx.current) ctx.current.revert();
    };
  }, [animatedRingCount, reducedMotion]);

  const outerR = baseRadius + (ringCount - 1) * radiusStep;
  const viewBoxSize = outerR * 2.1;

  // Reduced-motion: simple static version
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      >
        <svg
          viewBox="-140 -140 280 280"
          className={isMobile ? "w-full h-full" : "w-[80vmin] h-[80vmin]"}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          role="presentation"
        >
          {Array.from({ length: ringCount }).map((_, i) => {
            const r = baseRadius + i * radiusStep;
            return (
              <circle
                key={`ring-${i}`}
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke={textColor}
                strokeWidth={0.5}
                opacity={0.15}
              />
            );
          })}
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            fontSize={isMobile ? 14 : 18}
            fontWeight={500}
            letterSpacing="0.18em"
            opacity={0.8}
          >
            Antonio Salvatore Calò.
          </text>
        </svg>
      </div>
    );
  }

  // Full animated version (desktop or mobile with motion)
  const fontSizes = isTablet ? [40, 46, 52, 58] : isMobile ? [28, 32, 36, 40] : [28, 32, 36, 40, 44, 48];
  const fontWeights = Array(ringCount).fill(500);
  const letterSpacings = Array(ringCount).fill('0.18em');
  const textOpacities = [0.9, 0.8, 0.7, 0.6];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
    >
      <svg
        viewBox={`${-viewBoxSize / 2} ${-viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`}
        className={isMobile ? "w-full h-full" : "w-[120vmax] h-[120vmax]"}
        preserveAspectRatio={isMobile ? "xMidYMid slice" : "xMidYMid meet"}
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          {Array.from({ length: ringCount }).map((_, i) => {
            const r = baseRadius + i * radiusStep;
            const id = `orbit-path-${i}`;
            return (
              <path
                key={id}
                id={id}
                d={`M ${-r},0 A ${r},${r} 0 1,1 ${r},0 A ${r},${r} 0 1,1 ${-r},0`}
                fill="none"
                stroke="none"
              />
            );
          })}
        </defs>

        {Array.from({ length: ringCount }).map((_, i) => {
          const r = baseRadius + i * radiusStep;
          const circumference = 2 * Math.PI * r;
          const textWidthPerChar = fontSizes[i] * 0.65;
          const spacingPerChar = fontSizes[i] * parseFloat(letterSpacings[i]);
          const singleWidth = TEXT.length * (textWidthPerChar + spacingPerChar);
          const repeats = Math.max(1, Math.ceil(circumference / singleWidth));
          const fullText = TEXT.repeat(repeats);

          return (
            <g key={`ring-${i}`} className="orbit-group">
              <circle
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke={textColor}
                strokeWidth={0.4}
                opacity={0.06}
              />
              <text
                fill={textColor}
                fontSize={fontSizes[i]}
                fontWeight={fontWeights[i]}
                letterSpacing={letterSpacings[i]}
                opacity={textOpacities[Math.min(i, textOpacities.length - 1)]}
              >
                <textPath
                  href={`#orbit-path-${i}`}
                  startOffset="0%"
                  textLength={circumference}
                  lengthAdjust="spacing"
                >
                  {fullText}
                </textPath>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

ConcentricRings.displayName = 'ConcentricRings';

export default ConcentricRings;
