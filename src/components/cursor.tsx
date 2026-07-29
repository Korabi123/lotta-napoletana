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
  // SSR + touch guard — matchMedia is synchronous, so this is safe to read
  // before hooks. We delegate to an inner component to keep hooks rules
  // strictly satisfied.
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
  // DOM refs for cursor elements
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // rAF ref
  const rafRef = useRef<number>(0);

  // Position tracking refs (not state — no re-renders)
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const hasEnteredRef = useRef(false);
  const isInsideRef = useRef(false);

  // Hover / click tracking refs
  const hoveredRef = useRef<Element | null>(null);
  const contextualRingSizeRef = useRef('40px');
  const mousedownTimeRef = useRef(0);

  // Detect reduced motion once (synchronous, non-reactive)
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Context value (stable, no re-renders) ──────────────────────────────────
  // Use a ref to hold callbacks so they can access DOM refs without re-renders
  const apiRef = useRef({
    setCursorLabel: (label: string | null) => {
      if (!labelRef.current || !ringRef.current || !dotRef.current) return;
      if (label) {
        labelRef.current.textContent = label;
        labelRef.current.classList.add('cursor-label--visible');
        ringRef.current.style.setProperty('--cursor-ring-size', '80px');
        dotRef.current.style.setProperty('--cursor-dot-size', '3px');
        contextualRingSizeRef.current = '80px';
      } else {
        labelRef.current.classList.remove('cursor-label--visible');
        labelRef.current.textContent = '';
        ringRef.current.style.setProperty('--cursor-ring-size', contextualRingSizeRef.current === '80px' ? '40px' : contextualRingSizeRef.current);
        dotRef.current.style.setProperty('--cursor-dot-size', '6px');
        contextualRingSizeRef.current = '40px';
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
          ringRef.current.style.setProperty('--cursor-ring-size', '64px');
          dotRef.current.style.setProperty('--cursor-dot-size', '3px');
          contextualRingSizeRef.current = '64px';
          break;
        case 'label':
          ringRef.current.style.setProperty('--cursor-ring-size', '80px');
          dotRef.current.style.setProperty('--cursor-dot-size', '3px');
          contextualRingSizeRef.current = '80px';
          break;
        default:
          ringRef.current.style.setProperty('--cursor-ring-size', '40px');
          dotRef.current.style.setProperty('--cursor-dot-size', '6px');
          contextualRingSizeRef.current = '40px';
      }
    },
  });

  const contextValue = useMemo<CursorContextValue>(
    () => ({
      setCursorLabel: (label) => apiRef.current.setCursorLabel(label),
      setCursorColor: (color) => apiRef.current.setCursorColor(color),
      setCursorVariant: (variant) => apiRef.current.setCursorVariant(variant),
    }),
    [],
  );

  // ── Main effect: cursor: none, rAF loop, event listeners ──────────────────
  useEffect(() => {
    // SSR guard (should never be needed here since the outer guard handles it,
    // but kept for belt-and-suspenders safety)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Apply cursor: none globally
    document.documentElement.style.cursor = 'none';

    // ── rAF tick ──────────────────────────────────────────────────────────
    function tick() {
      if (!document.hidden) {
        const { x: mx, y: my } = mouseRef.current;
        const lerpFactor = reducedMotion ? 1.0 : 0.12;

        // Dot — exact tracking
        if (dotRef.current) {
          dotRef.current.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
        }

        // Ring — lerp toward mouse position
        ringPosRef.current.x += (mx - ringPosRef.current.x) * lerpFactor;
        ringPosRef.current.y += (my - ringPosRef.current.y) * lerpFactor;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(calc(${ringPosRef.current.x}px - 50%), calc(${ringPosRef.current.y}px - 50%))`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    // ── Event handlers ────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // First ever mousemove — fade in both elements
      if (!hasEnteredRef.current) {
        hasEnteredRef.current = true;
        dotRef.current?.classList.remove('cursor-dot--hidden');
        ringRef.current?.classList.remove('cursor-ring--hidden');
      }
    }

    function onMouseLeave() {
      isInsideRef.current = false;
      dotRef.current?.classList.add('cursor-dot--hidden');
      ringRef.current?.classList.add('cursor-ring--hidden');
    }

    function onMouseEnter() {
      isInsideRef.current = true;
      if (hasEnteredRef.current) {
        dotRef.current?.classList.remove('cursor-dot--hidden');
        ringRef.current?.classList.remove('cursor-ring--hidden');
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // ── Interactive element detection (event delegation) ──────────────────

    function findCursorTarget(el: Element | null): Element | null {
      while (el && el !== document.body) {
        if (
          el.matches('a, button, [data-cursor], [data-cursor-label], [data-cursor-color]')
        ) {
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
      const color = target.getAttribute('data-cursor-color');

      // Color zone
      if (color === 'terracotta' || color === 'basil') {
        const colorValue = color === 'terracotta' ? 'var(--terracotta)' : 'var(--basil)';
        dotRef.current?.style.setProperty('--cursor-color', colorValue);
        ringRef.current?.style.setProperty('--cursor-color', colorValue);
        if (labelRef.current) labelRef.current.style.color = colorValue;
      }

      // Label variant
      if (label) {
        if (labelRef.current) {
          labelRef.current.textContent = label;
          labelRef.current.classList.add('cursor-label--visible');
        }
        ringRef.current?.style.setProperty('--cursor-ring-size', '80px');
        dotRef.current?.style.setProperty('--cursor-dot-size', '3px');
        contextualRingSizeRef.current = '80px';
        return;
      }

      // Plain hover variant (a, button, [data-cursor])
      if (target.matches('a, button, [data-cursor]')) {
        ringRef.current?.style.setProperty('--cursor-ring-size', '64px');
        dotRef.current?.style.setProperty('--cursor-dot-size', '3px');
        contextualRingSizeRef.current = '64px';
      }
    }

    function onPointerOut(e: PointerEvent) {
      if (!hoveredRef.current) return;
      // Only revert if we're leaving the hovered element's subtree
      const related = e.relatedTarget as Element | null;
      if (related && hoveredRef.current.contains(related)) return;

      hoveredRef.current = null;
      contextualRingSizeRef.current = '40px';

      // Restore sizes
      ringRef.current?.style.setProperty('--cursor-ring-size', '40px');
      dotRef.current?.style.setProperty('--cursor-dot-size', '6px');

      // Restore color
      dotRef.current?.style.removeProperty('--cursor-color');
      ringRef.current?.style.removeProperty('--cursor-color');

      // Hide label
      if (labelRef.current) {
        labelRef.current.classList.remove('cursor-label--visible');
        labelRef.current.textContent = '';
        labelRef.current.style.color = '';
      }
    }

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);

    // ── Click feedback ────────────────────────────────────────────────────

    function onMouseDown() {
      mousedownTimeRef.current = Date.now();
      ringRef.current?.style.setProperty('--cursor-ring-size', '30px');
    }

    function onMouseUp() {
      const pressDuration = Date.now() - mousedownTimeRef.current;
      if (pressDuration < 150) {
        // Short press: pulse animation then restore
        ringRef.current?.classList.add('cursor-ring--pulse');
        const onAnimEnd = () => {
          ringRef.current?.classList.remove('cursor-ring--pulse');
          ringRef.current?.style.setProperty('--cursor-ring-size', contextualRingSizeRef.current);
          ringRef.current?.removeEventListener('animationend', onAnimEnd);
        };
        ringRef.current?.addEventListener('animationend', onAnimEnd);
      } else {
        ringRef.current?.style.setProperty('--cursor-ring-size', contextualRingSizeRef.current);
      }
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.cursor = '';
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
      <div
        ref={dotRef}
        className="cursor-dot cursor-dot--hidden"
        aria-hidden="true"
      />
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
