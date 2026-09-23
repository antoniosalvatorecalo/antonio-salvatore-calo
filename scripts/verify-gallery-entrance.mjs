import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const artifacts = '.cache/gallery-entrance';
mkdirSync(artifacts, { recursive: true });
const cache = resolve(
  process.env.LOCALAPPDATA || resolve(homedir(), 'AppData', 'Local'),
  'ms-playwright',
);
const executablePath = readdirSync(cache)
  .filter((name) => /^chromium-\d+$/.test(name))
  .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  .map((name) => resolve(cache, name, 'chrome-win64', 'chrome.exe'))
  .find(existsSync);
const browser = await chromium.launch({ headless: true, executablePath });
const errors = [];
const phase = (page, value) =>
  page.waitForFunction(
    (v) => document.querySelector('.portfolio-scene')?.dataset.transitionPhase === v,
    value,
  );
const settled = (page) =>
  page.waitForFunction(
    () => document.querySelector('.single-project-view')?.dataset.galleryEntrance === 'settled',
  );
const home = async (page) => {
  await page.goto(baseURL);
  await page.waitForFunction(() => document.documentElement.dataset.introComplete === 'true');
  await page.locator('.gallery-grid-item').first().waitFor();
};
const read = (page) =>
  page.evaluate(() => {
    const shell = document.querySelector('.single-project-view');
    const viewport = document.querySelector('.project-media-gallery-viewport');
    const bounds = viewport.getBoundingClientRect();
    return {
      state: shell.dataset.galleryEntrance,
      angle: document.querySelector('.portfolio-scene').style.getPropertyValue('--scene-angle'),
      progress: Number(
        document.querySelector('.portfolio-scene').style.getPropertyValue('--scene-progress'),
      ),
      fit: Number(viewport.style.getPropertyValue('--project-gallery-fit')),
      cards: [...document.querySelectorAll('.project-media-card')].map((card) => {
        const frame = card.querySelector('.project-media-card-frame');
        const img = card.querySelector('img');
        const rect = card.getBoundingClientRect();
        return {
          visible: rect.right > bounds.left + 1 && rect.left < bounds.right - 1,
          marked: card.dataset.entranceVisible === 'true',
          delay: parseFloat(card.style.getPropertyValue('--project-reveal-delay')) || 0,
          clip: getComputedStyle(frame).clipPath,
          duration: getComputedStyle(frame).animationDuration,
          animation: getComputedStyle(frame).animationName,
          curtainAnimation: getComputedStyle(frame).animationName,
          overlay: getComputedStyle(frame, '::after').content,
          curtainTime: frame.getAnimations()[0]?.currentTime ?? 0,
          depth: getComputedStyle(card.querySelector('.project-media-card-depth')).transform,
          settleDuration: getComputedStyle(img).animationDuration,
          transform: getComputedStyle(card).transform,
          filter: getComputedStyle(card).filter,
          selected: img.hasAttribute('data-transition-media'),
          loading: img.loading,
          priority: img.fetchPriority,
        };
      }),
    };
  });

try {
  for (const mobile of [false, true]) {
    const name = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      recordVideo: { dir: `${artifacts}/${name}`, size: { width: 1440, height: 900 } },
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await home(page);
    const links = page.locator('[data-project-id="bugonia"]');
    await links.nth(2).click();
    await phase(page, 'opening');
    const opening = await read(page);
    assert.equal(opening.state, 'pending');
    assert(
      opening.cards.every((card) => card.clip.includes('100%')),
      'Every photo is fully covered before reveal',
    );
    assert(
      opening.cards.every((card) => card.overlay === 'none'),
      'Curtain is a real crop, never a white overlay on the photos',
    );
    assert(opening.fit > 0 && opening.fit <= 1, 'Three-photo composition fits the incoming plane');
    assert.equal(opening.cards.filter((card) => card.selected).length, 1);
    assert(opening.cards.find((card) => card.selected).loading === 'eager');
    assert(opening.cards.find((card) => card.selected).priority === 'high');
    await page.waitForTimeout(650);
    const bridge = await page.locator('[data-transition-preview]').evaluate((element) => {
      const scene = element.closest('.portfolio-scene');
      return {
        count: element.querySelectorAll('img').length,
        loaded: [...element.querySelectorAll('img')].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
        crop: getComputedStyle(element).clipPath,
        roll: getComputedStyle(scene.querySelector('.scene-roll')).transform,
        rotor: getComputedStyle(scene.querySelector('.scene-rotor')).transform,
        onProjectFace: Boolean(element.closest('.scene-plane--project')),
      };
    });
    assert.equal(bridge.count, 3, 'Three photos must remain visible on the rotating project face');
    assert(
      bridge.onProjectFace && bridge.roll !== 'none' && bridge.rotor.startsWith('matrix3d'),
      'Both pages must share the actual 3D scene',
    );
    assert(
      !bridge.crop.includes('100%'),
      'The bridge must not be hidden by the destination curtain',
    );
    await page.screenshot({ path: `${artifacts}/${name}-3d.png` });
    await page.waitForFunction(
      () => document.querySelector('.single-project-view')?.dataset.galleryEntrance === 'playing',
    );
    const landing = await read(page);
    assert(
      Number.parseFloat(landing.angle) === -90,
      'Curtain must begin only after the scene reaches its project endpoint',
    );
    await page.screenshot({ path: `${artifacts}/${name}-curtain-3d.png` });
    await phase(page, 'project');
    assert.equal(
      await page.locator('[data-transition-preview]').count(),
      0,
      'The transition surface must be gone at the project endpoint',
    );
    const entering = await read(page);
    assert.equal(entering.state, 'playing');
    assert.equal(entering.angle, '-90deg');
    const marked = entering.cards.filter((card) => card.marked);
    assert(marked.length >= 3, 'The transition includes a three-photo composition');
    assert(
      landing.cards
        .filter((card) => card.marked)
        .every((card) => card.curtainAnimation === 'project-media-reveal'),
      'Every entrance photo uses the Home-style curtain',
    );
    assert(
      landing.cards.some((card) => card.depth.startsWith('matrix3d')),
      'Photos share the scene depth',
    );
    assert.equal(entering.progress, 1);
    assert(entering.cards.find((card) => card.selected).visible);
    assert(marked.every((card, i) => card.delay === Math.min(i * (mobile ? 65 : 90), 270)));
    assert(marked.every((card) => card.curtainAnimation === 'project-media-reveal'));
    assert(entering.cards.every((card) => card.transform === 'none' && card.filter === 'none'));
    await page.screenshot({ path: `${artifacts}/${name}-entry-start.png` });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${artifacts}/${name}-entry-middle.png` });
    await settled(page);
    await page.screenshot({ path: `${artifacts}/${name}-rest.png` });
    assert((await read(page)).cards.every((card) => card.duration === '0s'));

    // Filters and ordinary React updates must not replay the route entrance.
    await page.locator('.project-media-filter .filter-bar-toggle').click();
    await page.locator('.project-media-filter .filter-bar-item').nth(1).click();
    await page.waitForTimeout(700);
    assert.equal((await read(page)).state, 'settled');
    assert((await read(page)).cards.every((card) => card.duration === '0s'));

    await page.goBack();
    await phase(page, 'closing');
    await page.waitForTimeout(250);
    const covering = await read(page);
    assert(
      covering.cards.some((card) => {
        const bottom = Number(card.clip.match(/([\d.]+)%/)?.[1]);
        return bottom > 0 && bottom < 100;
      }),
      'Back raises the curtain from bottom to top, without an instant cut',
    );
    await page.screenshot({ path: `${artifacts}/${name}-back-curtain.png` });
    await page.waitForTimeout(450);
    assert(
      (await read(page)).cards.every((card) => card.clip.includes('100%')),
      'Back fully covers every photo',
    );
    await phase(page, 'idle');
    await page.goForward();
    await phase(page, 'project');
    await settled(page);
    console.log(`PASS ${name}: 3D, selected media, visible stagger, timing, filters, Back/Forward`);
    await context.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseURL}/projects/bugonia`);
  await page.locator('.single-project-view').waitFor();
  assert.equal((await read(page)).state, 'pending', 'Direct entry waits for intro');
  await page.waitForFunction(() => document.documentElement.dataset.introComplete === 'true');
  await page.waitForFunction(
    () => document.querySelector('.single-project-view')?.dataset.galleryEntrance === 'playing',
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await settled(page);
  assert((await read(page)).cards.every((card) => !card.clip.includes('100%')));
  console.log('PASS direct entry waits for intro; resize settles without hidden media');

  await home(page);
  await page.locator('[data-project-id="bugonia"]').first().click();
  await phase(page, 'project');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  assert((await read(page)).cards.every((card) => card.animation === 'none'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal((await read(page)).state, 'settled');
  console.log('PASS live reduced-motion change cancels entrance without replay');

  // Readiness must resolve even when the destination image cannot load.
  await home(page);
  await page.route('**/*', (route) => {
    if (route.request().resourceType() === 'image') return route.abort();
    return route.continue();
  });
  await page.locator('[data-project-id="bugonia"]').first().click();
  await phase(page, 'project');
  await settled(page);
  assert((await read(page)).cards.every((card) => !card.clip.includes('100%')));
  console.log('PASS failed image cannot strand the transition or mask');
  assert.deepEqual(errors, []);
  await page.close();
} finally {
  await browser.close();
}
