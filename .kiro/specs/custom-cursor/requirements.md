# Requirements Document

## Introduction

This feature replaces the native browser cursor on the Lotta Napoletana website with a custom dual-layer cursor system that matches the site's editorial, Awwwards-calibre aesthetic. The cursor consists of a precise dot that tracks the exact pointer position and a larger ring that follows with a smooth easing delay. The cursor reacts contextually to interactive elements — morphing in size, blending in color, and displaying short text labels on designated elements (e.g. "View", "Order"). The native OS cursor is hidden globally. The feature is implemented as a React component mounted once at the root layout level and coordinates state across the application through a React context.

## Glossary

- **Cursor_System**: The complete custom cursor feature, comprising the Dot, the Ring, and the Label.
- **Dot**: The small filled circle (~6 px) that tracks the exact pointer coordinates without lag.
- **Ring**: The larger hollow circle (~40 px diameter) that follows the pointer with a smooth easing delay (lag effect).
- **Label**: Optional short text (e.g. "View", "Order", "Explore") that appears inside or near the Ring on designated interactive elements.
- **Hover_State**: The visual and dimensional change applied to the Cursor_System when the pointer is over an interactive element.
- **Interactive_Element**: Any `<a>`, `<button>`, or element annotated with the `data-cursor` attribute.
- **Blend_Mode**: CSS `mix-blend-difference` applied to the Cursor_System so it inverts against light and dark backgrounds.
- **Reduced_Motion**: The operating system or browser preference `prefers-reduced-motion: reduce`.
- **Touch_Device**: A device whose primary input is touch, detected via the `(pointer: coarse)` media query or the absence of `mousemove` events.
- **Viewport**: The visible browser window area.

---

## Requirements

### Requirement 1: Hide Native Cursor

**User Story:** As a visitor, I want the native OS cursor hidden when I enter the site, so that the custom cursor is the only visible pointer.

#### Acceptance Criteria

1. WHILE the Cursor_System is mounted, THE Cursor_System SHALL apply `cursor: none` to the `html` element via a global CSS rule.
2. WHEN the Cursor_System is unmounted, THE Cursor_System SHALL remove the `cursor: none` rule and restore the default cursor.
3. WHERE the device is a Touch_Device, THE Cursor_System SHALL not apply `cursor: none` and SHALL not render any cursor elements.

---

### Requirement 2: Dot Tracking

**User Story:** As a visitor, I want a small dot that sits exactly under my pointer at all times, so that I always have precise visual feedback of my cursor position.

#### Acceptance Criteria

1. WHEN a `mousemove` event fires on the document, THE Dot SHALL update its position to match the event's `clientX` and `clientY` coordinates within the same animation frame.
2. THE Dot SHALL have a diameter of 6 px and a filled circular shape.
3. WHILE the Cursor_System is active, THE Dot SHALL apply the Blend_Mode (`mix-blend-difference`) so it remains visible against both the cream and charcoal backgrounds.
4. WHEN the pointer leaves the Viewport, THE Dot SHALL become invisible within 150 ms.
5. WHEN the pointer re-enters the Viewport, THE Dot SHALL become visible again within 150 ms.

---

### Requirement 3: Ring Smooth-Follow Effect

**User Story:** As a visitor, I want a larger ring that eases toward my pointer position, so that the cursor has a fluid, high-end feel.

#### Acceptance Criteria

1. WHEN a `mousemove` event fires on the document, THE Ring SHALL interpolate toward the pointer's `clientX` / `clientY` using a lerp factor of 0.12 per animation frame (approximately 12 % of the remaining distance per frame at 60 fps).
2. THE Ring SHALL have an outer diameter of 40 px, a border width of 1.5 px, and a transparent fill.
3. WHILE the Cursor_System is active, THE Ring SHALL apply the Blend_Mode (`mix-blend-difference`) so it remains visible against both the cream and charcoal backgrounds.
4. WHEN the pointer leaves the Viewport, THE Ring SHALL become invisible within 300 ms after the Dot becomes invisible.
5. WHEN the pointer re-enters the Viewport, THE Ring SHALL become visible again within 150 ms.

---

### Requirement 4: Idle Entry State

**User Story:** As a visitor, I want the cursor to enter smoothly the first time I move my mouse, so that it doesn't appear abruptly before I interact.

#### Acceptance Criteria

1. WHEN the page loads and no `mousemove` event has yet been received, THE Cursor_System SHALL render both the Dot and the Ring as invisible (opacity 0).
2. WHEN the first `mousemove` event is received, THE Cursor_System SHALL transition the Dot and Ring from opacity 0 to opacity 1 over 400 ms.

---

### Requirement 5: Interactive Element Hover Morphing

**User Story:** As a visitor, I want the cursor to visually change when I hover over links, buttons, or designated elements, so that clickable areas feel alive and invite interaction.

#### Acceptance Criteria

1. WHEN the pointer enters an Interactive_Element, THE Ring SHALL scale to 64 px diameter over a transition duration of 300 ms using an ease-out curve.
2. WHEN the pointer leaves an Interactive_Element, THE Ring SHALL return to its default 40 px diameter over a transition duration of 250 ms using an ease-out curve.
3. WHEN the pointer enters an Interactive_Element, THE Dot SHALL scale down to 3 px diameter over 200 ms using an ease-out curve.
4. WHEN the pointer leaves an Interactive_Element, THE Dot SHALL return to its default 6 px diameter over 200 ms using an ease-out curve.
5. THE Cursor_System SHALL detect Interactive_Elements by matching the CSS selectors `a`, `button`, and `[data-cursor]`.

---

### Requirement 6: Cursor Label on Designated Elements

**User Story:** As a visitor, I want a short contextual text label to appear inside the cursor ring on specific elements (e.g. "View", "Order"), so that the cursor communicates intent and reinforces the editorial brand.

#### Acceptance Criteria

1. WHEN the pointer enters an element with a `data-cursor-label` attribute, THE Label SHALL appear inside the Ring displaying the attribute's value (e.g. `data-cursor-label="View"`).
2. THE Label SHALL use the JetBrains Mono font, uppercase, a font size of 9 px, and letter-spacing of 0.2 em, matching the site's mono style.
3. WHEN the Label is visible, THE Ring SHALL scale to 80 px diameter over 300 ms to accommodate the text.
4. WHEN the pointer leaves an element with a `data-cursor-label` attribute, THE Label SHALL fade out over 200 ms and THE Ring SHALL return to its default or Hover_State size.
5. WHEN the pointer enters an element that has both `data-cursor` and `data-cursor-label`, THE Cursor_System SHALL apply Requirement 6 (label behaviour) and ignore the plain Hover_State size change from Requirement 5.

---

### Requirement 7: Cursor Color Variants

**User Story:** As a visitor, I want the cursor to adapt its appearance to match the section of the page I am on, so that it always feels intentional and on-brand.

#### Acceptance Criteria

1. THE Cursor_System SHALL default to cream (`oklch(0.96 0.012 85)`) as the cursor color, which inverts correctly via Blend_Mode against both the cream and charcoal page backgrounds.
2. WHERE an element has the attribute `data-cursor-color="terracotta"`, THE Ring and Dot SHALL transition to the terracotta color (`oklch(0.58 0.14 40)`) over 250 ms when the pointer enters that element's subtree.
3. WHERE an element has the attribute `data-cursor-color="basil"`, THE Ring and Dot SHALL transition to the basil color (`oklch(0.42 0.09 145)`) over 250 ms when the pointer enters that element's subtree.
4. WHEN the pointer leaves an element with a `data-cursor-color` attribute, THE Ring and Dot SHALL transition back to the default cream color over 250 ms.

---

### Requirement 8: Click Feedback Animation

**User Story:** As a visitor, I want a brief visual pulse when I click, so that click actions feel satisfying and responsive.

#### Acceptance Criteria

1. WHEN a `mousedown` event fires on the document, THE Ring SHALL scale to 30 px diameter over 100 ms using an ease-in curve.
2. WHEN a `mouseup` event fires on the document, THE Ring SHALL scale back to its current contextual size (default, Hover_State, or Label size) over 200 ms using an ease-out curve.
3. IF the `mousedown` and `mouseup` events occur within 150 ms of each other, THEN THE Cursor_System SHALL play a single consolidated pulse animation that scales the Ring down then back up over 300 ms total.

---

### Requirement 9: Reduced Motion Accessibility

**User Story:** As a visitor who has enabled reduced motion in their OS or browser, I want the cursor animations to be simplified or disabled, so that I am not exposed to motion that may cause discomfort.

#### Acceptance Criteria

1. WHERE the Reduced_Motion preference is active, THE Cursor_System SHALL disable all easing transitions on the Ring position and use direct position tracking (lerp factor of 1.0, matching the Dot).
2. WHERE the Reduced_Motion preference is active, THE Cursor_System SHALL disable scale and opacity transition animations, applying size and visibility changes immediately.
3. WHERE the Reduced_Motion preference is active, THE Cursor_System SHALL still render the Dot and Ring so the native cursor remains hidden and the user has cursor feedback.

---

### Requirement 10: Performance and Layering

**User Story:** As a visitor, I want the cursor to be consistently smooth and never interfere with page interactions, so that it enhances rather than disrupts the browsing experience.

#### Acceptance Criteria

1. THE Cursor_System SHALL mount cursor elements on a DOM layer with `z-index` 9999, positioned above all page content including the site header's `z-index: 40`.
2. THE Cursor_System SHALL apply `pointer-events: none` to all cursor elements so they do not intercept click or hover events on the underlying page.
3. THE Cursor_System SHALL use CSS `transform: translate(-50%, -50%)` and `will-change: transform` on both the Dot and the Ring to ensure GPU-accelerated compositing.
4. THE Cursor_System SHALL use a single `requestAnimationFrame` loop shared by both the Dot and the Ring to update positions, rather than separate loops.
5. WHEN the browser tab is not visible (`document.visibilityState === 'hidden'`), THE Cursor_System SHALL pause the `requestAnimationFrame` loop and resume it when the tab becomes visible again.

---

### Requirement 11: React Integration and Context API

**User Story:** As a developer, I want the cursor state to be accessible from anywhere in the component tree via a React context, so that page-level components can declaratively drive cursor behaviour without prop drilling.

#### Acceptance Criteria

1. THE Cursor_System SHALL expose a `CursorProvider` React component that wraps the application root and renders the cursor elements as a portal.
2. THE Cursor_System SHALL expose a `useCursor` hook that returns `setCursorLabel`, `setCursorColor`, and `setCursorVariant` functions.
3. WHEN `setCursorLabel` is called with a string value, THE Label SHALL appear inside the Ring as specified in Requirement 6.
4. WHEN `setCursorLabel` is called with `null`, THE Label SHALL disappear as specified in Requirement 6.
5. THE `CursorProvider` SHALL be mounted once inside `SiteChrome.tsx` so it is active on all routes.
