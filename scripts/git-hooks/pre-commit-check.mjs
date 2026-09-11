#!/usr/bin/env node
// =============================================================================
// pre-commit-check.mjs — Commit Quality Gate (Node.js)
// =============================================================================
// Blocks commits containing forbidden artifacts. Called by the pre-commit hook.
//
// Usage:
//   node scripts/git-hooks/pre-commit-check.mjs        # staged changes
//   node scripts/git-hooks/pre-commit-check.mjs --check # working tree
//   node scripts/git-hooks/pre-commit-check.mjs --help  # show help
// =============================================================================

import { execSync } from 'child_process';
import { existsSync, statSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ── Config ──────────────────────────────────────────────────────────────────
const ALLOWED_VSCODE = new Set(['.vscode/extensions.json', '.vscode/settings.json']);

// Categories: [pattern, description] — pattern is a function returning boolean
const BLOCKERS = [
  // 1. Build output
  [(f) => f.startsWith('dist/') || f.startsWith('build/'), 'Build output directory'],
  // 2. Dependencies
  [(f) => f.startsWith('node_modules/'), 'Dependencies directory'],
  // 3. Cache / coverage
  [
    (f) =>
      f.endsWith('.tsbuildinfo') ||
      f.includes('.cache/') ||
      f.startsWith('.cache/') ||
      f.startsWith('coverage/'),
    'Cache or coverage artifact',
  ],
  // 4. Logs
  [(f) => f.endsWith('.log') || f.startsWith('npm-debug.log'), 'Log file'],
  // 5. Temp files
  [(f) => f.endsWith('.tmp') || f.endsWith('.temp') || f.endsWith('~'), 'Temporary file'],
  // 6. OS metadata
  [(f) => f === '.DS_Store' || f === 'Thumbs.db' || f === 'desktop.ini', 'OS metadata file'],
  // 7. AI tool runtimes
  [(f) => AI_RUNTIME_PATTERNS.some((p) => f.startsWith(p)), 'AI tool runtime directory'],
  // 8. AI generated output
  [(f) => f.startsWith('graphify-out/'), 'Auto-generated knowledge graph'],
  // 9. AI config / locks
  [(f) => f === 'skills-lock.json' || f === '.mcp.json', 'AI tool config file (local)'],
  // 10. AI build script at root
  [(f) => f === '_build_agency_skills.ps1', 'AI build script (use scripts/ version)'],
  // 11. External AI repos
  [(f) => f.startsWith('agency-agents/'), 'External AI agent repository'],
  // 12. Environment files (except .env.example)
  [
    (f) => f === '.env' || (f.startsWith('.env.') && f !== '.env.example'),
    'Environment file (use .env.example)',
  ],
  // 13. Editor files (except allowed VSCode)
  [
    (f) =>
      (f.startsWith('.vscode/') && !ALLOWED_VSCODE.has(f)) ||
      f.startsWith('.idea/') ||
      f.endsWith('.swp') ||
      f.endsWith('.swo'),
    'Editor/IDE file',
  ],
  // 14. Planning / vault
  [(f) => f.startsWith('.planning/'), 'GSD planning directory (local)'],
  [(f) => f.startsWith('Maximum Effort/'), 'Obsidian personal vault'],
  [(f) => f === '.vercel', 'Vercel local config'],
  // 15. Screenshots outside assets
  [
    (f) => isImage(f) && !f.startsWith('public/') && !f.startsWith('src/assets/'),
    'Image outside public/ or src/assets/',
  ],
  // 16. Test run artifacts
  [
    (f) =>
      f.startsWith('stages/04_testing/test-results/') ||
      f.startsWith('stages/04_testing/playwright-report/'),
    'Test run artifacts',
  ],
];

const WARNINGS = [
  // Large files
  [(f) => isLargeFile(f, 10 * 1024 * 1024), (f) => `File exceeds 10 MB (${getSizeMB(f)} MB)`],
  [(f) => isLargeFile(f, 1 * 1024 * 1024), (f) => `File exceeds 1 MB (${getSizeMB(f)} MB)`],
  // Binary in src/
  [(f) => isImage(f) && f.startsWith('src/'), 'Binary file in src/ (consider public/ instead)'],
];

const AI_RUNTIME_PATTERNS = [
  '.opencode/',
  '.codex/',
  '.qwen/',
  '.witsy/',
  '.windsurf/',
  '.aider/',
  '.cursor/',
  '.agent/',
  'ai-output/',
  'ai-experiments/',
  '_agents/',
  '_ai/',
];

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp']);

// ── Helpers ─────────────────────────────────────────────────────────────────
function isImage(f) {
  return IMAGE_EXTS.has(f.slice(f.lastIndexOf('.')).toLowerCase());
}

function isLargeFile(f, threshold) {
  try {
    return existsSync(f) && statSync(f).size >= threshold;
  } catch {
    return false;
  }
}

function getSizeMB(f) {
  try {
    return (statSync(f).size / (1024 * 1024)).toFixed(1);
  } catch {
    return '?';
  }
}

// ── Hook Installation ───────────────────────────────────────────────────────
function installHook() {
  const isWin = process.platform === 'win32';

  // Use POSIX shell script — works on macOS, Linux, and Git Bash for Windows
  // Git for Windows bundles MSYS2 which executes #!/bin/sh scripts natively
  const hookContent = `#!/bin/sh
# pre-commit hook — delegates to the Node.js quality gate
# Installed by: npm run hooks:install
# Skip: git commit --no-verify

node "$(dirname "$0")/../../scripts/git-hooks/pre-commit-check.mjs"
if [ $? -ne 0 ]; then
    exit 1
fi
exit 0
`;

  const hookPath = resolve('.git/hooks/pre-commit');
  try {
    writeFileSync(hookPath, hookContent, 'utf8');
    if (!isWin) {
      execSync(`chmod +x "${hookPath}"`, { stdio: 'ignore' });
    }
    console.log(`  ✓ Installed pre-commit hook to ${hookPath}`);
    console.log('  To skip for a single commit: git commit --no-verify -m "message"');
  } catch (err) {
    console.error(`  ✗ Failed to install hook: ${err.message}`);
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
  Usage: node scripts/git-hooks/pre-commit-check.mjs [options]

  Options:
    --check          Scan working tree (all untracked + tracked files)
    --hook-install   Install the pre-commit hook into .git/hooks/
    --help           Show this help

  Default: scans staged changes (git diff --cached)
    `);
    process.exit(0);
  }

  if (args.includes('--hook-install')) {
    installHook();
    process.exit(0);
  }

  const mode = args.includes('--check') ? 'working tree' : 'staged changes';

  // Get list of files to check
  let files;
  if (mode === 'working tree') {
    // All files not ignored by git
    const tracked = execSync('git ls-files', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    files = [...new Set([...tracked, ...untracked])];
  } else {
    // Staged changes (added, copied, modified, renamed)
    files = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  }

  const blocked = [];
  const warnings = [];

  for (const f of files) {
    // Check blockers
    for (const [test, desc] of BLOCKERS) {
      const result = test(f);
      if (typeof result === 'string') {
        blocked.push({ file: f, reason: result });
      } else if (result === true) {
        blocked.push({ file: f, reason: desc });
      }
    }

    // Check warnings
    for (const [test, descOrFn] of WARNINGS) {
      if (test(f)) {
        const reason = typeof descOrFn === 'function' ? descOrFn(f) : descOrFn;
        warnings.push({ file: f, reason });
      }
    }
  }

  // ── Output ──────────────────────────────────────────────────────────────
  console.log(`\x1b[36m── Commit Quality Gate ──────────────────────────────────\x1b[0m`);
  console.log(`  Checking ${mode}...\n`);

  for (const { file, reason } of blocked) {
    console.log(`  \x1b[31m  BLOCKED\x1b[0m  ${file}  (${reason})`);
    // Also print what to do
    if (reason.includes('Environment file')) {
      console.log(`    → Create .env.example instead and ensure .env is gitignored`);
    } else if (reason.includes('Image outside')) {
      console.log(`    → Move to public/ or src/assets/ or add to .gitignore`);
    } else if (reason.includes('Build output')) {
      console.log(`    → Run build, commit source, not output`);
    } else if (reason.includes('Dependencies')) {
      console.log(`    → Commit package.json/package-lock.json, not node_modules/`);
    } else if (reason.includes('AI tool')) {
      console.log(`    → Keep AI runtime local, add to .gitignore`);
    }
  }

  for (const { file, reason } of warnings) {
    console.log(`  \x1b[33m  WARNING\x1b[0m  ${file}  (${reason})`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('');
  if (blocked.length > 0 || warnings.length > 0) {
    console.log(`\x1b[36m── Summary ────────────────────────────────────────────\x1b[0m`);
    if (blocked.length > 0) {
      console.log(
        `  \x1b[31m${blocked.length} BLOCKED\x1b[0m  — fix and re-stage before committing`,
      );
    }
    if (warnings.length > 0) {
      console.log(`  \x1b[33m${warnings.length} WARNINGS\x1b[0m  — review before committing`);
    }
  }

  if (blocked.length > 0) {
    console.log('');
    console.log(`  \x1b[33mTo skip the gate (emergency only): git commit --no-verify\x1b[0m`);
    console.log(`  \x1b[36mSee: docs/repository/COMMIT_GUIDELINES.md\x1b[0m`);
    process.exit(1);
  }

  console.log(`  \x1b[36m✓ Commit gate passed\x1b[0m`);
  process.exit(0);
}

main();
