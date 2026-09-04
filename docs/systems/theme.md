# Theme Management System

**Files**: `useTheme` → `ThemeProvider` → CSS variables | **Owner**: Engineering

## Architecture

```
User toggle → localStorage → ThemeContext → data-theme attr → CSS variables
                                        ↓
                              OS prefers-color-scheme (fallback)
```

**File**: `src/hooks/useTheme.ts`
**Provider**: `src/providers/ThemeProvider.tsx`

## Data Flow

1. **Init**: Read `localStorage` (theme key).
   - Found → apply stored preference.
   - Not found → read `prefers-color-scheme` OS preference.
2. **Toggle**: Set new theme → `localStorage.setItem()` → update `data-theme` on `<html>`.
3. **CSS**: All color tokens defined under `[data-theme="dark"]` and `[data-theme="light"]`.

```typescript
const { theme, toggleTheme } = useTheme();
// 'dark' | 'light'
```

## Visual Tokens (OKLCH)

| Token | Dark | Light |
|-------|------|-------|
| `--color-bg` | `oklch(0.13 0.005 300)` | `oklch(0.96 0.005 300)` |
| `--color-text` | `oklch(0.92 0.005 300)` | `oklch(0.15 0.005 300)` |
| `--color-muted` | `oklch(0.39 0.008 300)` | `oklch(0.56 0.008 300)` |
| `--color-ui-border` | `oklch(0.22 0.008 300)` | `oklch(0.82 0.008 300)` |

All pairs exceed WCAG AA 4.5:1. OKLCH = perceptual uniformity, wider gamut.

## Provider Location

`ThemeProvider` is mounted at the page/layout that exposes a theme toggle (typically the layouts that render `SiteHeader` with the toggle active). It is **not** a top-level provider.

```
LanguageProvider (top-level) → BrowserRouter → { layout with ThemeProvider }
```

## Theme Toggle UI

The theme toggle is part of `SiteHeader`. It binds to `useTheme()`:

- Toggles between `'dark'` and `'light'`.
- Icon swaps between sun and moon via `AnimatePresence mode="wait"`.
- Icon rotation: `rotate: useReducedMotionPreference() ? 0 : 180`.

## Glass Nav Effect

`SiteHeader` uses theme-aware glass:

```css
background: rgba(var(--color-bg-rgb), 0.85);
backdrop-filter: blur(12px);
```

`--color-bg-rgb` is derived from the OKLCH token — it adapts per theme.

## Lifecycle

1. **Layout mount**: `ThemeProvider` reads localStorage + OS preference → sets initial `data-theme`.
2. **Toggle**: User clicks → `toggleTheme()` flips → localStorage persists → CSS vars swap.
3. **OS change**: `prefers-color-scheme` change event detected (if no localStorage override).
4. **Unmount**: Theme persists in localStorage — survives page reload.

## Dependencies

- No external dependencies — pure React Context + CSS variables.
- `localStorage` API for persistence.
- `window.matchMedia('prefers-color-scheme: dark')` for OS detection.

## Extension Points

- **Add theme token**: Add CSS variable in both `[data-theme="dark"]` and `[data-theme="light"]` blocks.
- **New theme**: Add `data-theme="sepia"` CSS block + update toggle to cycle 3 states.
- **Theme-aware component**: Use `var(--color-*)` in CSS or `useTheme()` in React.
- **Animated theme switch**: Add CSS `transition` on `--color-*` variables for smooth color morph.
