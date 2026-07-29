# Design Document

## Custom Cursor

---

## Overview

The custom cursor feature replaces the native OS cursor with a dual-layer editorial cursor system — a precise **dot** and a smooth-following **ring** — that enhances the Awwwards-calibre feel of the Lotta Napoletana site. The cursor responds contextually to interactive elements with size morphing, color adaptation, and short text labels ("View", "Order", "Explore"). It is implemented as a single React component + context pair, mounted once at the `SiteChrome` level, and communicates both through DOM `data-*` attributes and a React context API.

Key design drivers:
- **Single rAF loop** for both Dot and Ring position updates — no per-element animation timers for position
- **CSS transitions** for visual state changes (scale, opacity, color) — GSAP is already in use site-wide but a simple React ref + CSS approach avoids GSAP overhead for a continuously-running cursor
- **mix-blend-difference** on both elements so the cursor remains legible against all backgrounds without per-section color management
- **Portal to `document.body`** so z-ordering is trivial and the cursor is never clipped by overflow:hidden ancestors
- **Zero dependencies beyond React + ReactDOM** — no new packages

---

## Architecture

The feature is a self-contained module at `src/components/cursor.tsx` that exports:

- `CursorProvider` — context provider + cursor renderer, mounted once in `SiteChrome.tsx`
- `useCursor` — imperative hook for programmatic cursor control (label, color, variant)

All cursor DOM interaction (event listeners, rAF loop) lives inside `CursorProvider`. No GSAP is used — CSS transitions handle visual state changes, while JS only writes `transform` via the rAF loop.

```
SiteChrome.tsx
  └─ CursorProvider (src/components/cursor.tsx)
       ├─ Context (label, color, variant, setCursorLabel, setCursorColor, setCursorVariant)
       ├─ Portal → document.body
       │    ├─ <div.cursor-dot>        6px filled circle
       │    └─ <div.cursor-ring>       40px hollow ring
       │         └─ <span.cursor-label>  contextual text
       └─ children (SiteHeader + SiteFooter + <Outlet />)
```

Event flow:

```
document mousemove
  → update mouseRef (raw coords)
  → rAF loop reads mouseRef
      → dot: set to mouseRef directly
      → ring: lerp(ringPos, mouseRef, 0.12)
      → write transform strings to DOM refs

DOM delegation (document-level pointerover/pointerout)
  → walk e.target ancestors for a/button/[data-cursor]/[data-cursor-label]/[data-cursor-color]
  → derive CursorState { variant, label, color }
  → write CSS variables to ring/dot refs for transitions
```

Using `pointerover`/`pointerout` event delegation on `document` means no per-element React event handlers are needed and no re-renders are triggered during hover.

---

## Components and Interfaces

### `CursorProvider`

```tsx
export function CursorProvider({ children }: { children: React.ReactNode }): JSX.Element
```

Responsibilities:
- Detects touch device via `window.matchMedia('(pointer: coarse)')` — early return renders `<>{children}</>` unchanged if true
- Detects `prefers-reduced-motion` via `window.matchMedia('(prefers-reduced-motion: reduce)')`
- Applies `cursor: none` to `document.documentElement` on mount; removes on unmount
- Maintains a single `requestAnimationFrame` loop (paused when `document.hidden`)
- Listens to `document` for `mousemove`, `mousedown`, `mouseup`, `mouseleave`, `mouseenter`
- Listens to `document` for `pointerover`/`pointerout` to derive interactive element state
- Renders cursor elements via `ReactDOM.createPortal(cursorMarkup, document.body)`
- Exposes `CursorContext` to descendants

### `useCursor`

```tsx
export function useCursor(): CursorContextValue
```

Returns `{ setCursorLabel, setCursorColor, setCursorVariant }` for imperative control. Throws if used outside `CursorProvider`.

### `CursorContext`

```tsx
interface CursorContextValue {
  setCursorLabel: (label: string | null) => void;
  setCursorColor: (color: CursorColor) => void;
  setCursorVariant: (variant: CursorVariant) => void;
}
```

### `CursorState` (internal)

```tsx
type CursorVariant = 'default' | 'hover' | 'label';
type CursorColor   = 'cream' | 'terracotta' | 'basil';

interface CursorState {
  variant: CursorVariant;
  label:   string | null;
  color:   CursorColor;
}
```

### Cursor DOM Elements

Both elements are plain `div`s rendered into the portal. No React state drives their transform — only DOM refs written directly in the rAF loop for zero re-render overhead.

```tsx
<div
  ref={dotRef}
  className="cursor-dot"
  aria-hidden="true"
/>
<div
  ref={ringRef}
  className="cursor-ring"
  aria-hidden="true"
>
  <span ref={labelRef} className="cursor-label" />
</div>
```

---

## Data Models

### Position tracking (refs, not state)

```ts
// Raw mouse position — updated synchronously in mousemove handler
const mouseRef = useRef({ x: -100, y: -100 });

// Ring's current interpolated position — updated each rAF frame
const ringPosRef = useRef({ x: -100, y: -100 });

// Whether cursor has appeared yet (first mousemove received)
const hasEnteredRef = useRef(false);

// Whether pointer is inside the viewport
const isInsideRef = useRef(false);
```

### Visual state (CSS custom properties on the ring element)

Rather than React state, visual state is communicated via CSS custom properties written to the ring element's style. This allows CSS `transition` to handle all animation without React re-renders:

```
--cursor-ring-size: 40px        (default) | 64px (hover) | 80px (label) | 30px (click)
--cursor-dot-size:   6px        (default) | 3px (hover)
--cursor-color: var(--cream)    (default) | var(--terracotta) | var(--basil)
--cursor-opacity:    0          (initial) | 1 (active)
```

### `data-*` attribute API

| Attribute | Values | Effect |
|---|---|---|
| `data-cursor` | (presence) | Triggers hover morphing |
| `data-cursor-label` | Any short string | Shows label inside ring, ring → 80px |
| `data-cursor-color` | `"terracotta"` \| `"basil"` | Transitions cursor color |

### CSS classes on cursor elements

| Class | Purpose |
|---|---|
| `.cursor-dot` | 6px dot, `border-radius: 50%`, `will-change: transform`, `mix-blend-difference` |
| `.cursor-ring` | 40px ring, `border-radius: 50%`, `will-change: transform`, `mix-blend-difference`, CSS transitions on size/color |
| `.cursor-label` | 9px JetBrains Mono text, uppercase, `letter-spacing: 0.2em`, centered |
| `.cursor-dot--hidden` | `opacity: 0` |
| `.cursor-ring--hidden` | `opacity: 0` |

---

## Implementation Details

### rAF Loop

```ts
function tick() {
  if (document.hidden) {
    rafRef.current = requestAnimationFrame(tick);
    return;
  }

  const { x: mx, y: my } = mouseRef.current;
  const lerpFactor = reducedMotion ? 1.0 : 0.12;

  // Dot — exact tracking
  dotRef.current!.style.transform =
    `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;

  // Ring — lerp
  ringPosRef.current.x += (mx - ringPosRef.current.x) * lerpFactor;
  ringPosRef.current.y += (my - ringPosRef.current.y) * lerpFactor;
  ringRef.current!.style.transform =
    `translate(calc(${ringPosRef.current.x}px - 50%), calc(${ringPosRef.current.y}px - 50%))`;

  rafRef.current = requestAnimationFrame(tick);
}
```

Note: `translate(calc(Xpx - 50%), calc(Ypx - 50%))` centers each element on the pointer, matching Requirement 10.3.

### Interactive Element Detection

On each `pointerover` event, walk the event target's ancestor chain (up to `document.body`) looking for:
1. `[data-cursor-color]` → update color
2. `[data-cursor-label]` → enter label variant
3. `[data-cursor]`, `a`, `button` → enter hover variant (only if no label)

On `pointerout`, check `relatedTarget` — if it's outside the previously matched element, revert state.

This single delegation listener replaces per-element React event handlers and avoids any React re-renders during cursor movement.

### CSS Transitions (styles.css additions)

```css
.cursor-dot,
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  mix-blend-mode: difference;
  border-radius: 50%;
}

.cursor-dot {
  width: var(--cursor-dot-size, 6px);
  height: var(--cursor-dot-size, 6px);
  background: var(--cursor-color, var(--cream));
  transition:
    width 200ms ease-out,
    height 200ms ease-out,
    opacity 150ms ease,
    background-color 250ms ease;
}

.cursor-ring {
  width: var(--cursor-ring-size, 40px);
  height: var(--cursor-ring-size, 40px);
  border: 1.5px solid var(--cursor-color, var(--cream));
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    width 300ms ease-out,
    height 300ms ease-out,
    opacity 300ms ease,
    border-color 250ms ease;
}

.cursor-label {
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--cursor-color, var(--cream));
  opacity: 0;
  transition: opacity 200ms ease;
  white-space: nowrap;
  pointer-events: none;
}

.cursor-label--visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-dot,
  .cursor-ring,
  .cursor-label {
    transition: none;
  }
}
```

### SiteChrome.tsx Mount Point

```tsx
// SiteChrome.tsx — wrap existing exports with CursorProvider
import { CursorProvider } from '@/components/cursor';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <CursorProvider>
      {children}
    </CursorProvider>
  );
}
```

`SiteChrome` is not currently a wrapper component — it exports named components. The preferred integration point is to wrap `<Outlet />` in `__root.tsx` inside `CursorProvider`, or create a thin `SiteChrome` wrapper. The team's decision is to mount inside `SiteChrome.tsx` per Requirement 11.5, so a new default export or wrapping pattern will be added there.

### Click Feedback

`mousedown` → set `--cursor-ring-size: 30px`
`mouseup` → restore to contextual size based on current variant

The `mousedown`/`mouseup` within 150 ms condition is handled by tracking `mousedownTime` and skipping the intermediate `mouseup` reset if the press was shorter than 150 ms, playing a single CSS keyframe pulse instead.

### Touch / SSR Guards

```ts
const isTouch = typeof window !== 'undefined'
  && window.matchMedia('(pointer: coarse)').matches;

if (isTouch) return <>{children}</>;
```

All `window`/`document` access is gated behind `typeof window !== 'undefined'` for SSR safety, consistent with the `useIsoLayoutEffect` pattern already used across the codebase.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dot position tracks mouse coordinates exactly

*For any* `(clientX, clientY)` coordinate pair fired in a `mousemove` event, after the next animation frame the Dot's rendered position SHALL be centered on exactly those coordinates — i.e., `transform: translate(calc(Xpx - 50%), calc(Ypx - 50%))`.

**Validates: Requirements 2.1**

---

### Property 2: Ring lerp interpolation correctness

*For any* starting ring position `(rx, ry)` and target mouse position `(mx, my)`, after one animation frame the ring's position SHALL be `(rx + (mx - rx) * 0.12, ry + (my - ry) * 0.12)`. After N frames the ring position converges toward the target according to the geometric lerp series.

**Validates: Requirements 3.1**

---

### Property 3: Hover morphing round-trip for any interactive element type

*For any* element matching the selectors `a`, `button`, or `[data-cursor]`, when the pointer enters the element the Ring SHALL measure 64 px and the Dot SHALL measure 3 px; when the pointer subsequently leaves, the Ring SHALL return to 40 px and the Dot SHALL return to 6 px. This must hold regardless of which selector matched.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

---

### Property 4: Label display round-trip with ring sizing for any label value

*For any* non-empty string `S` set as a `data-cursor-label` attribute value, when the pointer enters the element: the Label SHALL display text equal to `S`, and the Ring SHALL measure 80 px. When the pointer subsequently leaves, the Label SHALL no longer be visible and the Ring SHALL return to its default or hover size.

**Validates: Requirements 6.1, 6.3, 6.4**

---

### Property 5: Color zone exit restores cream for any valid color value

*For any* element with a `data-cursor-color` attribute set to a valid color (`"terracotta"` or `"basil"`), when the pointer enters the element the cursor color SHALL transition to the corresponding color, and when the pointer subsequently leaves, the cursor color SHALL transition back to cream (`oklch(0.96 0.012 85)`).

**Validates: Requirements 7.2, 7.3, 7.4**

---

### Property 6: Reduced motion uses direct position tracking

*For any* `(clientX, clientY)` target, when `prefers-reduced-motion: reduce` is active, after one animation frame the Ring's position SHALL be equal to the target coordinates (lerp factor effectively 1.0, no lag), matching the Dot's exact tracking behavior.

**Validates: Requirements 9.1**

---

### Property 7: setCursorLabel imperative API round-trip

*For any* string value `S` passed to `setCursorLabel(S)`, the Label SHALL display text equal to `S`. When `setCursorLabel(null)` is subsequently called, the Label SHALL no longer be visible.

**Validates: Requirements 11.3, 11.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `useCursor` called outside `CursorProvider` | Throw a descriptive error: `"useCursor must be used within a CursorProvider"` |
| `data-cursor-color` set to an unrecognised value | Silently ignore; retain current color |
| `document.body` unavailable at portal render time (SSR) | Portal guarded by `typeof document !== 'undefined'`; server renders children only |
| Touch device detected | `CursorProvider` renders `children` unchanged, no DOM mutation, no listeners attached |
| `matchMedia` unavailable (old browsers, jsdom) | Default to `isTouch = false`, `reducedMotion = false`; wrap in try/catch |
| rAF loop throws | Caught in the loop body; loop re-schedules to avoid freezing |

---

## Testing Strategy

### Unit / Example-based tests

Test file: `src/components/cursor.test.tsx`

- Mount `CursorProvider`, assert `cursor: none` is applied to `document.documentElement`
- Unmount, assert `cursor: none` is removed
- Mock `(pointer: coarse)` → assert no cursor elements rendered, no `cursor: none`
- Mount without `mousemove` → assert both elements have `opacity: 0`
- Fire first `mousemove` → assert opacity transitions to 1
- Assert Dot has `6px` diameter, filled, `mix-blend-difference`
- Assert Ring has `40px` diameter, `1.5px` border, `mix-blend-difference`
- Assert cursor container has `z-index: 9999`, `pointer-events: none`
- Assert portal attaches to `document.body`
- Assert `useCursor()` returns `setCursorLabel`, `setCursorColor`, `setCursorVariant`
- Fire `mousedown` → assert `--cursor-ring-size: 30px`; fire `mouseup` → assert restored
- Fire `visibilitychange` to hidden → assert rAF is paused
- Mock reduced motion → assert both elements still render (Requirement 9.3)

### Property-based tests

Property-based testing library: **[fast-check](https://github.com/dubzzz/fast-check)** (already present in the JS ecosystem, works with Vitest).

Each property test runs a **minimum of 100 iterations**.

| Property | Arbitrary | Assertion |
|---|---|---|
| P1: Dot tracks mouse exactly | `fc.float()` pairs for x/y within viewport | `dotRef.style.transform` equals `translate(calc(Xpx - 50%), calc(Ypx - 50%))` |
| P2: Ring lerp math | Starting position + target position pairs | Ring position after one frame matches lerp formula |
| P3: Hover morphing round-trip | `fc.oneof(fc.constant('a'), fc.constant('button'), fc.constant('[data-cursor]'))` | Ring 64px + Dot 3px on enter; Ring 40px + Dot 6px on leave |
| P4: Label round-trip | `fc.string({ minLength: 1, maxLength: 20 })` for label value | Label text matches; ring 80px on enter; label gone + ring restored on leave |
| P5: Color zone exit | `fc.oneof(fc.constant('terracotta'), fc.constant('basil'))` | Color changes on enter; cream restored on leave |
| P6: Reduced motion tracking | `fc.float()` pairs for x/y | Ring position equals target after one frame (no lag) |
| P7: setCursorLabel API | `fc.string({ minLength: 1 })` for label | Label shows matching text; `null` clears it |

Tag format for each property test:
```ts
// Feature: custom-cursor, Property 1: Dot position tracks mouse coordinates exactly
```

### Integration notes

- No end-to-end cursor tests are needed — cursor behavior is purely client-side and adequately covered by unit + property tests
- Visual regression of blend-mode appearance is best verified manually or via a Storybook snapshot
- Touch/SSR guards are tested via jsdom `window.matchMedia` mocks
