import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const outputDir = path.resolve('stages/04_testing/test-results/project-transition');
const viewports = [
  { name: 'desktop', width: 1440, height: 900, maxHandoffDelta: 2 },
  { name: 'mobile', width: 390, height: 844, maxHandoffDelta: 1 },
];
const slugs = ['bugonia', 'newsquest'];

await mkdir(outputDir, { recursive: true });
const launchOptions = { headless: true };
const browserCache =
  process.env.LOCALAPPDATA && process.platform === 'win32'
    ? path.resolve(process.env.LOCALAPPDATA, 'ms-playwright')
    : path.resolve(homedir(), '.cache/ms-playwright');
const installedChromium = existsSync(browserCache)
  ? readdirSync(browserCache)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
      .map((name) =>
        path.resolve(
          browserCache,
          name,
          process.platform === 'win32' ? 'chrome-win64/chrome.exe' : 'chrome-linux/chrome',
        ),
      )
      .find(existsSync)
  : undefined;
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ??
  installedChromium;
if (executablePath) {
  launchOptions.executablePath = executablePath;
}
const browser = await chromium.launch(launchOptions);
const report = {
  baseUrl,
  transitions: [],
  mobileScrolling: [],
  routeAndHistory: [],
  reducedMotion: [],
  consoleErrors: [],
};

function closeEnoughDelta(before, after, field, limit, label) {
  const delta = Math.abs(after[field] - before[field]);
  assert.ok(delta <= limit, `${label} shifted ${delta.toFixed(2)}px at handoff (limit ${limit}px)`);
  return Number(delta.toFixed(2));
}

async function makePage(viewport, reducedMotion = 'no-preference') {
  const page = await browser.newPage({
    viewport,
    reducedMotion,
    ...(viewport.name === 'mobile' ? { isMobile: true, hasTouch: true } : {}),
  });
  page.on('pageerror', (error) => report.consoleErrors.push(`${page.url()} :: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(`${page.url()} :: ${message.text()}`);
  });
  return page;
}

async function readFrame(page) {
  return page.evaluate(() => {
    const query = (selector) => document.querySelector(selector);
    const box = (selector) => {
      const element = query(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { y: Number(rect.y.toFixed(2)), height: Number(rect.height.toFixed(2)) };
    };
    const visuallyExposed = (element) => {
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (
          style.visibility === 'hidden' ||
          style.display === 'none' ||
          Number(style.opacity) < 0.01
        )
          return false;
        const clip = style.clipPath;
        const bottomInset = clip.match(/^inset\(0(?:px)?\s+0(?:px)?\s+([\d.]+)%/)?.[1];
        if (bottomInset && Number(bottomInset) >= 99.9) return false;
      }
      return true;
    };
    const scene = query('.portfolio-scene');
    const projectHeader = query('.site-header-col--project');
    const projectHeaderText = [
      query('.site-header-project-title'),
      ...document.querySelectorAll('.site-header-col--project [data-motion-text]'),
    ].filter(Boolean);
    const projectSurfaceText = [
      ...document.querySelectorAll('.project-media-gallery-header [data-motion-text]'),
    ];
    return {
      phase: scene?.dataset.transitionPhase ?? null,
      angle: Number.parseFloat(scene?.style.getPropertyValue('--scene-angle') || '0'),
      progress: Number.parseFloat(scene?.style.getPropertyValue('--scene-progress') || '0'),
      headerHeight: Number(query('.site-header')?.getBoundingClientRect().height.toFixed(2) ?? 0),
      headerHeightVar: getComputedStyle(document.documentElement)
        .getPropertyValue('--site-header-height')
        .trim(),
      galleryTop: box('.project-media-gallery-viewport')?.y ?? null,
      galleryHeight: box('.project-media-gallery-viewport')?.height ?? null,
      firstCardY: box('.project-media-card')?.y ?? null,
      projectHeaderHidden: projectHeader
        ? getComputedStyle(projectHeader).visibility === 'hidden'
        : false,
      projectHeaderTextExposed: projectHeaderText.some(visuallyExposed),
      projectSurfaceTextExposed: projectSurfaceText.some(visuallyExposed),
      titleClip: query('.site-header-project-heading')
        ? getComputedStyle(query('.site-header-project-heading')).clipPath
        : null,
      titleOpacity: query('.site-header-project-heading')
        ? Number(getComputedStyle(query('.site-header-project-heading')).opacity)
        : null,
    };
  });
}

async function waitForPhase(page, phase, timeout = 12000) {
  await page.waitForFunction(
    (expected) => document.querySelector('.portfolio-scene')?.dataset.transitionPhase === expected,
    phase,
    { timeout },
  );
}

async function readBioVisibility(page) {
  return page.locator('.site-header-bio').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    const textRects = [...range.getClientRects()];
    const hasVisibleText = textRects.some((textRect) => {
      const target = element.ownerDocument.elementFromPoint(
        textRect.left + Math.min(4, textRect.width / 2),
        textRect.top + textRect.height / 2,
      );
      return target === element || element.contains(target);
    });
    return rect.width > 0 && rect.height > 0 && hasVisibleText;
  });
}

async function verifyMobileProjectScroll(page, name) {
  const gallery = page.locator('.project-media-gallery-viewport');
  const firstCard = page.locator('.project-media-card').first();
  const lastCard = page.locator('.project-media-card').last();
  let galleryBox = await gallery.boundingBox();
  assert.ok(galleryBox, `${name}: project gallery was not visible`);

  for (
    let attempt = 0;
    attempt < 10 && galleryBox.y > page.viewportSize().height * 0.65;
    attempt += 1
  ) {
    await page.mouse.move(10, page.viewportSize().height * 0.25);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(50);
    galleryBox = await gallery.boundingBox();
  }
  assert(
    galleryBox.y < page.viewportSize().height,
    `${name}: vertical scrolling must bring the project gallery into view`,
  );

  const firstPosition = await firstCard.boundingBox();
  assert.ok(firstPosition, `${name}: first project photo was not visible`);
  const client = await page.context().newCDPSession(page);
  const touch = async (startX, startY, endX, endY) => {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ id: 1, x: Math.round(startX), y: Math.round(startY) }],
    });
    for (let step = 1; step <= 8; step += 1) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            id: 1,
            x: Math.round(startX + ((endX - startX) * step) / 8),
            y: Math.round(startY + ((endY - startY) * step) / 8),
          },
        ],
      });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const swipeStartX = galleryBox.x + galleryBox.width * 0.75;
  const swipeY = galleryBox.y + galleryBox.height / 2;
  await touch(swipeStartX, swipeY, swipeStartX - 350, swipeY);
  await page.waitForTimeout(300);
  const swipedPosition = await firstCard.boundingBox();
  assert.ok(swipedPosition, `${name}: first project photo disappeared after a gallery swipe`);
  assert.notEqual(
    Math.round(swipedPosition.x),
    Math.round(firstPosition.x),
    `${name}: horizontal swipe must move through the project photos`,
  );

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const box = await gallery.boundingBox();
    if (!box) break;
    const startX = box.x + box.width / 2;
    const startY = Math.min(box.y + box.height / 2, page.viewportSize().height - 20);
    await touch(startX, startY, startX, startY - 400);
    await page.waitForTimeout(50);
  }
  await client.detach();
  const lastPosition = await lastCard.boundingBox();
  assert.ok(lastPosition, `${name}: last project photo was not rendered`);
  assert(
    lastPosition.y < page.viewportSize().height && lastPosition.y + lastPosition.height > 0,
    `${name}: scrolling from the gallery must bring the last project photo into view`,
  );
  report.mobileScrolling.push({ name, firstPhotoMovedAfterSwipe: true, lastPhotoReached: true });
}

async function runTransition(viewport, slug) {
  const page = await makePage(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const source = page.locator(`[data-project-id="${slug}"]`).first();
  await source.waitFor({ state: 'visible', timeout: 30000 });
  await source.click();

  const name = `${slug}-${viewport.name}`;
  const screenshotDir = path.join(outputDir, name);
  await mkdir(screenshotDir, { recursive: true });
  const stageThresholds = [
    { key: 'opening-early', progress: 0.12 },
    { key: 'opening-middle', progress: 0.5 },
    { key: 'opening-near-endpoint', progress: 0.9 },
  ];
  const screenshots = new Set();
  const frames = [];
  let lastOpening = null;
  let firstProject = null;
  let projectStartedAt = null;
  const startedAt = Date.now();

  while (Date.now() - startedAt < 12000) {
    const frame = await readFrame(page);
    frames.push(frame);
    if (frame.phase === 'opening') {
      lastOpening = frame;
      assert.equal(
        frame.projectHeaderHidden,
        true,
        `${name}: Project header escaped during opening`,
      );
      assert.equal(
        frame.projectHeaderTextExposed,
        false,
        `${name}: header text exposed during opening`,
      );
      assert.equal(
        frame.projectSurfaceTextExposed,
        false,
        `${name}: gallery controls exposed during opening`,
      );
      const due = stageThresholds.find(
        (stage) => !screenshots.has(stage.key) && frame.progress >= stage.progress,
      );
      if (due) {
        await page.screenshot({ path: path.join(screenshotDir, `${due.key}.png`) });
        screenshots.add(due.key);
      }
    } else if (frame.phase === 'project') {
      if (!firstProject) {
        firstProject = frame;
        projectStartedAt = Date.now();
        await page.screenshot({ path: path.join(screenshotDir, 'first-project-frame.png') });
        screenshots.add('first-project-frame');
      } else if (Date.now() - projectStartedAt >= 900) {
        break;
      }
    }
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  }

  assert.ok(lastOpening, `${name}: opening phase was not observed`);
  assert.ok(firstProject, `${name}: project phase was not observed`);
  assert.equal(screenshots.size, 4, `${name}: one or more opening screenshots were not captured`);
  assert.equal(
    firstProject.projectHeaderHidden,
    false,
    `${name}: destination header remained hidden at handoff`,
  );
  const galleryDelta = closeEnoughDelta(
    lastOpening,
    firstProject,
    'galleryTop',
    viewport.maxHandoffDelta,
    `${name} gallery`,
  );
  const cardDelta = closeEnoughDelta(
    lastOpening,
    firstProject,
    'firstCardY',
    viewport.maxHandoffDelta,
    `${name} first card`,
  );
  const headerDelta = closeEnoughDelta(
    lastOpening,
    firstProject,
    'headerHeight',
    1,
    `${name} header height`,
  );

  await page.waitForTimeout(1000);
  const settled = await readFrame(page);
  await page.screenshot({ path: path.join(screenshotDir, 'project-settled.png') });
  assert.equal(settled.phase, 'project', `${name}: project did not settle`);
  assert.equal(settled.projectHeaderTextExposed, true, `${name}: project header did not enter`);
  if (viewport.name === 'mobile') await verifyMobileProjectScroll(page, name);
  const projectFrames = frames.filter((frame) => frame.phase === 'project');
  let revealStarted = false;
  let revealFinished = false;
  for (const frame of projectFrames) {
    const clip = frame.titleClip ?? '';
    const fullyClipped = /^inset\(0(?:px)?\s+0(?:px)?\s+100%/.test(clip);
    const exposed = !fullyClipped && (frame.titleOpacity ?? 0) > 0.01;
    if (exposed) revealStarted = true;
    if (revealStarted && !exposed) revealFinished = true;
    assert.equal(
      revealFinished,
      false,
      `${name}: header became hidden again after its project reveal began`,
    );
  }

  report.transitions.push({
    name,
    lastOpening,
    firstProject,
    settled,
    galleryHandoffDelta: galleryDelta,
    firstCardHandoffDelta: cardDelta,
    headerHandoffDelta: headerDelta,
    sampledFrames: frames.length,
    screenshots: [...screenshots],
  });
  await page.close();
}

async function runRouteAndHistory(viewport, slug) {
  const directPage = await makePage(viewport);
  await directPage.goto(`${baseUrl}/projects/${slug}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await waitForPhase(directPage, 'project');
  assert.equal(
    (await readFrame(directPage)).projectHeaderHidden,
    false,
    `${slug}: direct project route hid its header`,
  );
  report.routeAndHistory.push({
    slug,
    viewport: viewport.name,
    directRoute: 'project header available',
  });
  await directPage.close();

  const page = await makePage(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => document.documentElement.dataset.introComplete === 'true');
  await page.waitForTimeout(850);
  assert.equal(
    await readBioVisibility(page),
    true,
    `${viewport.name}: home bio did not become visible`,
  );
  await page.locator(`[data-project-id="${slug}"]`).first().click();
  await waitForPhase(page, 'project');
  await page.waitForTimeout(850);
  const projectFrame = await page.screenshot();
  const back = page
    .locator(
      '.site-header-project-back--desktop:visible, .site-header-project-back--mobile:visible',
    )
    .first();
  await back.click();
  await waitForPhase(page, 'closing');
  await page.waitForTimeout(250);
  const closingFrame = await page.screenshot();
  await waitForPhase(page, 'idle');
  await page.waitForTimeout(850);
  const homeFrame = await page.screenshot();
  assert(
    !closingFrame.equals(projectFrame) && !closingFrame.equals(homeFrame),
    `${viewport.name}: return transition must render a frame distinct from both endpoints`,
  );
  assert.equal(
    await readBioVisibility(page),
    true,
    `${viewport.name}: home bio did not become visible after returning from a project`,
  );
  await page.goForward();
  await waitForPhase(page, 'project');
  await page.goBack();
  await waitForPhase(page, 'idle');
  report.routeAndHistory.push({
    slug,
    viewport: viewport.name,
    uiBackForward: 'home → project → home',
  });
  await page.close();
}

async function runReducedMotion(viewport, slug) {
  const page = await makePage(viewport, 'reduce');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator(`[data-project-id="${slug}"]`).first().click();
  await page.waitForURL(new RegExp(`/projects/${slug}$`), { timeout: 12000 });
  await waitForPhase(page, 'project');
  const frame = await readFrame(page);
  assert.equal(frame.angle, -90, `${slug}: reduced motion did not settle the 3D scene`);
  assert.equal(frame.projectHeaderHidden, false, `${slug}: reduced motion hid the project header`);
  report.reducedMotion.push({
    slug,
    viewport: viewport.name,
    phase: frame.phase,
    angle: frame.angle,
  });
  await page.close();
}

try {
  for (const viewport of viewports) {
    for (const slug of slugs) await runTransition(viewport, slug);
    await runRouteAndHistory(viewport, slugs[0]);
    await runReducedMotion(viewport, slugs[1]);
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
const uniqueErrors = [...new Set(report.consoleErrors)];
if (uniqueErrors.length) {
  throw new Error(`Browser console or page errors were reported: ${uniqueErrors.join(' | ')}`);
}
console.log(`Project transition choreography passed. Screenshots and measurements: ${outputDir}`);
