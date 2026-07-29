import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CursorVariant = 'default' | 'hover' | 'label';
export type CursorColor = 'cream' | 'terracotta' | 'basil';

export interface CursorContextValue {
  setCursorLabel: (label: string | null) => void;
  setCursorColor: (color: CursorColor) => void;
  setCursorVariant: (variant: CursorVariant) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RING_DEFAULT = '56px';
const RING_HOVER   = '80px';
const RING_LABEL   = '96px';
const RING_CLICK   = '44px';
const DOT_DEFAULT  = '6px';
const DOT_HOVER    = '3px';

// Trailing ghost dots: [size, opacity, delay-factor]
const TRAIL_CONFIG: [number, number][] = [
  [4.5, 0.45],
  [3.5, 0.30],
  [2.5, 0.18],
  [1.8, 0.10],
];
const TRAIL_LERP = 0.18; // slightly faster than ring so trails feel light

// ─── Context ──────────────────────────────────────────────────────────────────

const CursorContext = createContext<CursorContextValue | null>(null);

// ─── useCursor ────────────────────────────────────────────────────────────────

export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used within a CursorProvider');
  return ctx;
}

// ─── CursorProvider (outer shell — touch/SSR guard) ───────────────────────────

export function CursorProvider({ children }: { children: ReactNode }) {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  if (isTouch) {
    return <>{children}</>;
  }

  return <CursorProviderInner>{children}</CursorProviderInner>;
}

// ─── CursorProviderInner (all hooks live here) ────────────────────────────────

function CursorProviderInner({ children }: { children: ReactNode }) {
  // Primary cursor refs
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Trail dot refs — one per entry in TRAIL_CONFIG
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const trailPosRef = useRef(
    TRAIL_CONFIG.map(() => ({ x: -100, y: -100 }))
  );

  // rAF
  const rafRef = useRef<number>(0);

  // Position tracking (refs → no re-renders)
  const mouseRef    = useRef({ x: -100, y: -100 });
  const ringPosRef  = useRef({ x: -100, y: -100 });
  const hasEnteredRef = useRef(false);

  // Hover / click state
  const hoveredRef          = useRef<Element | null>(null);
  const contextualRingSizeRef = useRef(RING_DEFAULT);
  const mousedownTimeRef    = useRef(0);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Context API ──────────────────────────────────────────────────────────
  const apiRef = useRef({
    setCursorLabel: (label: string | null) => {
      if (!labelRef.current || !ringRef.current || !dotRef.current) return;
      if (label) {
        labelRef.current.textContent = label;
        labelRef.current.classList.add('cursor-label--visible');
        ringRef.current.classList.add('cursor-ring--labeled');
        ringRef.current.style.setProperty('--cursor-ring-size', RING_LABEL);
        dotRef.current.classList.add('cursor-dot--hidden');
        contextualRingSizeRef.current = RING_LABEL;
      } else {
        labelRef.current.classList.remove('cursor-label--visible');
        labelRef.current.textContent = '';
        ringRef.current.classList.remove('cursor-ring--labeled');
        ringRef.current.removeAttribute('data-cursor-fill');
        const restore = contextualRingSizeRef.current === RING_LABEL ? RING_DEFAULT : contextualRingSizeRef.current;
        ringRef.current.style.setProperty('--cursor-ring-size', restore);
        dotRef.current.classList.remove('cursor-dot--hidden');
        contextualRingSizeRef.current = RING_DEFAULT;
      }
    },
    setCursorColor: (color: CursorColor) => {
      const colorMap: Record<CursorColor, string> = {
        cream: '',
        terracotta: 'var(--terracotta)',
        basil: 'var(--basil)',
      };
      const val = colorMap[color];
      if (val) {
        dotRef.current?.style.setProperty('--cursor-color', val);
        ringRef.current?.style.setProperty('--cursor-color', val);
      } else {
        dotRef.current?.style.removeProperty('--cursor-color');
        ringRef.current?.style.removeProperty('--cursor-color');
      }
    },
    setCursorVariant: (variant: CursorVariant) => {
      if (!ringRef.current || !dotRef.current) return;
      switch (variant) {
        case 'hover':
          ringRef.current.style.setProperty('--cursor-ring-size', RING_HOVER);
          dotRef.current.style.setProperty('--cursor-dot-size', DOT_HOVER);
          contextualRingSizeRef.current = RING_HOVER;
          break;
        case 'label':
          ringRef.current.style.setProperty('--cursor-ring-size', RING_LABEL);
          dotRef.current.style.setProperty('--cursor-dot-size', DOT_HOVER);
          contextualRingSizeRef.current = RING_LABEL;
          break;
        default:
          ringRef.current.style.setProperty('--cursor-ring-size', RING_DEFAULT);
          dotRef.current.style.setProperty('--cursor-dot-size', DOT_DEFAULT);
          contextualRingSizeRef.current = RING_DEFAULT;
      }
    },
  });

  const contextValue = useMemo<CursorContextValue>(
    () => ({
      setCursorLabel: (l)  => apiRef.current.setCursorLabel(l),
      setCursorColor: (c)  => apiRef.current.setCursorColor(c),
      setCursorVariant: (v) => apiRef.current.setCursorVariant(v),
    }),
    [],
  );

  // ── Main effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // ── Fix: suppress cursor on ALL elements, not just html ─────────────
    const styleEl = document.createElement('style');
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    // ── rAF tick ─────────────────────────────────────────────────────────
    function tick() {
      if (!document.hidden) {
        const { x: mx, y: my } = mouseRef.current;
        const lerpFactor = reducedMotion ? 1.0 : 0.12;

        // Dot — exact
        if (dotRef.current) {
          dotRef.current.style.transform =
            `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
        }

        // Ring — lerp
        ringPosRef.current.x += (mx - ringPosRef.current.x) * lerpFactor;
        ringPosRef.current.y += (my - ringPosRef.current.y) * lerpFactor;
        if (ringRef.current) {
          ringRef.current.style.transform =
            `translate(calc(${ringPosRef.current.x}px - 50%), calc(${ringPosRef.current.y}px - 50%))`;
        }

        // Trail dots — each lerps toward the previous dot's position
        if (!reducedMotion) {
          let prevX = mx;
          let prevY = my;
          trailPosRef.current.forEach((pos, i) => {
            pos.x += (prevX - pos.x) * TRAIL_LERP;
            pos.y += (prevY - pos.y) * TRAIL_LERP;
            const el = trailRefs.current[i];
            if (el) {
              el.style.transform =
                `translate(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%))`;
            }
            prevX = pos.x;
            prevY = pos.y;
          });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    // ── Mouse visibility ─────────────────────────────────────────────────

    function showCursor() {
      dotRef.current?.classList.remove('cursor-dot--hidden');
      ringRef.current?.classList.remove('cursor-ring--hidden');
      trailRefs.current.forEach((el) => el?.classList.remove('cursor-dot--hidden'));
    }

    function hideCursor() {
      dotRef.current?.classList.add('cursor-dot--hidden');
      ringRef.current?.classList.add('cursor-ring--hidden');
      trailRefs.current.forEach((el) => el?.classList.add('cursor-dot--hidden'));
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!hasEnteredRef.current) {
        hasEnteredRef.current = true;
        showCursor();
      }
    }

    function onMouseLeave() { hideCursor(); }
    function onMouseEnter() { if (hasEnteredRef.current) showCursor(); }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // ── Interactive element detection ────────────────────────────────────

    function findCursorTarget(el: Element | null): Element | null {
      while (el && el !== document.body) {
        if (el.matches('a, button, [data-cursor], [data-cursor-label], [data-cursor-color]')) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    }

    function onPointerOver(e: PointerEvent) {
      const target = findCursorTarget(e.target as Element);
      if (!target || target === hoveredRef.current) return;
      hoveredRef.current = target;

      const label = target.getAttribute('data-cursor-label');

      // Label variant — fill ring with charcoal, hide dot, show text
      if (label) {
        if (labelRef.current) {
          labelRef.current.textContent = label;
          labelRef.current.classList.add('cursor-label--visible');
        }
        ringRef.current?.classList.add('cursor-ring--labeled');
        ringRef.current?.style.setProperty('--cursor-ring-size', RING_LABEL);
        dotRef.current?.classList.add('cursor-dot--hidden');
        contextualRingSizeRef.current = RING_LABEL;
        return;
      }

      // Plain hover (a, button, [data-cursor])
      if (target.matches('a, button, [data-cursor]')) {
        ringRef.current?.style.setProperty('--cursor-ring-size', RING_HOVER);
        dotRef.current?.style.setProperty('--cursor-dot-size', DOT_HOVER);
        contextualRingSizeRef.current = RING_HOVER;
      }
    }

    function onPointerOut(e: PointerEvent) {
      if (!hoveredRef.current) return;
      const related = e.relatedTarget as Element | null;
      if (related && hoveredRef.current.contains(related)) return;

      hoveredRef.current = null;
      contextualRingSizeRef.current = RING_DEFAULT;

      ringRef.current?.style.setProperty('--cursor-ring-size', RING_DEFAULT);
      dotRef.current?.style.setProperty('--cursor-dot-size', DOT_DEFAULT);
      ringRef.current?.classList.remove('cursor-ring--labeled');

      // Restore dot (was hidden during label state)
      dotRef.current?.classList.remove('cursor-dot--hidden');

      if (labelRef.current) {
        labelRef.current.classList.remove('cursor-label--visible');
        labelRef.current.textContent = '';
      }
    }

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);

    // ── Click feedback ────────────────────────────────────────────────────

    function onMouseDown() {
      mousedownTimeRef.current = Date.now();
      ringRef.current?.style.setProperty('--cursor-ring-size', RING_CLICK);
    }

    function onMouseUp() {
      const dur = Date.now() - mousedownTimeRef.current;
      if (dur < 150) {
        ringRef.current?.classList.add('cursor-ring--pulse');
        const onEnd = () => {
          ringRef.current?.classList.remove('cursor-ring--pulse');
          ringRef.current?.style.setProperty('--cursor-ring-size', contextualRingSizeRef.current);
          ringRef.current?.removeEventListener('animationend', onEnd);
        };
        ringRef.current?.addEventListener('animationend', onEnd);
      } else {
        ringRef.current?.style.setProperty('--cursor-ring-size', contextualRingSizeRef.current);
      }
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.head.removeChild(styleEl);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [reducedMotion]);

  // ── Portal markup ─────────────────────────────────────────────────────────
  const cursorMarkup = (
    <>
      {/* Trail dots — rendered beneath the main dot */}
      {TRAIL_CONFIG.map(([size, opacity], i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => { if (el) trailRefs.current[i] = el; }}
          className="cursor-trail cursor-dot--hidden"
          aria-hidden="true"
          style={{ width: size, height: size, opacity }}
        />
      ))}

      {/* Main dot */}
      <div
        ref={dotRef}
        className="cursor-dot cursor-dot--hidden"
        aria-hidden="true"
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="cursor-ring cursor-ring--hidden"
        aria-hidden="true"
      >
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );

  return (
    <CursorContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(cursorMarkup, document.body)
        : null}
    </CursorContext.Provider>
  );
}
