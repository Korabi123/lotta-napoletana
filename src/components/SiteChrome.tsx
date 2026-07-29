import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

export const WOLT_URL = "https://wolt.com/sq/xkx/pristina/restaurant/lottas-pizzabar-napoletana";
export const GLOVO_URL = "https://glovoapp.com/";
export const MAPS_URL = "https://maps.app.goo.gl/xaaRoytszneFUEZt6";
export const PHONE = "+38344255064";
export const PHONE_DISPLAY = "+383 44 255 064";
export const EMAIL = "hello@lottanapoletana.com";
export const ADDRESS = "26 Meto Bajraktari, Prishtinë 10000";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "sq" : "en")}
      className={`text-[11px] uppercase tracking-[0.25em] font-mono opacity-70 hover:opacity-100 transition select-none ${className}`}
      aria-label={lang === "en" ? "Switch to Albanian" : "Kalo në Anglisht"}
    >
      <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
      <span className="mx-1 opacity-30">/</span>
      <span className={lang === "sq" ? "opacity-100" : "opacity-40"}>SQ</span>
    </button>
  );
}

export function SiteHeader({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const { lang } = useLang();
  const tr = t(lang).nav;
  const base =
    variant === "overlay"
      ? "mix-blend-difference text-cream"
      : "bg-cream text-charcoal border-b border-charcoal/10";
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-5 flex items-center justify-between ${base}`}
    >
      <Link to="/" className="font-display text-xl">
        Lotta<span className="italic">.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] font-mono">
        <Link to="/menu" className="hover:opacity-60 transition" activeProps={{ className: "opacity-60" }}>
          {tr.menu}
        </Link>
        <Link to="/" hash="story" className="hover:opacity-60 transition">
          {tr.story}
        </Link>
        <Link to="/contact" className="hover:opacity-60 transition" activeProps={{ className: "opacity-60" }}>
          {tr.contact}
        </Link>
        <Link to="/" hash="visit" className="hover:opacity-60 transition">
          {tr.visit}
        </Link>
        <LangSwitcher />
      </nav>
      <div className="flex items-center gap-4">
        <LangSwitcher className="md:hidden" />
        <a
          href={WOLT_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[11px] uppercase tracking-[0.25em] font-mono border border-current rounded-full px-4 py-2 hover:bg-cream hover:text-charcoal transition"
        >
          {tr.order}
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang } = useLang();
  const tr = t(lang).footer;
  return (
    <footer className="bg-charcoal text-cream px-6 md:px-10 py-16">
      <div className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <div className="font-display text-5xl md:text-6xl leading-none">
            Lotta<br />
            <span className="italic text-terracotta">Napoletana.</span>
          </div>
          <p className="mt-6 max-w-sm text-cream/70">
            {tr.tagline}
          </p>
        </div>
        <div className="md:col-span-3 space-y-3 text-sm">
          <div className="text-[10px] uppercase tracking-[0.3em] font-mono text-cream/50">{tr.orderLabel}</div>
          <a href={WOLT_URL} target="_blank" rel="noreferrer noopener" className="block hover:text-terracotta transition">
            {tr.wolt}
          </a>
          <a href={`tel:${PHONE}`} className="block hover:text-terracotta transition">
            {tr.call(PHONE_DISPLAY)}
          </a>
          <a href={MAPS_URL} target="_blank" rel="noreferrer noopener" className="block hover:text-terracotta transition">
            {tr.directions}
          </a>
        </div>
        <div className="md:col-span-4 space-y-3 text-sm">
          <div className="text-[10px] uppercase tracking-[0.3em] font-mono text-cream/50">{tr.visitLabel}</div>
          <address className="not-italic text-cream/80">{ADDRESS}</address>
          <a href={`mailto:${EMAIL}`} className="block hover:text-terracotta transition">
            {EMAIL}
          </a>
          <div className="text-cream/60">{tr.hours}</div>
        </div>
      </div>
      <div className="mt-16 pt-6 border-t border-cream/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] font-mono text-cream/40">
        <span>© {new Date().getFullYear()} Lotta Napoletana</span>
        <span>{tr.credit} · 🇮🇹 × 🇽🇰</span>
      </div>
    </footer>
  );
}
