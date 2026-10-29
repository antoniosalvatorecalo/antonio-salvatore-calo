#!/usr/bin/env node
// =============================================================================
// annulla.mjs — safe, history-preserving undo with an Italian commit message
// =============================================================================
// Never rewrites history: it creates a new commit that reverts the changes.
//
// Usage:
//   npm run annulla -- <hash>          undo one commit
//   npm run annulla -- --dal <ref>     undo every commit after <ref> (ref excluded)
//   npm run annulla -- --anteprima <hash>   show what would be undone
// Docs: docs/git-e-commit.md
// =============================================================================

import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function fail(message) {
  console.error(`  ✗ ${message}`);
  process.exit(1);
}

function resolveCommit(ref) {
  try {
    return git('rev-parse', '--verify', `${ref}^{commit}`);
  } catch {
    return fail(`"${ref}" non è un commit valido.`);
  }
}

const args = process.argv.slice(2);
const preview = args.includes('--anteprima');
const fromIndex = args.indexOf('--dal');
const ref = fromIndex >= 0 ? args[fromIndex + 1] : args.find((arg) => !arg.startsWith('--'));
if (!ref) fail('Indica un commit: npm run annulla -- <hash>  oppure  -- --dal <hash>');

const target = resolveCommit(ref);
const range = fromIndex >= 0 ? `${target}..HEAD` : null;
const commits = range ? git('rev-list', range).split('\n').filter(Boolean) : [target];
if (commits.length === 0) fail(`Nessun commit dopo ${ref}.`);
for (const hash of commits) {
  if (git('rev-list', '--parents', '-n', '1', hash).split(' ').length > 2) {
    fail(`${hash.slice(0, 7)} è un merge: usa "git revert -m 1 ${hash.slice(0, 7)}" a mano.`);
  }
}

const summary = commits.map((hash) => `  ${git('log', '-1', '--format=%h %s', hash)}`).join('\n');
console.warn(`Commit da annullare:\n${summary}\n`);
console.warn(git('diff', '--stat', range ? target : `${target}^`, range ? 'HEAD' : target));
if (preview) process.exit(0);

if (git('status', '--porcelain'))
  fail('Ci sono modifiche non committate: committale o mettile da parte (git stash).');

try {
  execFileSync('git', ['revert', '--no-commit', ...commits], { stdio: 'inherit' });
} catch {
  fail(
    'Conflitto durante il revert. Risolvi i file, poi "git revert --continue", oppure "git revert --abort".',
  );
}

const title =
  commits.length === 1
    ? `revert: annulla il commit ${target.slice(0, 7)}`
    : `revert: annulla ${commits.length} commit successivi a ${target.slice(0, 7)}`;
const body = commits
  .map((hash) => `- ${hash.slice(0, 7)} "${git('log', '-1', '--format=%s', hash)}"`)
  .join('\n');
execFileSync('git', ['commit', '-m', title, '-m', `Commit annullati:\n${body}`], {
  stdio: 'inherit',
});
console.warn('\n  ✓ Annullato con un nuovo commit. Per ripristinare: npm run annulla -- HEAD');
