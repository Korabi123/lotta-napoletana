import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SiteHeader, SiteFooter, WOLT_URL, PHONE, PHONE_DISPLAY } from "@/components/SiteChrome";
import { MENU } from "@/lib/menu-data";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Lotta Napoletana · Wood-fired pizza in Prishtinë" },
      {
        name: "description",
        content:
          "The full menu at Lotta Napoletana: Neapolitan pizza (Marinara, Margherita, Bufalina, Diavola), antipasti, dolci, and house wine. Prices from €1.50.",
      },
      { property: "og:title", content: "Menu — Lotta Napoletana" },
      { property: "og:description", content: "Wood-fired Neapolitan pizza, antipasti, and Kosovan house wine in Prishtinë." },
      { property: "og:url", content: "/menu" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Menu",
          name: "Lotta Napoletana Menu",
          hasMenuSection: MENU.map((s) => ({
            "@type": "MenuSection",
            name: s.title,
            hasMenuItem: s.items.map((i) => ({
              "@type": "MenuItem",
              name: i.name,
              description: i.desc,
              offers: { "@type": "Offer", price: i.price.replace(/[^\d.]/g, ""), priceCurrency: "EUR" },
            })),
          })),
        }),
      },
    ],
  }),
  component: MenuPage,
});

function TagBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    vegan: "bg-basil/15 text-basil border-basil/30",
    vegetarian: "bg-terracotta/10 text-terracotta border-terracotta/30",
  };
  return (
    <span className={`text-[9px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 border rounded-full ${colors[label] ?? "border-charcoal/20"}`}>
      {label}
    </span>
  );
}

function MenuPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const tr = t(lang).menu;

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".menu-hero span", { yPercent: 110, stagger: 0.08, duration: 1.1, ease: "expo.out" });
      gsap.from(".menu-meta", { opacity: 0, y: 20, duration: 0.8, stagger: 0.1, delay: 0.4, ease: "expo.out" });

      const reveals = gsap.utils.toArray<HTMLElement>(".reveal");
      reveals.forEach((el) => {
        gsap.set(el, { y: 40, opacity: 0 });
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                gsap.to(el, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out" });
                io.unobserve(el);
              }
            });
          },
          { threshold: 0.12 }
        );
        io.observe(el);
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-cream text-charcoal">
      <SiteHeader variant="solid" />

      <section className="pt-32 md:pt-40 pb-16 px-6 md:px-10">
        <div className="menu-meta text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.eyebrow}</div>
        <h1 className="menu-hero font-display text-6xl md:text-[10vw] leading-[0.85] mt-4 tracking-tight">
          <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block">{tr.heading1}</span></div>
          <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block italic text-terracotta">{tr.heading2}</span></div>
        </h1>
        <p className="menu-meta mt-6 max-w-xl text-charcoal/70 md:text-lg">
          {tr.desc}
        </p>
        <div className="menu-meta mt-8 flex flex-wrap gap-3">
          <a
            href={WOLT_URL}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor-label="Order"
            className="text-[11px] uppercase tracking-[0.25em] font-mono bg-charcoal text-cream rounded-full px-5 py-3 hover:bg-terracotta transition"
          >
            {tr.orderWolt}
          </a>
          <a
            href={`tel:${PHONE}`}
            data-cursor-label="Call"
            className="text-[11px] uppercase tracking-[0.25em] font-mono border border-charcoal rounded-full px-5 py-3 hover:bg-charcoal hover:text-cream transition"
          >
            {tr.call(PHONE_DISPLAY)}
          </a>
        </div>
      </section>

      <div className="px-6 md:px-10 pb-24 space-y-24 md:space-y-32">
        {MENU.map((section) => (
          <section key={section.title} className="reveal grid md:grid-cols-12 gap-8">
            <header className="md:col-span-4 md:sticky md:top-32 md:self-start">
              <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">
                {tr.sectionSubtitles[section.subtitle] ?? section.subtitle}
              </div>
              <h2 className="font-display text-5xl md:text-6xl leading-[0.9] mt-3">{section.title}</h2>
            </header>
            <div className="md:col-span-8 divide-y divide-charcoal/15">
              {section.items.map((item, i) => (
                <article key={`${section.title}-${i}`} data-cursor className="py-6 first:pt-0 grid grid-cols-[1fr_auto] gap-6 items-baseline">
                  <div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="font-display text-2xl md:text-3xl">{item.name}</h3>
                      {item.tags?.map((tag) => <TagBadge key={tag} label={tag} />)}
                    </div>
                    <p className="mt-2 text-charcoal/70 max-w-xl">
                      {lang === "sq" ? item.descSq : item.desc}
                    </p>
                  </div>
                  <div className="font-display text-2xl md:text-3xl text-terracotta tabular-nums">{item.price}</div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
