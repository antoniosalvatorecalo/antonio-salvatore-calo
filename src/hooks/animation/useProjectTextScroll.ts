import { useEffect, useState, useContext, useRef, type RefObject } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap-setup";
import { ScrollerContext } from "../../layouts/ProjectBrutalistLayout";
import { logMotionDev, logTriggerCount } from "../../lib/motion-dev-diagnostics";

export const useProjectTextScroll = (
  imageRefs: RefObject<HTMLElement | null>[]
) => {
  const scrollRef = useContext(ScrollerContext);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const hasInitialized = useRef(false);
  const ctxRef = useRef<gsap.Context | null>(null);
  const ownedTriggersRef = useRef<ScrollTrigger[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = scrollRef?.ref.current;
    if (!container) return;

    // Prevent double initialization
    if (hasInitialized.current) {
      logMotionDev("useProjectTextScroll", "init-skipped-already-initialized");
      return;
    }
    hasInitialized.current = true;
    logMotionDev("useProjectTextScroll", "init-scheduled", { delayMs: 300 });

    // Delay to allow React to populate refs
    timerRef.current = setTimeout(() => {
      logMotionDev("useProjectTextScroll", "init-start");

      ctxRef.current = gsap.context(() => {
        imageRefs.forEach((ref, i) => {
          const el = ref.current;
          if (!el) {
            console.warn(`[useProjectTextScroll] ref ${i} is null`);
            return;
          }
          
          const isLast = i === imageRefs.length - 1;
          
          const st = ScrollTrigger.create({
            trigger: el,
            scroller: container,
            start: isLast ? "top bottom" : "top 85%",
            invalidateOnRefresh: true,
            onEnter: () => setVisibleIdx(i),
            onLeaveBack: () => setVisibleIdx(Math.max(0, i - 1)),
          });
          ownedTriggersRef.current.push(st);
        });
      }, container);
      logTriggerCount("useProjectTextScroll", "init-complete", ownedTriggersRef.current.length);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      ownedTriggersRef.current.forEach((st) => st.kill());
      const ownedCount = ownedTriggersRef.current.length;
      ownedTriggersRef.current = [];

      ctxRef.current?.revert();
      ctxRef.current = null;
      hasInitialized.current = false;

      logMotionDev("useProjectTextScroll", "cleanup-complete", { ownedTriggerKills: ownedCount });
    };
  }, [scrollRef?.ref]); // Only depend on scrollRef.ref

  return visibleIdx;
};
