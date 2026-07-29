# Implementation Plan: Custom Cursor

## Overview

Build a dual-layer custom cursor system (`cursor-dot` + `cursor-ring`) as a self-contained React context module. The implementation proceeds in four stages: CSS foundations, the core `CursorProvider` component with its rAF loop and event delegation, contextual enhancements (hover morphing, labels, color zones, click feedback), and finally wiring cursor attributes into the route pages.

## Tasks

- [x] 1. Add cursor CSS classes to `src/styles.css`
  - Add `.cursor-dot`, `.cursor-ring`, and `.cursor-label` class definitions with `position: fixed`, `pointer-events: none`, `z-index: 9999`, `will-change: transform`, `mix-blend-mode: difference`, and `border-radius: 50%`
  - Add `.cursor-dot--hidden` and `.cursor-ring--hidden` opacity-0 modifier classes
  - Add `.cursor-label--visible` opacity-1 modifier class
  - Add CSS custom properties: `--cursor-ring-size`, `--cursor-dot-size`, `--cursor-color`
  - Wire custom properties into `width`, `height`, `background`, and `border-color` on each class
  - Add CSS `transition` declarations on `.cursor-dot` (width, height, opacity, background-color) and `.cursor-ring` (width, height, opacity, border-color)
  - Add `@media (prefers-reduced-motion: reduce)` block that sets `transition: none` on all three classes
  - _Requirements: 2.2, 2.3, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 6.2, 7.1, 9.2, 10.1, 10.2, 10.3_

- [x] 2. Implement `CursorProvider` core — mount, portal, rAF loop
  - Create `src/components/cursor.tsx`
  - Define `CursorVariant`, `CursorColor`, `CursorState`, and `CursorContextValue` TypeScript types
  - Create `CursorContext` with `setCursorLabel`, `setCursorColor`, `setCursorVariant`
  - Implement touch-device guard using `window.matchMedia('(pointer: coarse)')` — early return renders `<>{children}</>` unchanged
  - Gate all `window`/`document` access behind `typeof window !== 'undefined'` for SSR safety
  - Apply `cursor: none` to `document.documentElement` on mount and remove it on unmount
  - Render Dot (`<div ref={dotRef} className="cursor-dot" aria-hidden="true" />`) and Ring (`<div ref={ringRef} className="cursor-ring" aria-hidden="true"><span ref={labelRef} className="cursor-label" /></div>`) via `ReactDOM.createPortal(…, document.body)`
  - Start both elements with opacity 0 (`cursor-dot--hidden`, `cursor-ring--hidden`)
  - Implement single `requestAnimationFrame` loop: Dot uses exact `mouseRef` coords; Ring lerps using factor `0.12` (or `1.0` when reduced motion is active); both write `transform: translate(calc(Xpx - 50%), calc(Ypx - 50%))` to DOM refs directly
  - Pause rAF loop when `document.visibilityState === 'hidden'`; resume on `visibilitychange`
  - On first `mousemove`, remove `cursor-dot--hidden` / `cursor-ring--hidden` (fade-in via CSS transition over ~400 ms using a short `opacity` transition on the base classes)
  - Remove hidden classes and set `isInsideRef = true` on `mouseenter`; add hidden classes on `mouseleave`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 4.2, 9.1, 10.3, 10.4, 10.5, 11.1_

  - [ ]* 2.1 Write unit tests for `CursorProvider` core behaviours
    - Assert `cursor: none` applied to `document.documentElement` on mount and removed on unmount
    - Mock `(pointer: coarse)` → assert no cursor DOM elements rendered and no `cursor: none`
    - Assert portal attaches to `document.body`
    - Assert both elements start with hidden classes; after first `mousemove` hidden classes are removed
    - Assert `z-index: 9999` and `pointer-events: none` on cursor elements
    - Assert rAF pauses on `visibilitychange` to hidden
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 10.1, 10.2, 10.4, 10.5_

  - [ ]* 2.2 Write property test — Property 1: Dot position tracks mouse coordinates exactly
    - **Property 1: Dot position tracks mouse coordinates exactly**
    - Use `fc.float()` pairs for x/y within viewport bounds
    - After firing `mousemove` and advancing one rAF frame, assert `dotRef.style.transform === \`translate(calc(${x}px - 50%), calc(${y}px - 50%))\``
    - **Validates: Requirements 2.1**

  - [ ]* 2.3 Write property test — Property 2: Ring lerp interpolation correctness
    - **Property 2: Ring lerp interpolation correctness**
    - Use `fc.float()` pairs for starting ring position and target mouse position
    - After one rAF frame assert ring position equals `(rx + (mx - rx) * 0.12, ry + (my - ry) * 0.12)`
    - **Validates: Requirements 3.1**

  - [ ]* 2.4 Write property test — Property 6: Reduced motion uses direct position tracking
    - **Property 6: Reduced motion uses direct position tracking**
    - Mock `prefers-reduced-motion: reduce`; use `fc.float()` pairs for x/y
    - After one rAF frame assert ring position equals the target coordinates exactly (lerp factor 1.0)
    - **Validates: Requirements 9.1**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement event delegation — hover morphing and interactive element detection
  - Add `document`-level `pointerover`/`pointerout` listeners inside `CursorProvider`
  - On `pointerover`: walk `e.target` ancestor chain (up to `document.body`) to find `[data-cursor-color]`, `[data-cursor-label]`, `[data-cursor]`, `a`, `button`
  - Derive `CursorState { variant, label, color }` from the first matching ancestor
  - For hover variant (no label): set `--cursor-ring-size: 64px` and `--cursor-dot-size: 3px` on the respective DOM refs via `style.setProperty`
  - On `pointerout`: check `relatedTarget` — if outside the previously matched element, revert `--cursor-ring-size: 40px` and `--cursor-dot-size: 6px`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.1 Write property test — Property 3: Hover morphing round-trip for any interactive element type
    - **Property 3: Hover morphing round-trip for any interactive element type**
    - Use `fc.oneof(fc.constant('a'), fc.constant('button'), fc.constant('[data-cursor]'))` to generate element type
    - On `pointerover` assert `--cursor-ring-size: 64px` and `--cursor-dot-size: 3px`; on `pointerout` assert restored to `40px` / `6px`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 5. Implement label display, color zones, and click feedback
  - [x] 5.1 Implement label display (`data-cursor-label`)
    - In the `pointerover` handler: when a `[data-cursor-label]` ancestor is found, set `labelRef.current.textContent` to the attribute value, add `.cursor-label--visible` to the label, and set `--cursor-ring-size: 80px`
    - On `pointerout`: remove `.cursor-label--visible` and restore ring size
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.2 Write property test — Property 4: Label display round-trip with ring sizing for any label value
    - **Property 4: Label display round-trip with ring sizing for any label value**
    - Use `fc.string({ minLength: 1, maxLength: 20 })` for label value
    - On `pointerover` assert `labelRef.textContent === S` and `--cursor-ring-size: 80px`; on `pointerout` assert label not visible and ring restored
    - **Validates: Requirements 6.1, 6.3, 6.4**

  - [x] 5.3 Implement color zone transitions (`data-cursor-color`)
    - In the `pointerover` handler: when `[data-cursor-color]` is found with value `"terracotta"` or `"basil"`, set `--cursor-color` on both dot and ring refs to the matching CSS variable; silently ignore unknown values
    - On `pointerout`: restore `--cursor-color` to `var(--cream)`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 5.4 Write property test — Property 5: Color zone exit restores cream for any valid color value
    - **Property 5: Color zone exit restores cream for any valid color value**
    - Use `fc.oneof(fc.constant('terracotta'), fc.constant('basil'))` for color value
    - On `pointerover` assert `--cursor-color` set to the matching value; on `pointerout` assert `--cursor-color` equals `var(--cream)`
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [x] 5.5 Implement click feedback animation (`mousedown` / `mouseup`)
    - Listen on `document` for `mousedown`: set `--cursor-ring-size: 30px`; record `mousedownTime`
    - Listen on `document` for `mouseup`: if press ≥ 150 ms, restore to contextual size; if press < 150 ms, play single CSS pulse (add/remove a short keyframe class) then restore
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 5.6 Implement `useCursor` hook and expose `CursorContext`
    - Export `useCursor()` hook that reads `CursorContext`; throw `"useCursor must be used within a CursorProvider"` if context is null
    - Wire `setCursorLabel`, `setCursorColor`, `setCursorVariant` callbacks into context value; calling `setCursorLabel(S)` writes to `labelRef` and sets ring size; calling `setCursorLabel(null)` clears it
    - _Requirements: 11.2, 11.3, 11.4_

  - [ ]* 5.7 Write unit test for `useCursor` hook
    - Assert hook returns `setCursorLabel`, `setCursorColor`, `setCursorVariant`
    - Assert `mousedown` sets `--cursor-ring-size: 30px`; `mouseup` restores it
    - _Requirements: 8.1, 8.2, 11.2_

  - [ ]* 5.8 Write property test — Property 7: `setCursorLabel` imperative API round-trip
    - **Property 7: setCursorLabel imperative API round-trip**
    - Use `fc.string({ minLength: 1 })` for label value
    - Call `setCursorLabel(S)` and assert label text equals `S`; call `setCursorLabel(null)` and assert label is not visible
    - **Validates: Requirements 11.3, 11.4**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Mount `CursorProvider` in `SiteChrome.tsx`
  - Import `CursorProvider` from `@/components/cursor` in `src/components/SiteChrome.tsx`
  - Add a new default export `SiteChrome` (or named export matching the integration pattern) that wraps `children` with `<CursorProvider>`
  - Update `src/routes/__root.tsx` `RootComponent` to render page content inside `<SiteChrome>` (or update the existing render site to use the wrapper), per Requirement 11.5
  - Verify `cursor: none` is active in the browser after wiring
  - _Requirements: 11.5_

- [x] 8. Add `data-cursor-*` attributes to `src/routes/index.tsx`
  - Add `data-cursor-label="Order"` to the Wolt order CTA anchor in the hero section
  - Add `data-cursor-label="Menu"` to the "See Menu" `<Link>` in the hero section
  - Add `data-cursor` to each menu-preview `<div … className="… group …">` row to trigger hover morphing on dish cards
  - Add `data-cursor-label="View"` to the hero pizza image wrapper `<div … className="… overflow-hidden …">`
  - Add `data-cursor-color="terracotta"` to the dark `#menu-preview` section so the cursor shifts color against the charcoal background
  - Add `data-cursor-label="Reserve"` to the Reserve `<Link to="/contact">` in the `#visit` section
  - _Requirements: 5.5, 6.1, 7.2_

- [x] 9. Add `data-cursor-*` attributes to `src/routes/menu.tsx`
  - Add `data-cursor-label="Order"` to the Wolt order anchor and the call anchor in the menu header action row
  - Add `data-cursor` to each `<article>` menu item row to signal interactivity
  - _Requirements: 5.5, 6.1_

- [x] 10. Add `data-cursor-*` attributes to `src/routes/contact.tsx`
  - Add `data-cursor-label="Call"` to the phone `<a href="tel:…">` anchor in the contact info aside
  - Add `data-cursor-label="Order"` to the Wolt `<a>` anchor in the contact info aside
  - Add `data-cursor-label="Directions"` to the Google Maps anchor
  - Add `data-cursor-label="Send"` to the form submit `<button>`
  - _Requirements: 5.5, 6.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use **fast-check** with a minimum of 100 iterations each; tag each test with `// Feature: custom-cursor, Property N: <title>`
- The rAF loop writes transforms directly to DOM refs — no React state is used for position updates, so no re-renders occur during cursor movement
- All `window`/`document` access must be gated behind `typeof window !== 'undefined'` for SSR compatibility
- Touch devices (`pointer: coarse`) receive no cursor elements and no `cursor: none` — the guard is a no-op early return in `CursorProvider`
- The `mix-blend-difference` blend mode means cream (`oklch(0.96 0.012 85)`) is the only cursor color needed to stay visible on both cream and charcoal backgrounds; terracotta/basil variants are used for branded accent zones
