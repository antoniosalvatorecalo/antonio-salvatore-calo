#!/usr/bin/env node
// Points git at the versioned hooks in .githooks/. Runs on `npm install` (prepare)
// and never fails the install: outside a git checkout (e.g. Vercel) it is a no-op.
import { execSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
  for (const hook of ['pre-commit', 'commit-msg']) {
    if (existsSync(`.githooks/${hook}`)) chmodSync(`.githooks/${hook}`, 0o755);
  }
  console.warn('  ✓ Hook git attivi (.githooks/: pre-commit, commit-msg)');
} catch {
  // Not a git checkout or git unavailable: nothing to install.
}
