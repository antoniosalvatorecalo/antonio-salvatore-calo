import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173';
const sizes = [
  { width: 1471, height: 645 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const screenshotDir = path.join(os.tmpdir(), 'antonio-portfolio-preloader');
await fs.mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const summaries = [];

async function installTrace(page) {
  await page.addInitScript(() => {
    window.__preloaderTrace = { startedAt: performance.now(), wipeActiveAt: null, events: [] };
    const observe = () => {
      const wipe = document.querySelector('.stagger-wipe');
      if (
        wipe?.getAttribute('data-active') === 'true' &&
        window.__preloaderTrace.wipeActiveAt === null
      ) {
        window.__preloaderTrace.wipeActiveAt = performance.now();
      }
    };
    new MutationObserver(observe).observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    window.addEventListener('portfolio:intro-complete', () => {
      const intro = document.querySelector('.entrance-intro');
      const strips = [...document.querySelectorAll('.stagger-wipe__strip')];
      window.__preloaderTrace.events.push({
        at: performance.now(),
        dataset: document.documentElement.dataset.introComplete,
        introMounted: Boolean(intro),
        wipeActive: document.querySelector('.stagger-wipe')?.getAttribute('data-active') === 'true',
        transforms: strips.map((strip) => getComputedStyle(strip).transform),
        scales: strips.map((strip) => new DOMMatrixReadOnly(getComputedStyle(strip).transform).m22),
      });
    });
  });
}

async function stubExternalRequests(page) {
  const localOrigin = new URL(baseURL).origin;
  await page.route('**/*', (route) => {
    const request = route.request();
    if (new URL(request.url()).origin === localOrigin) return route.continue();
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

try {
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: size, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await stubExternalRequests(page);
    await installTrace(page);
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.locator('.entrance-intro').waitFor();

    const initial = await page.evaluate(() => ({
      introBackground: getComputedStyle(document.querySelector('.entrance-intro')).backgroundColor,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      complete: document.documentElement.dataset.introComplete,
      identitySize: getComputedStyle(document.querySelector('.entrance-intro__identity')).fontSize,
      metadataSize: getComputedStyle(document.querySelector('.entrance-intro__metadata')).fontSize,
      width: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    assert.equal(initial.introBackground, 'rgb(10, 10, 10)', 'preloader must paint black');
    assert.equal(
      initial.bodyBackground,
      'rgb(10, 10, 10)',
      'body must paint black before introComplete',
    );
    assert.equal(initial.complete, undefined, 'introComplete must be absent before the wipe');
    assert.ok(
      initial.width <= initial.viewportWidth,
      'preloader must not create horizontal overflow',
    );

    const slug = `${size.width}x${size.height}`;
    await page.waitForTimeout(1350);
    await page.screenshot({ path: path.join(screenshotDir, `${slug}-preloader.png`) });
    await page.locator('.stagger-wipe[data-active="true"]').waitFor({ timeout: 5000 });

    const whileWiping = await page.evaluate(() => ({
      introMounted: Boolean(document.querySelector('.entrance-intro')),
      complete: document.documentElement.dataset.introComplete,
      eventCount: window.__preloaderTrace.events.length,
      revealAnimation: getComputedStyle(document.querySelector('.gallery-media-reveal'))
        .animationName,
      wipeBackground: getComputedStyle(document.querySelector('.stagger-wipe__strip'))
        .backgroundColor,
      homeBackground: getComputedStyle(document.querySelector('.gallery-grid-wrap'))
        .backgroundColor,
    }));
    assert.equal(whileWiping.introMounted, true, 'intro must remain mounted throughout the wipe');
    assert.equal(
      whileWiping.complete,
      undefined,
      'introComplete must remain unset during the wipe',
    );
    assert.equal(whileWiping.eventCount, 0, 'intro event must not fire before full cover');
    assert.equal(
      whileWiping.revealAnimation,
      'none',
      'gallery entrance must stay inactive during the wipe',
    );
    assert.equal(
      whileWiping.wipeBackground,
      whileWiping.homeBackground,
      'wipe and Home surfaces must match',
    );

    await page.waitForFunction(() => {
      const transforms = [...document.querySelectorAll('.stagger-wipe__strip')].map(
        (strip) => getComputedStyle(strip).transform,
      );
      return new Set(transforms).size >= 2;
    });
    await page.waitForFunction(() => {
      const trace = window.__preloaderTrace;
      return trace.wipeActiveAt !== null && performance.now() - trace.wipeActiveAt >= 450;
    });
    await page.screenshot({ path: path.join(screenshotDir, `${slug}-staircase.png`) });
    await page.waitForFunction(() => document.documentElement.dataset.introComplete === 'true');
    const completion = await page.evaluate(() => window.__preloaderTrace.events.at(-1));
    assert.ok(completion, 'completion event must be observed');
    assert.equal(completion.dataset, 'true');
    assert.equal(
      completion.introMounted,
      true,
      'intro must remain mounted when complete is emitted',
    );
    assert.equal(
      completion.wipeActive,
      true,
      'wipe must remain active until the covered frame is handed off',
    );
    assert.equal(completion.transforms.length, 16, 'all 16 columns must be present at completion');
    assert.ok(
      completion.scales.every((scale) => Math.abs(scale - 1) < 0.01),
      'all columns must be fully scaled at completion',
    );
    await page.locator('.entrance-intro').waitFor({ state: 'detached' });
    await page.waitForTimeout(750);
    await page.screenshot({ path: path.join(screenshotDir, `${slug}-home.png`) });
    const finalState = await page.evaluate(() => ({
      events: window.__preloaderTrace.events.length,
      elapsed:
        ((window.__preloaderTrace.events[0]?.at ?? 0) - window.__preloaderTrace.startedAt) / 1000,
      wipeDuration:
        ((window.__preloaderTrace.events[0]?.at ?? 0) - window.__preloaderTrace.wipeActiveAt) /
        1000,
      introRemoved: !document.querySelector('.entrance-intro'),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      galleryScrollbar: getComputedStyle(document.querySelector('.gallery-grid-wrap'))
        .scrollbarWidth,
      galleryScrollbarDisplay: getComputedStyle(
        document.querySelector('.gallery-grid-wrap'),
        '::-webkit-scrollbar',
      ).display,
      centerElement: (() => {
        const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        if (!(element instanceof HTMLElement)) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          className: element.className,
          background: style.backgroundColor,
          color: style.color,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        };
      })(),
    }));
    assert.equal(finalState.events, 1, 'intro completion event must fire exactly once');
    assert.equal(finalState.introRemoved, true);
    assert.equal(finalState.overflow, false);
    if (size.width <= 767) {
      assert.equal(finalState.galleryScrollbar, 'none');
      assert.equal(finalState.galleryScrollbarDisplay, 'none');
    }
    assert.ok(
      finalState.wipeDuration >= 0.85 && finalState.wipeDuration <= 1.1,
      `unexpected wipe duration ${finalState.wipeDuration}`,
    );
    assert.deepEqual(consoleErrors, [], `browser console errors: ${consoleErrors.join(' | ')}`);

    summaries.push({ size, ...initial, ...finalState });
    await context.close();
  }

  const reducedContext = await browser.newContext({
    viewport: sizes[1],
    reducedMotion: 'reduce',
  });
  const reducedPage = await reducedContext.newPage();
  const reducedErrors = [];
  reducedPage.on('console', (message) => {
    if (message.type() === 'error') reducedErrors.push(message.text());
  });
  reducedPage.on('pageerror', (error) => reducedErrors.push(error.message));
  await stubExternalRequests(reducedPage);
  await installTrace(reducedPage);
  await reducedPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await reducedPage.locator('.entrance-intro').waitFor({ state: 'detached', timeout: 1500 });
  const reducedState = await reducedPage.evaluate(() => ({
    complete: document.documentElement.dataset.introComplete,
    events: window.__preloaderTrace.events.length,
    wipeActive: document.querySelector('.stagger-wipe')?.getAttribute('data-active'),
  }));
  assert.equal(reducedState.complete, 'true');
  assert.equal(reducedState.events, 1);
  assert.notEqual(reducedState.wipeActive, 'true');
  assert.deepEqual(
    reducedErrors,
    [],
    `reduced-motion browser errors: ${reducedErrors.join(' | ')}`,
  );
  await reducedContext.close();

  console.log(
    JSON.stringify(
      { screenshots: screenshotDir, reducedMotion: reducedState, viewports: summaries },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
