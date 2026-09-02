#!/usr/bin/env pwsh
# =============================================================================
# Install Git Hooks — Antonio Salvatore Calò — Portfolio (PowerShell)
# =============================================================================
# Installs git hooks from scripts/git-hooks/ to .git/hooks/.
# Run this after cloning or when hooks are updated.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/git-hooks/install.ps1
#   npm run hooks:install
# =============================================================================

$ErrorActionPreference = 'Stop'

$HookSrc = Resolve-Path 'scripts/git-hooks'
$HookDst = Resolve-Path '.git/hooks'

Write-Host '── Installing git hooks ──────────────────────────────' -ForegroundColor Cyan

# Install pre-commit hook (POSIX shell — works with Git Bash on Windows)
$preCommit = @'
#!/bin/sh
# pre-commit hook — delegates to the Node.js quality gate
# Installed by: npm run hooks:install
# Skip: git commit --no-verify

node "$(dirname "$0")/../../scripts/git-hooks/pre-commit-check.mjs"
if [ $? -ne 0 ]; then
    exit 1
fi
exit 0
'@

$preCommit | Set-Content -Path (Join-Path $HookDst 'pre-commit') -NoNewline -Encoding ASCII
Write-Host "  ✓ Installed: pre-commit"

# Preserve existing post-checkout and post-commit hooks (graphify)
foreach ($hook in @('post-checkout', 'post-commit')) {
    $src = Join-Path $HookSrc $hook
    $dst = Join-Path $HookDst $hook
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  ✓ Installed: $hook"
    }
}

Write-Host '──────────────────────────────────────────────────────' -ForegroundColor Cyan
Write-Host '  Hooks installed. To skip for a single commit:'
Write-Host '    git commit --no-verify -m "message"'
Write-Host ''
