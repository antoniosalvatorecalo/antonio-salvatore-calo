// Verifica l'intro della home (EntranceIntro): copertura iniziale, pila con contatore,
// placement nelle miniature, testi solo alla fine; pagine interne e reduced motion senza pila.
import assert from 'node:assert/strict';
import path from 'node:path';

import { artifactsDir, launchChromium } from './lib/browser.mjs';

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:4173';
const sizes = [
  { width: 1471, height: 645 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 375, height: 812 },
];
const screenshotDir = artifactsDir('preloader');

const browser = await launchChromium();
const summaries = [];

async function installTrace(page) {
  await page.addInitScript(() => {
    window.__introTrace = { events: [], maxCards: 0, counters: new Set(), textBeforeEnd: false };
    new MutationObserver(() => {
      const trace = window.__introTrace;
      trace.maxCards = Math.max(
        trace.maxCards,
        document.querySelectorAll('.entrance-intro__card').length,
      );
      const counter = document.querySelector('.entrance-intro__counter')?.textContent;
      if (counter) trace.counters.add(counter);
    }).observe(document, { childList: true, subtree: true, characterData: true });
    window.addEventListener('portfolio:intro-complete', () => {
      window.__introTrace.events.push({
        at: performance.now(),
        cards: document.querySelectorAll('.entrance-intro__card').length,
      });
    });
  });
}

async function stubExternalRequests(page) {
  const localOrigin = new URL(baseURL).origin;
  await page.route('**/*', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    // Vercel Analytics esiste solo su Vercel: in `vite preview` darebbe 404 in console.
    if (url.pathname.startsWith('/_vercel/'))
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    if (url.origin === localOrigin) return route.continue();
    if (request.resourceType() === 'image') {
      return route.fulfill({
        status: 200,
        contentType: 'image/gif',
        body: Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64'),
      });
    }
    return route.fulfill({ status: 200, contentType: 'text/html', body: '' });
  });
}

async function openPage(options, url = baseURL) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await stubExternalRequests(page);
  await installTrace(page);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return { context, page, errors };
}

try {
  for (const size of sizes) {
    const { context, page, errors } = await openPage({
      viewport: size,
      reducedMotion: 'no-preference',
    });

    // 1. Copertura: dall'HTML iniziale la pagina è nascosta sotto lo sfondo del sito.
    await page.locator('.entrance-intro').waitFor();
    const initial = await page.evaluate(() => ({
      phase: document.querySelector('.entrance-intro').dataset.phase,
      cover: getComputedStyle(document.querySelector('.entrance-intro')).backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
      complete: document.documentElement.dataset.introComplete,
    }));
    assert.equal(initial.complete, undefined, 'introComplete must be absent at first paint');
    // su un caricamento veloce la pila può essere già partita (copertura trasparente)
    if (initial.phase === 'cover')
      assert.equal(initial.cover, initial.body, 'intro cover must match the page background');

    // 2. Pila: le carte scorrono al centro con il contatore, testi e griglia ancora nascosti.
    await page.locator('.entrance-intro[data-phase="playing"]').waitFor({ timeout: 8000 });
    await page.waitForTimeout(900);
    const playing = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.entrance-intro__card')];
      const frame = cards.at(-1)?.getBoundingClientRect();
      return {
        complete: document.documentElement.dataset.introComplete,
        cards: cards.length,
        centered: frame
          ? Math.abs(frame.left + frame.width / 2 - innerWidth / 2) < 2 &&
            Math.abs(frame.top + frame.height / 2 - innerHeight / 2) < 2
          : false,
        counter: document.querySelector('.entrance-intro__counter')?.textContent ?? '',
        hiddenThumbs: [...document.querySelectorAll('.gallery-grid-item')].filter(
          (item) => item.style.visibility === 'hidden',
        ).length,
      };
    });
    assert.equal(playing.complete, undefined, 'header text must wait for the placement');
    assert.ok(playing.cards > 0, 'the deck must create cards from the gallery');
    assert.ok(playing.centered, 'the deck frame must sit in the viewport centre');
    assert.match(playing.counter, /^\[\d{1,3}%\]$/, 'counter must read like [42%]');
    assert.equal(playing.hiddenThumbs, playing.cards, 'each card hides its own thumbnail');
    await page.screenshot({
      path: path.join(screenshotDir, `deck-${size.width}x${size.height}.png`),
    });

    // 3. Fine: un solo evento, carte rimosse, miniature visibili e già aperte, testi visibili.
    await page.waitForFunction(
      () => document.documentElement.dataset.introComplete === 'true',
      null,
      {
        timeout: 20000,
      },
    );
    await page.locator('.entrance-intro').waitFor({ state: 'detached', timeout: 3000 });
    await page.waitForTimeout(1200);
    const finalState = await page.evaluate(() => {
      const trace = window.__introTrace;
      const bio = document.querySelector('.site-header-bio');
      const bioStyle = bio ? getComputedStyle(bio) : null;
      return {
        events: trace.events.length,
        counterReached100: trace.counters.has('[100%]'),
        running: document.documentElement.dataset.introRunning ?? null,
        hiddenThumbs: [...document.querySelectorAll('.gallery-grid-item')].filter(
          (item) => item.style.visibility === 'hidden',
        ).length,
        closedThumbs: [...document.querySelectorAll('.gallery-grid .gallery-media-reveal')]
          .filter((el) => el.getBoundingClientRect().top < innerHeight)
          .filter(
            (el) => !/^(none|inset\(0(px)? 0(px)? 0(px|%)?\))$/.test(getComputedStyle(el).clipPath),
          ).length,
        bioVisible: bioStyle
          ? bioStyle.opacity === '1' && !bioStyle.clipPath.includes('100%')
          : false,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(finalState.events, 1, 'intro completion event must fire exactly once');
    assert.ok(finalState.counterReached100, 'counter must reach [100%]');
    assert.equal(finalState.running, null, 'introRunning must be cleared');
    assert.equal(finalState.hiddenThumbs, 0, 'every thumbnail must be visible after the intro');
    assert.equal(finalState.closedThumbs, 0, 'thumbnails must not replay their reveal');
    assert.ok(finalState.bioVisible, 'header bio must be visible after the intro');
    assert.equal(finalState.overflow, false);
    assert.deepEqual(errors, [], `browser console errors: ${errors.join(' | ')}`);
    await page.screenshot({
      path: path.join(screenshotDir, `home-${size.width}x${size.height}.png`),
    });

    summaries.push({ size, cards: playing.cards, ...finalState });
    await context.close();
  }

  // Pagina interna: niente pila, l'intro si chiude appena i dati sono pronti.
  const inner = await openPage({ viewport: sizes[1] }, new URL('/contact', baseURL).href);
  await inner.page.locator('.entrance-intro').waitFor({ state: 'detached', timeout: 4000 });
  const innerState = await inner.page.evaluate(() => ({
    complete: document.documentElement.dataset.introComplete,
    maxCards: window.__introTrace.maxCards,
  }));
  assert.equal(innerState.complete, 'true');
  assert.equal(innerState.maxCards, 0, 'inner pages must not play the deck');
  // React #418 (idratazione) sulle pagine interne esiste già prima di questa intro: vedi BACKLOG.
  const innerErrors = inner.errors.filter((message) => !message.includes('React error #418'));
  assert.deepEqual(innerErrors, [], `inner page errors: ${innerErrors.join(' | ')}`);
  await inner.context.close();

  // Reduced motion: niente pila, sblocco immediato.
  const reduced = await openPage({ viewport: sizes[1], reducedMotion: 'reduce' });
  await reduced.page.locator('.entrance-intro').waitFor({ state: 'detached', timeout: 4000 });
  const reducedState = await reduced.page.evaluate(() => ({
    complete: document.documentElement.dataset.introComplete,
    events: window.__introTrace.events.length,
    maxCards: window.__introTrace.maxCards,
  }));
  assert.equal(reducedState.complete, 'true');
  assert.equal(reducedState.events, 1);
  assert.equal(reducedState.maxCards, 0, 'reduced motion must skip the deck');
  assert.deepEqual(reduced.errors, [], `reduced-motion errors: ${reduced.errors.join(' | ')}`);
  await reduced.context.close();

  console.log(
    JSON.stringify(
      {
        screenshots: screenshotDir,
        inner: innerState,
        reducedMotion: reducedState,
        viewports: summaries,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
