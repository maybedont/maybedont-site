# Style Guide

**Date:** 2025-02-09
**Status:** Living document

## Dark Mode Palette

All dark mode colors are defined as CSS variables in `assets/css/custom.css` under `:root`.

### Backgrounds

Two-tier frame pattern (GitHub-style): header and footer match, body is lighter.
All backgrounds use a subtle cool tint (consistent +4 blue offset from red channel).

| Element | Variable | Hex | RGB |
|---------|----------|-----|-----|
| Body | `--color-dark-bg` | `#191a1d` | (25, 26, 29) |
| Header | `--color-dark-bg-header` | `#111215` | (17, 18, 21) |
| Footer | `--color-dark-bg-footer` | `#111215` | (17, 18, 21) |

### Text

Dimmed from Hextra's default ~#f3f3f5 to reduce contrast and eye strain (halation effect).

| Usage | Variable | Hex | Notes |
|-------|----------|-----|-------|
| Body text | `--color-text-dark` | `#d1d1d6` | Primary reading text |
| Headings | `--color-text-dark-heading` | `#e0e0e4` | Brighter than body, not glaring |
| Bold/strong | `--color-text-dark-bold` | `#dedad6` | Warm tint for emphasis without brightness |
| Muted text | `--color-text-muted-dark` | `#9ca3af` | Secondary/metadata text |

### Bold in Dark Mode

- Font weight reduced from 700 to 600 in dark mode (compensates for optical bolding effect where light text on dark backgrounds appears heavier than it is)
- Uses a subtle warm tint (`#dedad6`) rather than brighter white for emphasis
- Scoped to `.docs .content` to avoid affecting home page hero/CTAs

### Prose Links in Dark Mode

- Doc content links show primary color (no underline), underline on hover
- Scoped to `.docs .content` with exclusions for `.hextra-card`, `.cta-primary`, `.cta-secondary`
- Light mode: `var(--color-primary)` (`#1A40E5`)
- Dark mode: `var(--color-primary-dark)` (`#6699FF`)

### Design Decisions

1. **Cool-tinted backgrounds** — Pure neutral grays (#1a1a1a) appeared warm/brownish next to darker grays due to simultaneous contrast illusion. A subtle blue shift (+4B) gives a softer, more modern feel.

2. **Two-tier frame** — Header and footer share the same darker color, body is lighter. Simpler and more conventional than three-tier. GitHub uses this pattern.

3. **Warm tint for bold** — Using brighter white for bold in dark mode caused eye strain. A warm tint creates visual distinction without adding brightness. Font weight is also reduced (700 to 600) since light-on-dark text already appears optically heavier.

4. **Hextra Tailwind overrides** — Hextra's `hx:dark:bg-dark` Tailwind utility requires `!important` to override. The nav-specific rule must come AFTER the generic `[class*="dark:bg-dark"]` rule in the cascade so it wins. This is a documented exception to the project's "avoid !important" guideline.

### References

- [Dark Mode UI Best Practices (atmos.style)](https://atmos.style/blog/dark-mode-ui-best-practices) — Section 7 on background lightness
- Google Material Design recommends #121212 as minimum dark background

## Known Follow-up Work

### Home Page Graphics

The home page feature graphics (Observability audit table, Compliance config panel, Prevention terminal) and the hero terminal may need color adjustments to better complement the new cool-tinted dark background (`#191a1d`). The graphics were originally designed against Hextra's `#111111`.

### About Page

The about page terminal and layout may need similar color adjustments for the new dark mode palette.
