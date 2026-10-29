// Shared Playwright helpers for the scripts in scripts/verify/.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ARTIFACTS_ROOT = path.resolve('.artifacts/test-results');

const executableByPlatform = {
  win32: 'chrome-win64/chrome.exe',
  darwin: 'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
  linux: 'chrome-linux/chrome',
};

function browserCacheDir() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (process.platform === 'win32') {
    return path.resolve(
      process.env.LOCALAPPDATA ?? path.resolve(homedir(), 'AppData/Local'),
      'ms-playwright',
    );
  }
  if (process.platform === 'darwin') return path.resolve(homedir(), 'Library/Caches/ms-playwright');
  return path.resolve(homedir(), '.cache/ms-playwright');
}

/**
 * Explicit env path first, then the newest locally installed Chromium, so a
 * Playwright upgrade does not break verification before `playwright install`.
 * Returns undefined to let Playwright pick its own default.
 */
export function resolveChromiumExecutable() {
  const fromEnv =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (fromEnv) return fromEnv;
  const cache = browserCacheDir();
  const relative = executableByPlatform[process.platform];
  if (!relative || !existsSync(cache)) return undefined;
  return readdirSync(cache)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    .map((name) => path.resolve(cache, name, relative))
    .find(existsSync);
}

export function launchChromium(options = {}) {
  const executablePath = resolveChromiumExecutable();
  return chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    ...options,
  });
}

/** Creates and returns .artifacts/test-results/<name> (git-ignored). */
export function artifactsDir(name) {
  const dir = path.join(ARTIFACTS_ROOT, name);
  mkdirSync(dir, { recursive: true });
  return dir;
}
