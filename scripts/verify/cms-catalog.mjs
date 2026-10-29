import { chromium } from '@playwright/test';
import { createClient } from '@sanity/client';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { PROJECTS_QUERY, SITE_SETTINGS_QUERY } from '../../src/cms/queries.ts';

const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const prerenderTest = process.env.PRERENDER_TEST === '1';
const expectedLabels = [
  'File Bugonia Thumbnail',
  'Bugonia Video 01',
  'Context-Brief',
  'The problem-Core solution',
  'Bugonia Video 02',
  'Bugonia Video 03',
  'Bugonia-menu',
  'Bugonia-mobile',
  'Bugonia Video 04',
  'Bugonia-home-desktop-mobile',
  'Bugonia Video 05',
  'Bugonia Video 06',
  'Bugonia-Booking-Tiket',
  'Bugonia Video 07',
  'Bugonia Video 08',
  'Merchandaising',
  'Merch_Mobile',
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const normalizeMediaLabel = (value) =>
  value.replaceAll('[', '').replaceAll(']', '').trim().toLowerCase();

const liveClient = createClient({
  projectId: 'dw4juo8a',
  dataset: 'production',
  apiVersion: '2026-09-06',
  useCdn: false,
});
const [liveProjects, liveSiteSettings] = await Promise.all([
  liveClient.fetch(PROJECTS_QUERY),
  liveClient.fetch(SITE_SETTINGS_QUERY),
]);
assert(
  liveSiteSettings?._id === undefined || liveSiteSettings?.displayName,
  'Live Sanity query did not return siteSettings.',
);
const liveBugonia = liveProjects.find((project) => project._id === 'project-bugonia');
const liveNewsquest = liveProjects.find((project) => project._id === 'project-newsquest');
assert(liveBugonia?.gallery?.length === 17, 'Live Sanity query did not return 17 Bugonia media.');
assert(liveNewsquest?.gallery?.length === 6, 'Live Sanity query did not return 6 Newsquest media.');
const thirdProject = {
  ...liveNewsquest,
  _id: 'project-dynamic-test',
  slug: { current: 'dynamic-test' },
  order: 2,
  title: { en: 'Dynamic CMS Test', it: 'Test CMS dinamico' },
  gallery: [
    {
      ...liveNewsquest.gallery[0],
      _key: 'dynamic-test-media-01',
      image: {
        ...liveNewsquest.gallery[0].image,
        asset: {
          ...liveNewsquest.gallery[0].image.asset,
          url: `${liveNewsquest.gallery[0].image.asset.url}?dynamic-test=1`,
        },
      },
    },
  ],
};
const malformedProject = {
  ...liveNewsquest,
  _id: 'project-malformed',
  slug: { current: 'malformed' },
  gallery: [],
};
const siteSettingsFixture = {
  ...liveSiteSettings,
  branding: {
    favicon: { asset: { url: 'https://cdn.sanity.io/images/dw4juo8a/production/favicon.png' } },
    themeColor: '#111111',
  },
};
const sanityFixture = [...liveProjects, thirdProject, malformedProject];
const sanityResultFor = (url) =>
  new URL(url).searchParams.get('query')?.includes('siteSettings')
    ? siteSettingsFixture
    : sanityFixture;

const browserCache = resolve(
  process.env.LOCALAPPDATA || resolve(homedir(), 'AppData', 'Local'),
  'ms-playwright',
);
const installedChromium = readdirSync(browserCache)
  .filter((name) => /^chromium-\d+$/.test(name))
  .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  .map((name) => resolve(browserCache, name, 'chrome-win64', 'chrome.exe'))
  .find(existsSync);
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const launchOptions = {
  headless: true,
  ...(installedChromium ? { executablePath: installedChromium } : {}),
  ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}),
};
const browser = await chromium.launch({
  ...launchOptions,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route('https://player.vimeo.com/**', (route) =>
  route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Vimeo fixture</title>' }),
);
await context.route('https://challenges.cloudflare.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/plain', body: '' }),
);
const page = await context.newPage();
const fixtureImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
for (const imageHost of ['https://cdn.sanity.io/images/**', 'https://vumbnail.com/**']) {
  await page.route(imageHost, (route) =>
    route.fulfill({ contentType: 'image/png', body: fixtureImage }),
  );
}
await page.route('**/data/query/production?**', async (route) => {
  await route.fulfill({
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ result: sanityResultFor(route.request().url()), ms: 1 }),
  });
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (process.env.DIAGNOSE_401 === '1' && response.status() === 401) {
    const request = response.request();
    console.error(
      `[401] ${request.resourceType()} ${response.url()} (page=${request.frame()?.url() ?? 'unknown'})`,
    );
  }
});
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

try {
  await page.goto(baseURL);
  await page
    .locator('[data-project-id="bugonia"]')
    .first()
    .waitFor({ timeout: 15_000 })
    .catch(async (error) => {
      console.error(
        'Home diagnostic:',
        await page.locator('body').innerText(),
        errors,
        await page.evaluate(() =>
          performance
            .getEntriesByType('resource')
            .map((entry) => entry.name)
            .filter((url) => url.includes('sanity.io')),
        ),
      );
      throw error;
    });
  const firstProjectLink = page.locator('[data-project-id="bugonia"]').first();
  assert(
    await firstProjectLink.evaluate((element) => element.tagName === 'A'),
    'Project grid destination is not a link.',
  );
  assert(
    (await firstProjectLink.getAttribute('href')) === '/projects/bugonia',
    'Project link has no canonical href.',
  );
  const modifiedClickPrevented = await firstProjectLink.evaluate((element) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  assert(!modifiedClickPrevented, 'Modified project click was intercepted.');
  assert(
    (await page.locator('[data-project-id="bugonia"]').count()) === 17,
    'Expected 17 Bugonia media in the grid.',
  );
  assert(
    (await page.locator('[data-project-id="newsquest"]').count()) === 6,
    'Expected 6 Sanity Newsquest media in the grid.',
  );
  await page.getByRole('button', { name: 'Copy email address' }).waitFor();
  assert(
    (await page.title()).includes('Antonio Salvatore Calò'),
    'Global CMS SEO title was not applied.',
  );
  if (!prerenderTest) {
    assert(
      (await page.locator('link[rel="icon"]').getAttribute('href'))?.includes('cdn.sanity.io'),
      'CMS favicon was not applied.',
    );
    assert(
      (await page.locator('meta[name="theme-color"]').getAttribute('content')) === '#111111',
      'CMS theme color was not applied.',
    );
  }
  assert(
    (await page.locator('[data-project-id="malformed"]').count()) === 0,
    'Malformed CMS project was rendered.',
  );

  const gallery = page.locator('.gallery-grid-wrap');
  const filterBar = page.locator('.filter-bar');
  const stableFilterTop = await filterBar.boundingBox().then((box) => box?.y);
  await page.locator('.filter-bar-toggle').click();
  const filters = page.locator('.filter-bar-item');
  for (let index = 0; index < (await filters.count()); index += 1) {
    await gallery.evaluate((element) => {
      element.scrollTop = 80;
    });
    await filters.nth(index).click();
    await page.locator('.gallery-grid').waitFor();
    assert(
      (await gallery.evaluate((element) => element.scrollTop)) === 0,
      'Filter change did not reset the gallery scroll container.',
    );
    assert(
      (await filterBar.boundingBox())?.y === stableFilterTop,
      'FilterBar moved after changing result count.',
    );
  }

  await page.goto(baseURL);
  await page.locator('[data-project-id="bugonia"]').first().waitFor();
  for (let index = 0; index < expectedLabels.length; index += 1) {
    await page.locator('[data-project-id="bugonia"]').nth(index).click();
    await page.waitForURL('**/projects/bugonia');
    const selectedCard = page.locator('.project-media-card').nth(index);
    await selectedCard.waitFor();
    const label = await selectedCard.innerText();
    assert(
      normalizeMediaLabel(label).length > 0,
      `Bugonia media ${index + 1} has no visible label.`,
    );
    await page.goto(baseURL);
    await page.locator('[data-project-id="bugonia"]').first().waitFor();
  }

  await page.locator('[data-project-id="bugonia"]').nth(1).click();
  await page.waitForURL('**/projects/bugonia');
  await page.waitForFunction(() => document.title.includes('Bugonia'));
  assert((await page.title()).includes('Bugonia'), 'Project SEO title was not applied.');
  await page.locator('.project-media-card').nth(1).click();
  await page.locator('.lightbox-video').waitFor();
  assert(
    (await page.locator('.lightbox-video').getAttribute('src'))?.includes('1199753560'),
    'Vimeo selection was not preserved in the lightbox.',
  );
  await page.goBack();
  await page.waitForURL(baseURL + '/');
  await page.goForward();
  await page.waitForURL('**/projects/bugonia');

  await page.reload();
  await page.locator('.project-media-card').first().waitFor();
  await page.goto(baseURL);
  await page.locator('[data-project-id="bugonia"]').first().click();
  await page.waitForURL('**/projects/bugonia');
  const projectCards = page.locator('.project-media-card');
  await projectCards.first().waitFor();
  assert(
    (await projectCards.count()) === expectedLabels.length,
    'Bugonia project gallery did not render every media card.',
  );

  for (let index = 0; index < (await projectCards.count()); index += 1) {
    const cardLabel = await projectCards.nth(index).innerText();
    await projectCards.nth(index).click();
    const lightbox = page.locator('.lightbox');
    await lightbox.waitFor();
    const lightboxLabel = await page.locator('.lightbox-name').innerText();
    assert(
      normalizeMediaLabel(lightboxLabel) === normalizeMediaLabel(cardLabel),
      `Lightbox opened the wrong Bugonia media at index ${index}.`,
    );
    if (index === 0) {
      const headerBox = await page.locator('.site-header').boundingBox();
      assert(headerBox, 'Could not measure the site header.');
      const lightboxCoversHeader = await page.evaluate(
        ({ x, y }) => {
          return Boolean(document.elementFromPoint(x, y)?.closest('.lightbox'));
        },
        {
          x: headerBox.x + headerBox.width / 2,
          y: headerBox.y + Math.min(16, headerBox.height / 2),
        },
      );
      assert(lightboxCoversHeader, 'The site header is rendered above the lightbox.');
    }
    await page.locator('.lightbox-close').click();
    await lightbox.waitFor({ state: 'detached' });
  }

  await projectCards.first().scrollIntoViewIfNeeded();
  const firstCardBox = await projectCards.first().boundingBox();
  assert(firstCardBox, 'Could not measure the first project media card.');
  await page.mouse.move(
    firstCardBox.x + firstCardBox.width / 2,
    firstCardBox.y + firstCardBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    firstCardBox.x + firstCardBox.width / 2 + 4,
    firstCardBox.y + firstCardBox.height / 2,
  );
  await page.mouse.up();
  await page.locator('.lightbox').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'detached' });

  const galleryViewport = page.locator('.project-media-gallery-viewport');
  const viewportBox = await galleryViewport.boundingBox();
  assert(viewportBox, 'Could not measure the project gallery viewport.');
  const scrollBeforeDrag = await galleryViewport.evaluate((element) => element.scrollLeft);
  await page.mouse.move(
    viewportBox.x + viewportBox.width * 0.75,
    viewportBox.y + viewportBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    viewportBox.x + viewportBox.width * 0.25,
    viewportBox.y + viewportBox.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  assert(
    (await page.locator('.lightbox').count()) === 0,
    'Dragging the project gallery opened the lightbox.',
  );
  assert(
    (await galleryViewport.evaluate((element) => element.scrollLeft)) > scrollBeforeDrag,
    'Dragging did not scroll the project gallery.',
  );

  await projectCards.nth(2).click();
  await page.locator('.lightbox').waitFor();
  const beforeArrow = await page.locator('.lightbox-name').innerText();
  await page.keyboard.press('ArrowRight');
  const afterArrow = await page.locator('.lightbox-name').innerText();
  assert(afterArrow !== beforeArrow, 'ArrowRight did not advance the lightbox.');
  await page.keyboard.press('Escape');
  await page.locator('.lightbox').waitFor({ state: 'detached' });

  await projectCards.first().focus();
  await page.keyboard.press('Enter');
  await page.locator('.lightbox').waitFor();
  await page.mouse.click(8, 8);
  await page.locator('.lightbox').waitFor({ state: 'detached' });

  await page.goto(`${baseURL}/projects/newsquest`);
  await page.locator('.project-media-card').first().waitFor();
  assert(
    (await page.locator('.project-media-card').count()) === 6,
    'Newsquest Sanity route failed.',
  );

  for (let index = 0; index < 6; index += 1) {
    await page.goto(baseURL);
    await page.locator('[data-project-id="newsquest"]').nth(index).click();
    await page.waitForURL('**/projects/newsquest');
    const label = await page.locator('.project-media-card').nth(index).innerText();
    assert(
      normalizeMediaLabel(label).length > 0,
      `Newsquest media ${index + 1} has no visible label.`,
    );
  }

  await page.goto(baseURL);
  await page.locator('[data-project-id="dynamic-test"]').click();
  await page.waitForURL('**/projects/dynamic-test');
  await page.getByText('Dynamic CMS Test').first().waitFor();

  await page.goto(`${baseURL}/projects/bugonia`);
  await page.getByText('Cinema ticketing is often marginal or outsourced.').waitFor();
  const languageButtons = page.locator('button[aria-label^="Language:"]');
  for (let index = 0; index < (await languageButtons.count()); index += 1) {
    if (await languageButtons.nth(index).isVisible()) {
      await languageButtons.nth(index).click();
      break;
    }
  }
  await page
    .getByText('Il ticketing cinematografico è spesso marginale o esternalizzato.')
    .waitFor();
  assert(
    (await page.locator('html').getAttribute('lang')) === 'it',
    'Language toggle did not update html lang.',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator('.project-media-card').first().waitFor();
  assert(
    await page.locator('.single-project-view').isVisible(),
    'Bugonia is not visible at the mobile viewport.',
  );
  await page.locator('.project-media-card').first().click();
  await page.locator('.lightbox').waitFor();
  await page.locator('.lightbox-close').click();
  const accordion = page.locator('.project-about-toggle').first();
  if (await accordion.count()) {
    await accordion.click();
    assert(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
      'Mobile accordion created page overflow.',
    );
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(baseURL);
  await page.locator('.gallery-grid').waitFor();

  const motionContext = await browser.newContext({ reducedMotion: 'no-preference' });
  const motionPage = await motionContext.newPage();
  await motionPage.route('**/data/query/production?**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ result: sanityResultFor(route.request().url()), ms: 1 }),
    }),
  );
  await motionPage.route('https://cdn.sanity.io/images/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await motionPage.route('https://player.vimeo.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Vimeo fixture</title>',
    }),
  );
  await motionPage.route('https://vumbnail.com/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await motionPage.goto(baseURL);
  await motionPage.locator('.gallery-grid').waitFor();
  const readGalleryRevealState = () =>
    motionPage.evaluate(() => {
      const item = document.querySelector('.gallery-grid-item');
      const reveal = document.querySelector('.gallery-media-reveal');
      if (!item || !reveal) throw new Error('Gallery reveal wrapper is missing.');
      const style = getComputedStyle(reveal);
      const itemRect = item.getBoundingClientRect();
      const clipValues = style.clipPath.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
      const isFullyOpen =
        clipValues.length > 0 && clipValues.every((value) => Math.abs(value) < 0.01);
      return {
        animationName: style.animationName,
        animationDelay: style.animationDelay,
        clipPath: style.clipPath,
        isFullyOpen,
        opacity: style.opacity,
        transform: style.transform,
        itemRect: {
          x: itemRect.x,
          y: itemRect.y,
          width: itemRect.width,
          height: itemRect.height,
        },
        pseudoContent: getComputedStyle(item, '::after').content,
      };
    });
  const initialRevealState = await readGalleryRevealState();
  assert(
    !initialRevealState.isFullyOpen,
    'Gallery media was fully visible before intro completion.',
  );
  assert(
    initialRevealState.pseudoContent === 'none',
    'The legacy per-card gallery curtain is still present.',
  );
  const initialItemRects = await motionPage.locator('.gallery-grid-item').evaluateAll((items) =>
    items.slice(0, 5).map((item) => {
      const rect = item.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
  );
  await motionPage.evaluate(() => {
    document.documentElement.dataset.introComplete = 'true';
  });
  const delayedRevealState = await motionPage
    .locator('.gallery-media-reveal')
    .nth(1)
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const clipValues = style.clipPath.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
      return {
        animationDelay: style.animationDelay,
        clipPath: style.clipPath,
        isFullyOpen: clipValues.length > 0 && clipValues.every((value) => Math.abs(value) < 0.01),
      };
    });
  const delayMs = Number.parseFloat(delayedRevealState.animationDelay) * 1000;
  assert(delayMs > 0, 'Gallery reveal delay is not applied to staggered media.');
  assert(!delayedRevealState.isFullyOpen, 'Gallery media opened prematurely at animation start.');
  await motionPage.waitForTimeout(Math.max(1, Math.min(delayMs / 2, 40)));
  const duringDelayState = await motionPage
    .locator('.gallery-media-reveal')
    .nth(1)
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const clipValues = style.clipPath.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
      return {
        clipPath: style.clipPath,
        isFullyOpen: clipValues.length > 0 && clipValues.every((value) => Math.abs(value) < 0.01),
      };
    });
  assert(!duringDelayState.isFullyOpen, 'Gallery media opened during animation delay.');
  await motionPage.waitForTimeout(delayMs + 700);
  const finalRevealState = await readGalleryRevealState();
  assert(finalRevealState.isFullyOpen, 'Gallery media did not reach the fully open clip state.');
  const finalItemRects = await motionPage.locator('.gallery-grid-item').evaluateAll((items) =>
    items.slice(0, 5).map((item) => {
      const rect = item.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
  );
  initialItemRects.forEach((initialRect, index) => {
    const finalRect = finalItemRects[index];
    assert(finalRect, `Missing final gallery rect at index ${index}.`);
    for (const key of ['x', 'y', 'width', 'height']) {
      assert(
        Math.abs(initialRect[key] - finalRect[key]) <= 1,
        `Gallery card geometry shifted beyond 1px for ${key} at index ${index}.`,
      );
    }
  });
  for (const viewport of [
    { width: 268, height: 582 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await motionPage.setViewportSize(viewport);
    await motionPage.goto(baseURL);
    await motionPage.locator('.gallery-grid').waitFor();
    const breakpointInitial = await readGalleryRevealState();
    assert(
      !breakpointInitial.isFullyOpen,
      `Media was open before intro at ${viewport.width}x${viewport.height}.`,
    );
    await motionPage.evaluate(() => {
      document.documentElement.dataset.introComplete = 'true';
    });
    await motionPage.waitForTimeout(1400);
    const breakpointFinal = await readGalleryRevealState();
    assert(
      breakpointFinal.isFullyOpen,
      `Media did not reach the open clip state at ${viewport.width}x${viewport.height}.`,
    );
  }
  assert(
    (await motionPage.locator('iframe[src*="player.vimeo.com"]').count()) === 0,
    'Vimeo iframe mounted before user intent.',
  );
  assert(
    (await motionPage.locator('img[fetchpriority="high"]').count()) <= 1,
    'More than one image has high fetch priority.',
  );
  assert(
    (await motionPage.locator('img[loading="eager"]').count()) <= 1,
    'More than one image is eager-loaded.',
  );
  const responsiveGridImage = motionPage.locator('.gallery-grid-item img[sizes]').first();
  if (await responsiveGridImage.count()) {
    assert(
      (await responsiveGridImage.getAttribute('sizes'))?.includes('10vw'),
      'Grid image sizes do not match the narrow columns.',
    );
  }
  const videoPreview = motionPage.locator('.gallery-grid-video-placeholder').first();
  if (await videoPreview.count()) {
    await videoPreview.hover();
    await motionPage.locator('iframe[src*="player.vimeo.com"]').first().waitFor();
  }
  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.route('**/data/query/production?**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ result: sanityResultFor(route.request().url()), ms: 1 }),
    }),
  );
  await reducedPage.route('https://cdn.sanity.io/images/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await reducedPage.goto(baseURL);
  await reducedPage.locator('.gallery-grid').waitFor();
  await reducedPage.evaluate(() => {
    document.documentElement.dataset.introComplete = 'true';
  });
  await reducedPage.waitForTimeout(100);
  const reducedRevealState = await reducedPage
    .locator('.gallery-media-reveal')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const clipValues = style.clipPath.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
      return {
        animationName: style.animationName,
        clipPath: style.clipPath,
        isFullyOpen: clipValues.length > 0 && clipValues.every((value) => Math.abs(value) < 0.01),
        opacity: style.opacity,
        transform: style.transform,
      };
    });
  assert(
    reducedRevealState.animationName === 'none',
    'Reduced motion did not disable gallery animation.',
  );
  assert(reducedRevealState.isFullyOpen, 'Reduced motion did not open gallery media immediately.');
  assert(reducedRevealState.opacity === '1', 'Reduced motion changed gallery media opacity.');
  assert(
    reducedRevealState.transform === 'none',
    'Reduced motion left a gallery media transform active.',
  );
  await reducedContext.close();
  await motionPage.locator('[data-project-id="bugonia"]').first().click();
  await motionPage.waitForURL('**/projects/bugonia');
  assert(
    (await motionPage.locator('.portfolio-scene[data-transition-phase="project"]').count()) === 1,
    'Normal-motion opening did not settle.',
  );
  await motionPage.locator('button[data-transition-control]').click();
  await motionPage.waitForURL(baseURL + '/');
  await motionPage.locator('.portfolio-scene[data-transition-phase="idle"]').waitFor();
  await motionContext.close();

  const loadingContext = await browser.newContext();
  const loadingPage = await loadingContext.newPage();
  await loadingPage.route('**/data/query/production?**', async (route) => {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ result: sanityResultFor(route.request().url()), ms: 1 }),
    });
  });
  await loadingPage.goto(baseURL);
  await loadingPage
    .locator('[aria-busy="true"][aria-label="Loading project content"]')
    .waitFor({ state: 'attached' });
  await loadingContext.close();

  const errorContext = await browser.newContext();
  const errorPage = await errorContext.newPage();
  await errorPage.route('**/data/query/production?**', (route) =>
    route.fulfill({ status: 500, body: 'CMS unavailable' }),
  );
  await errorPage.goto(baseURL);
  await errorPage.getByRole('alert').waitFor();
  assert(
    (await errorPage.locator('[data-project-id]').count()) === 0,
    'CMS error exposed a local project fallback.',
  );
  await errorContext.close();

  assert(errors.length === 0, `Browser page errors: ${errors.join(' | ')}`);
  console.log(
    'Task 3 browser verification passed: Bugonia, Newsquest, dynamic project, routing, history, scroll, media, EN/IT, mobile, motion, loading/error.',
  );
} finally {
  await browser.close();
}
