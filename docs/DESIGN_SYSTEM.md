# Design System — Philosopher Coach

> **This file defines IMMUTABLE design tokens.** No AI, no LLM, no dynamic generation touches these values. Every component in the app uses only these tokens.

---

## Color Palette

### Semantic Tokens

| Token            | Hex       | Usage                                              |
|------------------|-----------|-----------------------------------------------------|
| `ink`            | `#1a1a1a` | Primary text, borders, UI lines, icons              |
| `paper`          | `#f5f0e8` | Page background — warm parchment base               |
| `paper-light`    | `#faf7f2` | Card surfaces, modals, elevated containers          |
| `accent`         | `#c45d3e` | Burnt sienna — CTAs, highlights, active states      |
| `accent-hover`   | `#a84e33` | Accent interactions (hover, pressed, focus ring)    |
| `muted`          | `#8a8275` | Secondary text, timestamps, labels, placeholders    |
| `muted-light`    | `#d4cfc6` | Dividers, subtle borders, inactive states           |
| `sage`           | `#7a8b6f` | Success states, growth indicators, positive mood    |
| `slate`          | `#5b6b7a` | Info states, calm mood, neutral indicators          |
| `warm`           | `#b8860b` | Warning, caution, high-energy mood                  |

### Dark Mode (Future Phase — Define Now, Implement Later)

| Token            | Hex       |
|------------------|-----------|
| `ink`            | `#e8e0d4` |
| `paper`          | `#1a1917` |
| `paper-light`    | `#252420` |
| `accent`         | `#d4714f` |
| `accent-hover`   | `#e0856a` |
| `muted`          | `#9a9488` |
| `muted-light`    | `#3a3834` |
| `sage`           | `#8fa382` |
| `slate`          | `#7a8d9e` |
| `warm`           | `#d4a017` |

---

## Typography

### Font Stack

```css
--font-display: "Playfair Display", Georgia, "Times New Roman", serif;
--font-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono:    "JetBrains Mono", "Fira Code", "Consolas", monospace;
```

Load from Google Fonts:
- Playfair Display: weights 400, 500, 600, 700, 800 (regular + italic)
- Inter: weights 300, 400, 500, 600, 700
- JetBrains Mono: weights 400, 500

### Type Scale

| Name      | Size   | Line Height | Weight | Font         | Usage                                |
|-----------|--------|-------------|--------|--------------|--------------------------------------|
| `hero`    | 3rem   | 1.1         | 700    | display      | Landing page headlines               |
| `h1`      | 2.25rem| 1.2         | 700    | display      | Page titles                          |
| `h2`      | 1.75rem| 1.25        | 600    | display      | Section headings                     |
| `h3`      | 1.25rem| 1.3         | 600    | display      | Card titles, widget headers          |
| `h4`      | 1.1rem | 1.35        | 600    | body         | Subsection labels                    |
| `body`    | 1rem   | 1.6         | 400    | body         | Default paragraph text               |
| `body-sm` | 0.875rem| 1.5        | 400    | body         | Secondary content, descriptions      |
| `caption` | 0.75rem| 1.4         | 500    | mono         | Timestamps, metadata, counters       |
| `quote`   | 1.5rem | 1.5         | 400i   | display      | Philosophical quotes (italic)        |
| `label`   | 0.8rem | 1.3         | 600    | body         | Form labels, tags, badges            |

---

## Spacing Scale

Based on 4px grid:

```
--space-1:  0.25rem   (4px)
--space-2:  0.5rem    (8px)
--space-3:  0.75rem   (12px)
--space-4:  1rem      (16px)
--space-5:  1.25rem   (20px)
--space-6:  1.5rem    (24px)
--space-8:  2rem      (32px)
--space-10: 2.5rem    (40px)
--space-12: 3rem      (48px)
--space-16: 4rem      (64px)
--space-20: 5rem      (80px)
--space-24: 6rem      (96px)
```

---

## Border & Radius

```
--radius-sm:  4px      (tags, badges, small chips)
--radius-md:  8px      (cards, inputs, buttons)
--radius-lg:  12px     (modals, large cards)
--radius-xl:  16px     (hero sections, featured content)
--radius-full: 9999px  (avatars, pills, circular elements)

--border-thin:  1px solid var(--muted-light)
--border-heavy: 2px solid var(--ink)
```

---

## Shadows & Depth

```
--shadow-sm:    0 1px 2px rgba(26, 26, 26, 0.05)
--shadow-md:    0 2px 8px rgba(26, 26, 26, 0.08)
--shadow-lg:    0 4px 16px rgba(26, 26, 26, 0.12)
--shadow-inner: inset 0 1px 3px rgba(26, 26, 26, 0.06)
```

---

## Visual Texture & Effects

### Paper Grain
Apply a subtle CSS noise texture to the `<body>` background:
```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  z-index: 9999;
}
```

### Editorial Dividers
Use decorative HR elements styled as editorial dividers:
- Thin line with a small diamond/dot in the center
- Or a double-line rule reminiscent of newspaper columns

### Stamp/Seal Motif
For achievements, milestones, and philosophical school badges — use circular bordered elements with:
- Double border rings
- Uppercase mono text
- Rotated text around the perimeter (optional, advanced)

---

## Component Styling Guidelines

### Cards
- Background: `paper-light`
- Border: `1px solid muted-light`
- Radius: `radius-md`
- Padding: `space-5` to `space-6`
- On hover: subtle `shadow-md` transition

### Buttons
- **Primary:** bg `accent`, text `paper-light`, hover `accent-hover`
- **Secondary:** bg transparent, border `2px solid ink`, text `ink`
- **Ghost:** bg transparent, text `muted`, hover text `ink`
- All: `radius-md`, font `body` weight 600, padding `space-2 space-5`
- Uppercase tracking for CTAs: `letter-spacing: 0.05em; text-transform: uppercase;`

### Inputs
- Background: `paper-light`
- Border: `1px solid muted-light`, focus: `2px solid accent`
- Radius: `radius-md`
- Font: `body` at `body` size
- Placeholder color: `muted`

### Navigation
- Top bar: clean, minimal, `paper` background with bottom border `muted-light`
- Logo: Playfair Display, weight 800, tracked slightly
- Nav links: `body` font, weight 500, `muted` color, hover `ink`

---

## Mood-to-Color Mapping

When displaying mood indicators, use these color associations:

| Mood Range       | Color Token | Visual Indicator |
|-----------------|-------------|------------------|
| Calm / Peaceful | `slate`     | Smooth, flowing   |
| Happy / Growing | `sage`      | Upward, expanding  |
| Anxious / Tense | `warm`      | Vibrating, tight   |
| Sad / Low       | `muted`     | Subdued, heavy     |
| Angry / Intense | `accent`    | Sharp, bold        |

---

## Responsive Breakpoints

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

Max content width: `1200px`
Page padding: `space-4` (mobile), `space-8` (desktop)

---

## Animation Principles

- Transitions: `150ms ease` for micro-interactions, `300ms ease-out` for reveals
- No bouncy/playful animations — keep it editorial, measured, deliberate
- Page transitions: subtle fade (200ms)
- Widget entrance: slide-up + fade (300ms, staggered for lists)
- Avoid animation on reduced-motion preference: `@media (prefers-reduced-motion: reduce)`
