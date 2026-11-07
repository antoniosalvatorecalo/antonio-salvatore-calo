import { useEffect, useRef, useState } from 'react';

import { stripLocale } from '@/i18n/localePath';
import { gsap } from '@/lib/gsap-setup';

import './EntranceIntro.css';

interface EntranceIntroProps {
  ready: boolean;
  error: boolean;
}

type Rect = { left: number; top: number; width: number; height: number };
type Card = { card: HTMLDivElement; img: HTMLImageElement };

const REVEAL = 1.25; // apertura del contenitore con la prima foto
const SLIDE = 0.8; // ogni foto successiva che scorre dentro, una alla volta
const FALLBACK_SHOWN = 5; // foto mostrate se nel CMS nessuna ha "Intro order"
const SAFETY_MS = 15000; // se qualcosa va storto la pagina si sblocca comunque

function emitIntroComplete() {
  document.documentElement.dataset.introComplete = 'true';
  window.dispatchEvent(new CustomEvent('portfolio:intro-complete'));
}

const rectOf = (element: Element): Rect => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
};

/** Miniature della home già impaginate (la griglia può impiegare qualche frame). */
function waitForGridItems(isCancelled: () => boolean): Promise<HTMLElement[]> {
  return new Promise((resolve) => {
    const started = performance.now();
    const poll = () => {
      if (isCancelled()) return resolve([]);
      const items = [...document.querySelectorAll<HTMLElement>('.gallery-grid-item')].filter(
        (item) => item.querySelector('img'),
      );
      const laidOut = (items[0]?.getBoundingClientRect().width ?? 0) > 0;
      if (laidOut || performance.now() - started > 3000) resolve(laidOut ? items : []);
      else window.setTimeout(poll, 50);
    };
    poll();
  });
}

function makeCard(layer: HTMLElement, item: HTMLElement, frame: Rect): Card {
  const source = item.querySelector('img')!;
  const card = document.createElement('div');
  card.className = 'entrance-intro__card';
  const img = document.createElement('img');
  if (source.srcset) img.srcset = source.srcset;
  img.sizes = `${Math.round(frame.width)}px`; // la carta è più grande della miniatura
  img.src = source.currentSrc || source.src;
  img.alt = '';
  card.append(img);
  gsap.set(card, { ...frame, clipPath: 'inset(100% 0% 0% 0%)' });
  layer.append(card);
  return { card, img };
}

/**
 * Le miniature visibili diventano carte impilate in un contenitore fisso al centro. Si vedono
 * scorrere solo quelle con "Intro order" nel CMS (in quell'ordine), con un contatore 0–100;
 * poi tutte volano al proprio posto nella griglia e solo alla fine entrano i testi.
 */
async function buildTimeline(
  layer: HTMLElement,
  hidden: HTMLElement[],
  isCancelled: () => boolean,
): Promise<{ tl: gsap.core.Timeline } | null> {
  const items = await waitForGridItems(isCancelled);
  if (isCancelled() || items.length === 0) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 768;
  const inView = items.filter((item) => {
    const r = item.getBoundingClientRect();
    return r.top < vh && r.bottom > 0 && r.left < vw;
  });
  if (inView.length === 0) return null;

  const introOrder = (item: HTMLElement) => Number(item.dataset.introOrder);
  let shown = inView
    .filter((item) => introOrder(item) > 0)
    .sort((a, b) => introOrder(a) - introOrder(b));
  if (shown.length === 0) shown = inView.slice(0, FALLBACK_SHOWN);
  // in fondo le carte "sepolte" (mai viste), in cima quelle mostrate nell'ordine di entrata
  const deck = [...inView.filter((item) => !shown.includes(item)), ...shown];
  const n = deck.length;
  const buried = n - shown.length;
  const slots = deck.map(rectOf);
  const aspect = slots[0]!.width / slots[0]!.height;
  const width = Math.min(vw * (mobile ? 0.6 : 0.2), vh * 0.5 * aspect);
  const height = width / aspect;
  const frame: Rect = { left: (vw - width) / 2, top: (vh - height) / 2, width, height };

  const cards = deck.map((item) => makeCard(layer, item, frame));
  // aspetta solo la prima foto (max 700 ms): le altre finiscono di caricarsi mentre scorre
  await Promise.race([
    cards[buried]?.img.decode().catch(() => undefined),
    new Promise((resolve) => window.setTimeout(resolve, 700)),
  ]);
  if (isCancelled()) return null;
  for (const item of deck) {
    item.style.visibility = 'hidden';
    hidden.push(item);
  }

  const tl = gsap.timeline({ delay: 0.35 });
  const shownCards = cards.slice(buried);
  shownCards.forEach(({ card, img }, k) => {
    if (k === 0) {
      tl.to(card, { clipPath: 'inset(0% 0% 0% 0%)', duration: REVEAL, ease: 'power4.inOut' }, 0);
      // finisce con l'apertura, così la foto è libera per lo scorrimento successivo
      tl.fromTo(
        img,
        { yPercent: 18, scale: 1.12 },
        { yPercent: 0, scale: 1, duration: REVEAL - 0.05, ease: 'power3.out' },
        0.05,
      );
      return;
    }
    // La nuova foto sale mentre la precedente viene spinta in alto, con la stessa curva:
    // un solo movimento dentro il contenitore fermo. Mai due scorrimenti sovrapposti, se no
    // due tween si contendono la stessa immagine e il movimento scatta.
    const at = REVEAL + (k - 1) * SLIDE;
    const ease = 'power2.inOut';
    tl.to(card, { clipPath: 'inset(0% 0% 0% 0%)', duration: SLIDE, ease }, at);
    tl.fromTo(
      img,
      { yPercent: 25, scale: 1.03 },
      { yPercent: 0, scale: 1, duration: SLIDE, ease },
      at,
    );
    tl.to(shownCards[k - 1]!.img, { yPercent: -25, duration: SLIDE, ease }, at);
  });
  // le sepolte si aprono sotto la prima foto quando questa è già piena: non si vedono
  if (buried > 0) {
    tl.set(
      cards.slice(0, buried).map(({ card }) => card),
      { clipPath: 'inset(0% 0% 0% 0%)' },
      REVEAL,
    );
  }

  const land = REVEAL + Math.max(0, shown.length - 1) * SLIDE + 0.25;

  // contatore [0%]–[100%] a destra, allineato al margine della griglia
  const counter = document.createElement('div');
  counter.className = 'entrance-intro__counter';
  counter.style.right = `${Math.min(...slots.map((slot) => slot.left))}px`;
  const digits = document.createElement('span');
  digits.textContent = '[0%]';
  counter.append(digits);
  layer.append(counter);
  const progress = { value: 0 };
  tl.fromTo(digits, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0);
  tl.to(
    progress,
    {
      value: 100,
      duration: land - 0.3,
      ease: 'power1.inOut',
      onUpdate: () => {
        digits.textContent = `[${Math.round(progress.value)}%]`;
      },
    },
    0,
  );
  tl.to(digits, { yPercent: -100, duration: 0.5, ease: 'power3.in' }, land - 0.2);

  // Le foto già scorse hanno l'immagine spostata in alto: riallineale finché sono coperte,
  // altrimenti all'atterraggio la miniatura vera compare più in basso e la foto "scende".
  tl.set(
    cards.map(({ img }) => img),
    { yPercent: 0, scale: 1 },
    land - 0.05,
  );
  tl.set(
    cards.map(({ card }) => card),
    { clipPath: 'none' },
    land - 0.05,
  );

  // FLIP solo con transform, in ordine di griglia: ogni carta va nella propria miniatura
  const spread = Math.min(0.06, 0.75 / n);
  const fly = mobile ? 1.2 : 1.35;
  const order = deck
    .map((_, i) => i)
    .sort((a, b) => slots[a]!.top - slots[b]!.top || slots[a]!.left - slots[b]!.left);
  order.forEach((i, k) => {
    const end = slots[i]!;
    tl.to(
      cards[i]!.card,
      {
        x: end.left - frame.left,
        y: end.top - frame.top,
        scaleX: end.width / frame.width,
        scaleY: end.height / frame.height,
        duration: fly,
        ease: 'power3.inOut',
      },
      land + k * spread,
    );
  });

  // I testi entrano mentre le ultime foto si posano. Lo stesso segnale sblocca la reveal CSS
  // delle miniature (ProjectIndex.css): va chiusa subito sotto le carte, altrimenti la foto
  // "ritorna" con la tendina. getAnimations() ricalcola gli stili in modo sincrono.
  const finishThumbReveal = () => {
    for (const item of hidden) {
      item
        .querySelector('.gallery-media-reveal')
        ?.getAnimations()
        .forEach((animation) => animation.finish());
    }
  };
  const settled = land + (n - 1) * spread + fly;
  tl.call(
    () => {
      emitIntroComplete();
      finishThumbReveal();
    },
    [],
    settled - 0.35,
  );
  return { tl }; // dentro un oggetto: una Timeline è thenable e await la scarterebbe
}

export function EntranceIntro({ ready, error }: EntranceIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'cover' | 'playing' | 'done'>('cover');

  // Dal primo render: SiteHeader non deve forzare la fine dell'intro mentre è in corso.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.introRunning = 'true';
    return () => {
      delete html.dataset.introRunning;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if ((!ready && !error) || !root) return;
    const html = document.documentElement;
    let cancelled = false;
    let timeline: gsap.core.Timeline | undefined;
    const hidden: HTMLElement[] = [];

    const finish = () => {
      if (cancelled) return;
      timeline?.kill();
      if (html.dataset.introComplete !== 'true') emitIntroComplete();
      for (const item of hidden) item.style.visibility = '';
      delete html.dataset.introRunning;
      setPhase('done');
    };

    const onHome = stripLocale(window.location.pathname).replace(/\/+$/, '') === '';
    if (error || !onHome) {
      finish();
      return;
    }

    const safety = window.setTimeout(finish, SAFETY_MS);
    void buildTimeline(root, hidden, () => cancelled).then((built) => {
      if (cancelled) return;
      if (!built) return finish();
      timeline = built.tl;
      setPhase('playing');
      built.tl.eventCallback('onComplete', finish);
      if (import.meta.env.DEV) Object.assign(window, { __entranceIntroTimeline: built.tl });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      timeline?.kill();
      for (const item of hidden) item.style.visibility = '';
      root.querySelectorAll('.entrance-intro__card, .entrance-intro__counter').forEach((el) => {
        el.remove();
      });
    };
  }, [error, ready]);

  if (phase === 'done') return null;

  return (
    <div
      ref={rootRef}
      className="entrance-intro"
      data-phase={phase}
      aria-hidden="true"
      role="presentation"
    />
  );
}
