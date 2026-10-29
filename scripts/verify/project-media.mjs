import assert from 'node:assert/strict';
import path from 'node:path';
import { artifactsDir, launchChromium } from './lib/browser.mjs';

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const artifacts = artifactsDir('project-media');
const browser = await launchChromium();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Vimeo rejects automated connections in this environment. Test its ready/error
  // protocol deterministically; image requests and CMS data remain real.
  let playerMode = 'ready';
  await page.route('https://player.vimeo.com/video/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body:
        '<!doctype html><body>Player fixture<script>addEventListener("message", e => { if(e.data?.method==="ping") setTimeout(()=>parent.postMessage(' +
        JSON.stringify(playerMode === 'ready' ? { method: 'ping' } : { event: 'error' }) +
        ', e.origin),500); });</script></body>',
    }),
  );
  await page.goto(baseURL);
  await page.waitForFunction(() => document.documentElement.dataset.introComplete === 'true');
  await page.locator('.gallery-grid-item').first().waitFor();
  await page.waitForTimeout(1300);
  const grid = await page.locator('.gallery-grid-wrap').elementHandle();
  await page.evaluate(() => {
    window.__mediaRevealEvents = [];
    window.__entryTiming = { controls: null, media: null, controlsDuringRotation: false };
    const started = performance.now();
    const sampleEntry = () => {
      const phase = document.querySelector('.portfolio-scene')?.dataset.transitionPhase;
      const controls = document.querySelector('.project-media-filter');
      const image = document.querySelector('.project-media-card-frame');
      const visible = (element) => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const percentages = style.clipPath.match(/[\d.]+(?=%)/g);
        return style.visibility !== 'hidden' && (!percentages || Number(percentages.at(-1)) < 99);
      };
      if (phase === 'opening' && visible(controls))
        window.__entryTiming.controlsDuringRotation = true;
      if (phase === 'project') {
        if (visible(controls)) window.__entryTiming.controls ??= performance.now();
        if (visible(image)) window.__entryTiming.media ??= performance.now();
      }
      if (
        (window.__entryTiming.media === null || window.__entryTiming.controls === null) &&
        performance.now() - started < 30000
      )
        requestAnimationFrame(sampleEntry);
    };
    requestAnimationFrame(sampleEntry);
    document.addEventListener('animationstart', (e) => {
      if (['gallery-media-reveal', 'project-media-reveal'].includes(e.animationName)) {
        window.__mediaRevealEvents.push({ name: e.animationName, at: performance.now() });
      }
    });
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.target.dataset?.galleryEntrance === 'playing') {
          window.__mediaRevealEvents.push({ name: 'project-media-reveal', at: performance.now() });
        }
      }
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-gallery-entrance'],
    });
  });
  const phase = (value) =>
    page.waitForFunction(
      (v) =>
        document.querySelector('.portfolio-scene')?.getAttribute('data-transition-phase') === v,
      value,
    );
  const counts = () =>
    page.evaluate(() => ({
      home: window.__mediaRevealEvents.filter((e) => e.name === 'gallery-media-reveal').length,
      project: window.__mediaRevealEvents.filter((e) => e.name === 'project-media-reveal').length,
    }));
  await page.locator('[data-project-id="bugonia"]').first().click();
  await phase('project');
  await page.waitForTimeout(2200);
  const entryTiming = await page.evaluate(() => window.__entryTiming);
  assert.equal(
    entryTiming.controlsDuringRotation,
    false,
    'Do not show filters alone during the page rotation',
  );
  assert(
    entryTiming.controls !== null && entryTiming.media !== null,
    'Controls and photos must enter',
  );
  assert(
    Math.abs(entryTiming.media - entryTiming.controls) < 160,
    'Filters and first photo must enter as one compact sequence',
  );
  console.log(
    'PASS balanced entry; filter/photo gap:',
    Math.round(entryTiming.media - entryTiming.controls),
    'ms',
  );
  assert.equal(
    await page.locator('.single-project-view').getAttribute('data-gallery-entrance'),
    'settled',
    'The route rotation owns the initial Project gallery entrance.',
  );
  const galleryRevealsBeforeFilter = (await counts()).home;
  await page.locator('.project-media-filter .filter-bar-toggle').click();
  await page.locator('.project-media-filter .filter-bar-item').nth(1).click();
  await page.waitForTimeout(900);
  assert(
    (await counts()).home > galleryRevealsBeforeFilter,
    'Changing the Project media filter must reveal its gallery items.',
  );
  assert.equal(
    await page.locator('.project-media-filter .filter-bar-toggle').getAttribute('aria-expanded'),
    'true',
    'Selecting a Project media filter must leave its panel open.',
  );
  await page.locator('.project-media-filter .filter-bar-item').first().click();
  await page.waitForTimeout(900);
  assert.match(
    await page
      .locator('.project-media-card-frame')
      .first()
      .evaluate((e) => getComputedStyle(e).clipPath),
    /^inset\(0(?:px|%)(?: 0(?:px|%))*\)$/,
  );
  assert(
    await page.locator('.project-media-card').evaluateAll((cards) =>
      cards.every((c) => {
        const group = c.querySelector('.project-media-card-inner');
        return (
          group.contains(c.querySelector('img')) &&
          group.contains(c.querySelector('.project-media-card-name'))
        );
      }),
    ),
    'Photo and filename must share the visual wrapper',
  );

  const sample = () =>
    page.locator('.project-media-card').evaluateAll((cards) =>
      cards.map((c) => {
        const m = new DOMMatrixReadOnly(
          getComputedStyle(c.querySelector('.project-media-card-inner')).transform,
        );
        return { scale: m.a, scaleY: m.d, x: m.e, outer: getComputedStyle(c).transform };
      }),
    );
  const viewport = page.locator('.project-media-gallery-viewport');
  const bounds = await viewport.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.5);
  await page.mouse.down();
  const samples = [];
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(bounds.x + bounds.width * 0.8 - i * 38, bounds.y + bounds.height * 0.5);
    await page.waitForTimeout(18);
    samples.push(await sample());
  }
  await page.mouse.up();
  assert(
    samples.flat().some((s) => Math.abs(s.x) > 0.2),
    'Scroll motion must remain perceptible',
  );
  assert(
    samples
      .flat()
      .every(
        (s) =>
          s.scale >= 0.9799 &&
          s.scale <= 1 &&
          Math.abs(s.scale - s.scaleY) < 0.00001 &&
          s.outer === 'none',
      ),
    'Motion must stay gentle and proportional',
  );
  assert.equal(await page.locator('.lightbox').count(), 0, 'Drag must not open viewer');
  await page.waitForTimeout(1100);
  assert(
    (await sample()).every((s) => s.scale === 1 && s.x === 0),
    'Motion must restore exact neutral values',
  );
  await page.screenshot({ path: path.join(artifacts, 'scroll-rest.png') });
  console.log('PASS gentle scroll, photo+filename grouping, drag, exact rest');

  await page.locator('.project-media-card').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const source = await page.locator('.project-media-card-image').first().boundingBox();
  const scrollBefore = await viewport.evaluate((e) => e.scrollLeft);
  await page.locator('.project-media-card').first().click();
  await page.waitForTimeout(420);
  const dialog = await page.locator('.lightbox').elementHandle();
  const initialStage = page.locator('.lightbox-content').last();
  const firstKey = await initialStage.getAttribute('data-media-key');
  const enlarged = await initialStage.boundingBox();
  assert(enlarged.width > source.width, 'Click must expand from thumbnail');
  assert(
    Math.abs(enlarged.width / enlarged.height - source.width / source.height) < 0.01,
    'Opening preserves proportions',
  );
  await page.waitForFunction(
    () => document.querySelector('.lightbox-media')?.getAttribute('aria-busy') === 'false',
  );
  await page.screenshot({ path: path.join(artifacts, 'lightbox.png') });
  await page.locator('.lightbox-next').click();
  await page.waitForFunction(
    (key) =>
      document.querySelector('.lightbox-content:last-child')?.getAttribute('data-media-key') !==
      key,
    firstKey,
  );
  const nextScales = await page
    .locator('.lightbox-content')
    .evaluateAll((a) => a.map((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a));
  assert(
    nextScales.every((s) => Math.abs(s - 1) < 0.001),
    'Navigation must not replay thumbnail zoom',
  );
  assert(await dialog.evaluate((e) => e.isConnected), 'Dialog must persist during navigation');
  assert.equal(
    await page.evaluate(() => document.activeElement?.className),
    'lightbox-next',
    'Navigation preserves focus',
  );
  await page.waitForFunction(
    () =>
      document.querySelector('.lightbox-video') &&
      getComputedStyle(document.querySelector('.lightbox-video')).opacity === '1',
  );
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(220);
  assert.equal(await page.locator('.lightbox-video').count(), 0, 'Previous player must unmount');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator('.lightbox-content').last().getAttribute('data-media-key'),
    firstKey,
  );
  assert.equal(
    await page
      .locator('.lightbox-content')
      .last()
      .evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a),
    1,
    'Returning to first photo must not replay zoom',
  );
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'detached' });
  assert.equal(
    await viewport.evaluate((e) => e.scrollLeft),
    scrollBefore,
    'Closing must not move the gallery',
  );
  assert.equal(
    await page
      .locator('.project-media-card-image')
      .first()
      .evaluate((e) => e.style.visibility),
    '',
  );
  console.log('PASS opening/closing, navigation without zoom, focus, player-ready protocol');

  for (let round = 0; round < 2; round++) {
    const before = await counts();
    await page.goBack();
    await phase('idle');
    await page.waitForTimeout(350);
    assert((await counts()).home > before.home, 'Home reveal must replay on every return');
    assert(await grid.evaluate((e) => e.isConnected), 'Home grid must stay mounted');
    await page.waitForTimeout(800);
    await page.locator('[data-project-id="bugonia"]').first().click();
    await phase('project');
    await page.waitForTimeout(1500);
    assert.equal(
      (await counts()).project,
      before.project,
      'The 3D Project route entrance must not replay the per-media reveal.',
    );
    assert.equal(
      await page.locator('.single-project-view').getAttribute('data-gallery-entrance'),
      'settled',
      'The Project gallery must remain settled after route re-entry.',
    );
  }
  console.log('PASS repeated Home/Project reveals and browser Back, persistent grid');

  playerMode = 'error';
  await page.locator('.project-media-card').nth(1).click();
  await page.locator('.lightbox-load-status').waitFor();
  assert((await page.locator('.lightbox-load-status').innerText()).includes('Media unavailable'));
  assert(
    await page.locator('.lightbox-preview').evaluate((e) => e.complete && e.naturalWidth > 0),
    'Keep poster if player fails',
  );
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'detached' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.project-media-card').first().click();
  await page.waitForTimeout(450);
  const mobile = await page.locator('.lightbox-content').boundingBox();
  assert(mobile.x >= 0 && mobile.x + mobile.width <= 390, 'Mobile viewer must fit');
  await page.screenshot({ path: path.join(artifacts, 'mobile.png') });
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'detached' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  assert((await sample()).every((s) => s.scale === 1 && s.x === 0));
  assert.equal(
    await page
      .locator('.project-media-card-frame')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
    'none',
  );
  await page.locator('.project-media-card').first().click();
  await page.locator('.lightbox-close').click();
  await page.locator('.lightbox').waitFor({ state: 'detached' });
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS video-error fallback, mobile, reduced motion, no runtime errors');
} finally {
  await browser.close();
}
