import {chromium} from '@playwright/test'
import {createClient} from '@sanity/client'
import {existsSync, readdirSync} from 'node:fs'
import {homedir} from 'node:os'
import {resolve} from 'node:path'
import {PROJECTS_QUERY, SITE_SETTINGS_QUERY} from '../src/cms/queries.ts'

const baseURL = 'http://127.0.0.1:3000'
const expectedLabels = [
  'File Bugonia Thumbnail', 'vimeo-1199753560', 'Context-Brief',
  'The problem-Core solution', 'vimeo-1168053760', 'vimeo-1200768494',
  'Bugonia-menu', 'Bugonia-mobile', 'vimeo-1198695116',
  'Bugonia-home-desktop-mobile', 'vimeo-1203484215', 'vimeo-1199819630',
  'Bugonia-Booking-Tiket', 'vimeo-1199746160', 'vimeo-1204855852',
  'Merchandaising', 'Merch_Mobile',
]

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const liveClient = createClient({
  projectId: 'dw4juo8a',
  dataset: 'production',
  apiVersion: '2026-09-06',
  useCdn: false,
})
const [liveProjects, liveSiteSettings] = await Promise.all([
  liveClient.fetch(PROJECTS_QUERY),
  liveClient.fetch(SITE_SETTINGS_QUERY),
])
assert(liveSiteSettings?._id === undefined || liveSiteSettings?.displayName, 'Live Sanity query did not return siteSettings.')
const liveBugonia = liveProjects.find((project) => project._id === 'project-bugonia')
const liveNewsquest = liveProjects.find((project) => project._id === 'project-newsquest')
assert(liveBugonia?.gallery?.length === 17, 'Live Sanity query did not return 17 Bugonia media.')
assert(liveNewsquest?.gallery?.length === 6, 'Live Sanity query did not return 6 Newsquest media.')
const thirdProject = {
  ...liveNewsquest,
  _id: 'project-dynamic-test',
  slug: {current: 'dynamic-test'},
  order: 2,
  title: {en: 'Dynamic CMS Test', it: 'Test CMS dinamico'},
  gallery: [{
    ...liveNewsquest.gallery[0],
    _key: 'dynamic-test-media-01',
    image: {
      ...liveNewsquest.gallery[0].image,
      asset: {
        ...liveNewsquest.gallery[0].image.asset,
        url: `${liveNewsquest.gallery[0].image.asset.url}?dynamic-test=1`,
      },
    },
  }],
}
const sanityFixture = [...liveProjects, thirdProject]
const sanityResultFor = (url) => new URL(url).searchParams.get('query')?.includes('siteSettings')
  ? liveSiteSettings
  : sanityFixture

const browserCache = resolve(process.env.LOCALAPPDATA || resolve(homedir(), 'AppData', 'Local'), 'ms-playwright')
const installedChromium = readdirSync(browserCache)
  .filter((name) => /^chromium-\d+$/.test(name))
  .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  .map((name) => resolve(browserCache, name, 'chrome-win64', 'chrome.exe'))
  .find(existsSync)
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
const launchOptions = {
  headless: true,
  ...(installedChromium ? {executablePath: installedChromium} : {}),
  ...(proxy ? {proxy: {server: proxy, bypass: 'localhost,127.0.0.1'}} : {}),
}
const browser = await chromium.launch(launchOptions)
const context = await browser.newContext({reducedMotion: 'reduce'})
const page = await context.newPage()
await page.route('**/data/query/production?**', async (route) => {
  await route.fulfill({
    contentType: 'application/json',
    headers: {'access-control-allow-origin': '*'},
    body: JSON.stringify({result: sanityResultFor(route.request().url()), ms: 1}),
  })
})
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

try {
  await page.goto(baseURL)
  await page.locator('[data-project-id="bugonia"]').first().waitFor({timeout: 15_000}).catch(async (error) => {
    console.error('Home diagnostic:', await page.locator('body').innerText(), errors, await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name).filter((url) => url.includes('sanity.io'))))
    throw error
  })
  assert(await page.locator('[data-project-id="bugonia"]').count() === 17, 'Expected 17 Bugonia media in the grid.')
  assert(await page.locator('[data-project-id="newsquest"]').count() === 6, 'Expected 6 Sanity Newsquest media in the grid.')
  await page.getByText('antonio.salvatore.calo@gmail.com').waitFor()
  assert((await page.title()).includes('Antonio Salvatore Calò'), 'Global CMS SEO title was not applied.')

  for (let index = 0; index < expectedLabels.length; index += 1) {
    await page.locator('[data-project-id="bugonia"]').nth(index).click()
    await page.waitForURL('**/projects/bugonia')
    const label = await page.locator('.single-project-name').textContent()
    assert(label?.includes(expectedLabels[index]), `Bugonia media ${index + 1} selected the wrong item: ${label}`)
    await page.goto(baseURL)
    await page.locator('[data-project-id="bugonia"]').first().waitFor()
  }

  await page.locator('[data-project-id="bugonia"]').nth(1).click()
  await page.waitForURL('**/projects/bugonia')
  assert((await page.title()).includes('Bugonia'), 'Project SEO title was not applied.')
  assert((await page.locator('.single-project-video iframe').getAttribute('src'))?.includes('1199753560'), 'Vimeo selection was not preserved.')
  await page.goBack()
  await page.waitForURL(baseURL + '/')
  await page.goForward()
  await page.waitForURL('**/projects/bugonia')

  await page.reload()
  await page.locator('.single-project-video iframe').waitFor()
  await page.goto(baseURL)
  await page.locator('[data-project-id="bugonia"]').first().click()
  await page.waitForURL('**/projects/bugonia')
  await page.locator('.single-project-image-container').waitFor()
  await page.locator('.single-project-image-container').click()
  await page.locator('.lightbox').waitFor()
  await page.locator('.lightbox-close').click({force: true})

  await page.goto(`${baseURL}/projects/newsquest`)
  await page.locator('.single-project-image-container').waitFor()
  assert((await page.locator('.single-project-name').textContent())?.includes('Thumbnail'), 'Newsquest Sanity route failed.')

  for (let index = 0; index < 6; index += 1) {
    await page.goto(baseURL)
    await page.locator('[data-project-id="newsquest"]').nth(index).click()
    await page.waitForURL('**/projects/newsquest')
    const label = await page.locator('.single-project-name').textContent()
    assert(label?.includes(index === 0 ? 'Thumbnail' : String(index)), `Newsquest media ${index + 1} selected the wrong item.`)
  }

  await page.goto(baseURL)
  await page.locator('[data-project-id="dynamic-test"]').click()
  await page.waitForURL('**/projects/dynamic-test')
  await page.getByText('Dynamic CMS Test').first().waitFor()

  await page.goto(`${baseURL}/projects/bugonia`)
  await page.getByText('Cinema ticketing is often marginal or outsourced.').waitFor()
  const languageButtons = page.locator('button[aria-label^="Language:"]')
  for (let index = 0; index < await languageButtons.count(); index += 1) {
    if (await languageButtons.nth(index).isVisible()) {
      await languageButtons.nth(index).click()
      break
    }
  }
  await page.getByText('Il ticketing cinematografico è spesso marginale o esternalizzato.').waitFor()

  await page.setViewportSize({width: 390, height: 844})
  await page.reload()
  await page.locator('.single-project-image-container').waitFor()
  assert(await page.locator('.single-project-view').isVisible(), 'Bugonia is not visible at the mobile viewport.')

  const motionContext = await browser.newContext({reducedMotion: 'no-preference'})
  const motionPage = await motionContext.newPage()
  await motionPage.route('**/data/query/production?**', (route) => route.fulfill({
    contentType: 'application/json',
    headers: {'access-control-allow-origin': '*'},
    body: JSON.stringify({result: sanityResultFor(route.request().url()), ms: 1}),
  }))
  await motionPage.route('https://cdn.sanity.io/images/**', (route) => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
  }))
  await motionPage.goto(baseURL)
  await motionPage.locator('[data-project-id="bugonia"]').first().click()
  await motionPage.waitForURL('**/projects/bugonia')
  assert(await motionPage.locator('.portfolio-scene[data-transition-phase="project"]').count() === 1, 'Normal-motion opening did not settle.')
  await motionPage.locator('button[data-transition-control]').click()
  await motionPage.waitForURL(baseURL + '/')
  await motionPage.locator('.portfolio-scene[data-transition-phase="idle"]').waitFor()
  await motionContext.close()

  const loadingContext = await browser.newContext()
  const loadingPage = await loadingContext.newPage()
  await loadingPage.route('**/data/query/production?**', async (route) => {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500))
    await route.fulfill({contentType: 'application/json', body: JSON.stringify({result: sanityResultFor(route.request().url()), ms: 1})})
  })
  await loadingPage.goto(baseURL)
  await loadingPage.locator('[aria-busy="true"][aria-label="Loading project content"]').waitFor({state: 'attached'})
  await loadingContext.close()

  const errorContext = await browser.newContext()
  const errorPage = await errorContext.newPage()
  await errorPage.route('**/data/query/production?**', (route) => route.fulfill({status: 500, body: 'CMS unavailable'}))
  await errorPage.goto(baseURL)
  await errorPage.getByRole('alert').waitFor()
  assert(await errorPage.locator('[data-project-id]').count() === 0, 'CMS error exposed a local project fallback.')
  await errorContext.close()

  assert(errors.length === 0, `Browser page errors: ${errors.join(' | ')}`)
  console.log('Task 3 browser verification passed: Bugonia, Newsquest, dynamic project, routing, history, scroll, media, EN/IT, mobile, motion, loading/error.')
} finally {
  await browser.close()
}
