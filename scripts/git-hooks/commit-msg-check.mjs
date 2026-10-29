#!/usr/bin/env node
// =============================================================================
// commit-msg-check.mjs — Italian Conventional Commits gate
// =============================================================================
// Called by .githooks/commit-msg with the path of the message file.
// Rules and examples: docs/git-e-commit.md
//
// Usage:
//   node scripts/git-hooks/commit-msg-check.mjs .git/COMMIT_EDITMSG
//   node scripts/git-hooks/commit-msg-check.mjs --message "fix(seo): correggi canonical"
// =============================================================================

import { readFileSync } from 'node:fs';

const TYPES = [
  'feat',
  'fix',
  'seo',
  'content',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const MAX_SUBJECT = 72;
const SUBJECT = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9][a-z0-9/-]*\\))?!?: (.+)$`);

// English verbs that usually open an English subject ("add …", "fix …").
const ENGLISH_OPENERS = new Set(
  'add adds added update updates updated fix fixes fixed remove removes removed refactor improve improves change changes create creates implement implements make use set allow clean align refine restore polish bump merge move rename delete enable disable replace support handle prevent ensure introduce initial'.split(
    ' ',
  ),
);
const ENGLISH_WORDS = new Set(
  'the and with for to of on from into when by is are this that it be should'.split(' '),
);
const ITALIAN_WORDS = new Set(
  'il lo la i gli le di del della dei delle e per con da in nel nella nei che un una al alla sul sulla non più come'.split(
    ' ',
  ),
);

const TRAILER = /^[A-Za-z][A-Za-z-]*: /;

function words(text) {
  return (
    text
      // Code and quoted titles (e.g. reverted English commits) are not prose.
      .replace(/`[^`]*`|"[^"]*"/g, ' ')
      .toLowerCase()
      .split(/[^a-zàèéìòù]+/)
      .filter(Boolean)
  );
}

function checkMessage(raw) {
  const lines = raw
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trim()
    .split('\n');
  const subject = lines[0] ?? '';
  const errors = [];
  const warnings = [];

  if (/^(Merge |fixup! |squash! |amend! )/.test(subject)) return { errors, warnings };
  if (subject.startsWith('Revert "')) {
    warnings.push('Revert in inglese generato da git: preferisci `npm run annulla -- <hash>`.');
    return { errors, warnings };
  }

  const match = subject.match(SUBJECT);
  if (!match) {
    errors.push(
      `Il titolo deve essere "<tipo>(<ambito>): <descrizione>". Tipi: ${TYPES.join(', ')}.`,
    );
    return { errors, warnings };
  }
  const description = match[3];
  if (subject.length > MAX_SUBJECT) {
    errors.push(`Titolo troppo lungo (${subject.length}/${MAX_SUBJECT} caratteri).`);
  }
  if (description.length < 10) errors.push('Descrizione troppo corta: spiega cosa cambia.');
  if (description.endsWith('.')) errors.push('Il titolo non termina con il punto.');
  if (lines.length > 1 && lines[1].trim() !== '') {
    errors.push('Lascia una riga vuota tra titolo e corpo.');
  }

  const firstWord = words(description)[0];
  if (firstWord && ENGLISH_OPENERS.has(firstWord)) {
    errors.push(
      `"${firstWord}" è inglese: usa l'imperativo italiano (aggiungi, correggi, rimuovi…).`,
    );
  }
  const prose = [description, ...lines.slice(1).filter((line) => !TRAILER.test(line))].join(' ');
  const tokens = words(prose);
  const english = tokens.filter((token) => ENGLISH_WORDS.has(token)).length;
  const italian = tokens.filter((token) => ITALIAN_WORDS.has(token)).length;
  if (english >= 2 && english > italian) {
    errors.push('Il messaggio sembra in inglese: scrivi titolo e corpo in italiano.');
  }
  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);
  const raw =
    args[0] === '--message'
      ? (args[1] ?? '')
      : readFileSync(args[0] ?? '.git/COMMIT_EDITMSG', 'utf8');
  const { errors, warnings } = checkMessage(raw);
  for (const warning of warnings) console.warn(`  \x1b[33m!\x1b[0m ${warning}`);
  if (errors.length === 0) return;
  console.error('\x1b[31m── Messaggio di commit non valido ──\x1b[0m');
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.error('\n  Esempio: fix(seo): allinea canonical al dominio principale');
  console.error('  Regole:  docs/git-e-commit.md\n');
  process.exit(1);
}

main();
