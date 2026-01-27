# Homepage Redesign: Hero Terminal + Feature Grid

## Overview

Redesign the homepage with two major changes:
1. **Hero section**: Add an animated CLI terminal graphic alongside the heading
2. **Feature sections**: Replace the current card grid with a 2x2 feature grid using terminal-motif graphics

## Hero Section

### Layout Options

We'll prototype multiple approaches:

- **Option A: 50/50 split** - Text left, terminal right, clean separation
- **Option B: Full-width terminal background** - Terminal spans full width with gradient fade (dark → transparent) on the left so heading/tagline remain readable
- **Option C: 3D perspective terminal** - Terminal tilted in 3D space using CSS transforms (`perspective()` + `rotateY()`) so right edge appears closer to viewer
- **Option D: Combine B + C** - Full-width with gradient fade AND 3D tilt

Start with Option A for simplicity, then experiment with C and D.

### Terminal Design

**Visual treatment:**
- Dark background: `#0a0a0a` or `#111`
- Subtle rounded corners (0.5-1rem)
- No window chrome - content only
- Monospace font: system-ui monospace or JetBrains Mono

**Colors:**
- Prompt character `>`: Brand blue `#6699FF` (good contrast on dark)
- Command text: Bright white `#f3f4f6`
- Cursor: White, blinking (~1s interval CSS animation)

### Typing Animation

Commands cycle with a typing effect, pause, clear, then type the next. Mix of mundane and risky commands across different audiences:

1. `clean up my database` (developer)
2. `invoice acme corp with a 10% increase from Q1` (finance)
3. `archive inactive customer accounts` (admin)
4. `send the Q4 report to all stakeholders` (business ops)
5. `close out unused GitHub issues` (developer)
6. `delete all test users from production` (developer - risky)

Animation timing:
- Type each character: ~50-80ms interval
- Pause after complete command: ~2s
- Clear and start next: ~300ms transition

## Feature Grid

### Grid Structure

- 2x2 grid layout
- Subtle 1px borders between cells using `--color-border` / `--color-border-dark`
- Consistent padding: 2-3rem per cell
- Mobile: Collapses to single column

### Cell Content (top to bottom)

1. **Heading** - Feature name
2. **Description** - One sentence (existing subtitle copy)
3. **Graphic** - Terminal-motif illustration

### Feature Graphics (Terminal Motif)

All graphics use CSS/SVG - no images. Shared visual treatment:
- Dark backgrounds matching hero terminal
- Brand blue accents for highlights
- Consistent border-radius and padding
- Optional subtle CSS animations

#### Observability
Multiple small terminal windows in a grid or staggered arrangement. Each shows activity indicators: blinking dots, streaming lines, or pulsing elements. Conveys "watching many things at once."

#### Standards Enforcement
A terminal window with abstract "code" lines (rectangles). Some lines show a checkmark in brand blue, others show warning/x indicators. Conveys "pass/fail validation."

#### Auditing
Terminal showing scrolling log-style output - horizontal lines of varying lengths. Certain lines are highlighted or flagged with a marker icon. Conveys "reviewing and flagging."

#### Regret Prevention
Terminal with a command entered but in a "pause" state. Visual treatment could include: stopped cursor, subtle barrier/gate graphic, or speech bubble hint. Conveys "intervention before action."

## Technical Implementation

### Files to Create/Modify

1. **`content/_index.md`** - Update homepage markup structure
2. **`assets/css/custom.css`** - Add hero terminal styles, feature grid styles, animations
3. **`layouts/partials/hero-terminal.html`** (new) - Terminal component with animation
4. **`layouts/shortcodes/feature-grid.html`** (new) - 2x2 feature grid shortcode
5. **`assets/js/terminal-animation.js`** (new) - Typing animation logic

### CSS Classes to Add

```css
/* Hero */
.hero-with-terminal { }
.hero-terminal { }
.hero-terminal-prompt { }
.hero-terminal-cursor { }

/* Feature Grid */
.feature-grid { }
.feature-cell { }
.feature-heading { }
.feature-description { }
.feature-graphic { }

/* Terminal Graphics */
.terminal-graphic { }
.terminal-graphic-observability { }
.terminal-graphic-standards { }
.terminal-graphic-auditing { }
.terminal-graphic-regret { }
```

### Animation Keyframes

```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

## Design Tokens

Uses existing brand palette from `custom.css`:
- Primary blue: `--color-primary` (#1A40E5) / `--color-primary-dark` (#6699FF)
- Text: `--color-text` / `--color-text-dark`
- Borders: `--color-border` / `--color-border-dark`
- Terminal dark: `#0a0a0a` or `#111`

## Mobile Considerations

- Hero: Terminal stacks below text, may reduce to smaller size or hide on very small screens
- Feature grid: Single column stack
- Animations: Respect `prefers-reduced-motion` media query

## Next Steps

1. Implement hero terminal with Option A (50/50 split)
2. Add typing animation
3. Build 2x2 feature grid structure
4. Create terminal-motif graphics for each feature
5. Test 3D perspective and full-width background variations
6. Refine based on browser testing
