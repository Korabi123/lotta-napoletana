import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import heroPizza from "@/assets/hero-pizza.jpg";
import oven from "@/assets/oven.jpg";
import burrata from "@/assets/burrata.jpg";
import margherita from "@/assets/margherita.jpg";
import cortado from "@/assets/cortado.jpg";
import interior from "@/assets/interior.jpg";
import {
  SiteHeader,
  SiteFooter,
  ADDRESS,
  MAPS_URL,
  PHONE,
  PHONE_DISPLAY,
  WOLT_URL,
} from "@/components/SiteChrome";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lotta Napoletana — Wood-fired Neapolitan pizza in Prishtinë" },
      {
        name: "description",
        content:
          "Wood-fired Neapolitan pizza, 48-hour dough, and Kosovan house wine in the heart of Prishtinë. 5.0★ over 1,300 reviews. Open daily until 11 PM.",
      },
      { property: "og:title", content: "Lotta Napoletana — Wood-fired pizza in Prishtinë" },
      {
        property: "og:description",
        content: "Neapolitan pizza in Prishtinë. Wood-fired, hand-stretched, 5.0★ over 1,300 times.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: heroPizza, fetchpriority: "high" } as unknown as {
        rel: string;
        as: string;
        href: string;
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Lotta Napoletana",
          servesCuisine: ["Italian", "Neapolitan", "Pizza"],
          priceRange: "€5–10",
          telephone: PHONE,
          address: {
            "@type": "PostalAddress",
            streetAddress: "26 Meto Bajraktari",
            addressLocality: "Prishtinë",
            postalCode: "10000",
            addressCountry: "XK",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "1318",
          },
          hasMenu: "/menu",
          openingHours: "Mo-Su 11:00-23:00",
          acceptsReservations: true,
          hasMap: MAPS_URL,
        }),
      },
    ],
  }),
  component: Index,
});

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const tr = t(lang).preloader;

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { value: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(rootRef.current, {
            yPercent: -100,
            duration: 1.1,
            ease: "expo.inOut",
            onComplete: onDone,
          });
        },
      });

      tl.from(labelRef.current, { opacity: 0, y: 12, duration: 0.6, ease: "power2.out" })
        .from(
          titleRef.current?.querySelectorAll("span") ?? [],
          { yPercent: 110, duration: 0.9, stagger: 0.06, ease: "expo.out" },
          "-=0.3"
        )
        .to(
          counter,
          {
            value: 100,
            duration: 2.4,
            ease: "power1.inOut",
            onUpdate: () => {
              if (countRef.current)
                countRef.current.textContent = String(Math.floor(counter.value)).padStart(3, "0");
              if (barRef.current) barRef.current.style.transform = `scaleX(${counter.value / 100})`;
            },
          },
          0.2
        )
        .to(
          [labelRef.current, countRef.current, barRef.current, titleRef.current],
          { opacity: 0, y: -10, duration: 0.6, ease: "power2.in" },
          "+=0.2"
        );
    }, rootRef);
    return () => ctx.revert();
  }, [onDone]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] flex flex-col justify-between bg-charcoal text-cream p-6 md:p-10">
      <div ref={labelRef} className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] opacity-80">
        <span className="font-mono">Lotta Napoletana</span>
        <span className="font-mono">Est. Prishtinë</span>
      </div>
      <div ref={titleRef} className="font-display leading-[0.85] text-[18vw] md:text-[14vw] tracking-tight">
        <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block">Lotta</span></div>
        <div className="overflow-hidden py-[0.15em] -my-[0.15em] text-right italic text-terracotta"><span className="block">Napoletana.</span></div>
      </div>
      <div className="flex items-end justify-between gap-6">
        <div className="flex-1">
          <div className="h-px w-full bg-cream/20 overflow-hidden">
            <div ref={barRef} className="h-px w-full bg-cream origin-left" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.3em] font-mono opacity-70">{tr.tagline}</div>
        </div>
        <div ref={countRef} className="font-display text-5xl md:text-7xl tabular-nums">000</div>
      </div>
    </div>
  );
}

function Index() {
  const [loading, setLoading] = useState(true);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const tr = t(lang);

  // Parallax via Lenis (runs every smooth-scroll frame, no stutter)
  useLenis(({ scroll }) => {
    const parallaxEls = sectionsRef.current?.querySelectorAll<HTMLElement>(".parallax");
    if (!parallaxEls) return;
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const delta = (rect.top + rect.height / 2 - center) / window.innerHeight;
      gsap.set(el, { y: delta * -40 });
    });
  });

  useIsoLayoutEffect(() => {
    if (loading) return;
    const sections = sectionsRef.current;
    if (!sections) return;

    const ctx = gsap.context(() => {
      // Make visible, then animate hero in
      gsap.set(sections, { visibility: "visible" });

      // Set starting positions first, then animate in
      gsap.set(".hero-line span", { yPercent: 110 });
      gsap.set(".hero-meta", { opacity: 0, y: 20 });
      gsap.set(heroImgRef.current, { scale: 1.15, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".hero-line span", { yPercent: 0, stagger: 0.08, duration: 1.1 }, 0.1)
        .to(".hero-meta", { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, 0.4)
        .to(heroImgRef.current, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out" }, 0.1);

      const revealEls = gsap.utils.toArray<HTMLElement>(".reveal");
      revealEls.forEach((el) => {
        gsap.set(el, { y: 40, opacity: 0 });
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: "expo.out" });
                io.unobserve(el);
              }
            });
          },
          { threshold: 0.15 }
        );
        io.observe(el);
      });
    }, sections);
    return () => ctx.revert();
  }, [loading]);

  return (
    <>
      {loading && <Preloader onDone={() => setLoading(false)} />}
      <div
        ref={sectionsRef}
        className="min-h-screen bg-cream text-charcoal"
        style={{ visibility: loading ? "hidden" : undefined }}
      >
        <SiteHeader variant="overlay" />

        {/* HERO */}
        <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-8 px-6 md:px-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">
            <span className="hero-meta">{ADDRESS}</span>
            <span className="hero-meta flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-basil ember-flicker" /> {tr.home.heroOpen}
            </span>
          </div>

          <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-end mt-10">
            <div className="md:col-span-7 order-2 md:order-1">
              <h1 className="hero-line font-display leading-[0.85] text-[20vw] md:text-[12vw] tracking-tight">
                <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block">Napoli</span></div>
                <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block italic text-terracotta">a Prishtinë.</span></div>
              </h1>
              <div className="mt-8 grid grid-cols-3 gap-6 max-w-lg">
                <div className="hero-meta">
                  <div className="font-display text-4xl">5.0</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-charcoal/60 mt-1">{tr.home.heroReviews}</div>
                </div>
                <div className="hero-meta">
                  <div className="font-display text-4xl">€5–10</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-charcoal/60 mt-1">{tr.home.heroPriceLabel}</div>
                </div>
                <div className="hero-meta">
                  <div className="font-display text-4xl">450°</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-charcoal/60 mt-1">{tr.home.heroFireLabel}</div>
                </div>
              </div>
              <div className="hero-meta mt-10 flex flex-wrap gap-3">
                <a
                  href={WOLT_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] uppercase tracking-[0.25em] font-mono bg-charcoal text-cream rounded-full px-5 py-3 hover:bg-terracotta transition"
                >
                  {tr.home.orderWolt}
                </a>
                <Link
                  to="/menu"
                  className="text-[11px] uppercase tracking-[0.25em] font-mono border border-charcoal rounded-full px-5 py-3 hover:bg-charcoal hover:text-cream transition"
                >
                  {tr.home.seeMenu}
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 order-1 md:order-2 relative aspect-[4/5] overflow-hidden rounded-sm">
              <img
                ref={heroImgRef}
                src={heroPizza}
                alt="Wood-fired Neapolitan pizza with basil at Lotta Napoletana"
                width={1600}
                height={1808}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-cream text-[10px] font-mono uppercase tracking-[0.25em]">
                <span>Nº 01 — Marinara</span>
                <span>{tr.home.heroImageCaption}</span>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section aria-hidden="true" className="border-y border-charcoal/15 py-6 overflow-hidden">
          <div className="flex whitespace-nowrap marquee-track font-display text-5xl md:text-7xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center gap-10 pr-10">
                {["Marinara", "★", "Margherita", "★", "Burrata", "★", "Diavola", "★", "Quattro Formaggi", "★", "Vegana", "★"].map(
                  (w, i) => (
                    <span key={`${k}-${i}`} className={i % 2 ? "text-terracotta" : ""}>
                      {w}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="px-6 md:px-10 py-24 md:py-40 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <div className="reveal text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.home.story.eyebrow}</div>
            <h2 className="reveal font-display text-6xl md:text-7xl leading-[0.9] mt-4">
              {tr.home.story.heading1}<span className="italic text-terracotta">{tr.home.story.headingEm}</span>{tr.home.story.heading2}
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 space-y-8">
            <p className="reveal text-lg md:text-xl leading-relaxed text-balance">
              {tr.home.story.p1}
            </p>
            <p className="reveal text-charcoal/70 leading-relaxed">
              {tr.home.story.p2}
            </p>
            <div className="reveal aspect-[4/3] overflow-hidden rounded-sm">
              <img
                src={oven}
                alt="Pizza baking in a wood-fired oven"
                width={1408}
                height={1712}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover parallax"
              />
            </div>
          </div>
        </section>

        {/* MENU PREVIEW */}
        <section id="menu-preview" className="px-6 md:px-10 py-24 md:py-32 bg-charcoal text-cream">
          <div className="flex items-end justify-between mb-16 md:mb-24">
            <div>
              <div className="reveal text-[11px] uppercase tracking-[0.3em] font-mono text-cream/60">{tr.home.highlights.eyebrow}</div>
              <h2 className="reveal font-display text-6xl md:text-8xl leading-[0.9] mt-4">{tr.home.highlights.heading}</h2>
            </div>
            <Link
              to="/menu"
              className="reveal hidden md:inline-flex text-[11px] uppercase tracking-[0.25em] font-mono border border-cream rounded-full px-5 py-3 hover:bg-cream hover:text-charcoal transition"
            >
              {tr.home.highlights.seeAll}
            </Link>
          </div>

          <div className="space-y-16 md:space-y-24">
            {[
              { n: "01", name: "Pizza Marinara", price: "€6", img: heroPizza, alt: "Pizza marinara" },
              { n: "02", name: "Pizza Margherita", price: "€7", img: margherita, alt: "Pizza margherita" },
              { n: "03", name: "Sallatë Burrata", price: "€9", img: burrata, alt: "Burrata salad with heirloom tomato" },
              { n: "04", name: "Cortado", price: "€2", img: cortado, alt: "Cortado coffee" },
            ].map((item, i) => (
              <div key={item.n} className="reveal grid md:grid-cols-12 gap-6 md:gap-10 items-center group border-t border-cream/15 pt-10">
                <div className={`md:col-span-2 font-mono text-sm text-cream/50 ${i % 2 ? "md:order-3" : ""}`}>Nº {item.n}</div>
                <div className={`md:col-span-4 aspect-[4/5] overflow-hidden rounded-sm ${i % 2 ? "md:order-1" : "md:order-2"}`}>
                  <img
                    src={item.img}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="parallax w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className={`md:col-span-6 ${i % 2 ? "md:order-2" : "md:order-3"}`}>
                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="font-display text-4xl md:text-6xl">{item.name}</h3>
                    <span className="font-display text-3xl md:text-4xl text-terracotta">{item.price}</span>
                  </div>
                  <p className="mt-4 text-cream/70 md:text-lg max-w-md">{tr.home.highlights.dishes[i].desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-16 md:hidden">
            <Link
              to="/menu"
              className="inline-flex text-[11px] uppercase tracking-[0.25em] font-mono border border-cream rounded-full px-5 py-3"
            >
              {tr.home.highlights.seeAll}
            </Link>
          </div>
        </section>

        {/* VOICES */}
        <section id="voices" className="px-6 md:px-10 py-24 md:py-40">
          <div className="reveal text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.home.voices.eyebrow}</div>
          <h2 className="reveal font-display text-6xl md:text-8xl leading-[0.9] mt-4 max-w-4xl">
            {tr.home.voices.heading1}<span className="italic text-terracotta">{tr.home.voices.headingEm}</span>{tr.home.voices.heading2}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              { q: "Best pizza I have ever eaten in my life by a long shot. No wonder this place is rated with 5 stars over a thousand times. A must visit.", a: "Efe Timur", m: "Local Guide" },
              { q: "The dough — you could tell how good the flour and craftsmanship were from the very first bite. The chef walked from table to table. Excellent.", a: "Erhan Horuzoglu", m: "Dinner, 2 months ago" },
              { q: "A fantastic dinner on holiday. The pizzas were fantastic, everything felt really authentic, the setting quiet and beautiful. Great value.", a: "Isabel Roberts", m: "Dinner, a month ago" },
            ].map((r, i) => (
              <figure key={i} className="reveal border-t border-charcoal/20 pt-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-terracotta text-sm tracking-[0.5em]" aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                  <blockquote className="font-display text-2xl md:text-3xl leading-tight mt-4">
                    “{r.q}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">
                  {r.a} · <span className="text-charcoal/40">{r.m}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* VISIT */}
        <section id="visit" className="relative">
          <div className="absolute inset-0">
            <img
              src={interior}
              alt="Interior of an Italian pizzeria at dusk"
              width={1600}
              height={1200}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-charcoal/70" />
          </div>
          <div className="relative px-6 md:px-10 py-24 md:py-40 text-cream grid md:grid-cols-12 gap-8">
            <div className="md:col-span-6">
              <div className="reveal text-[11px] uppercase tracking-[0.3em] font-mono text-cream/60">{tr.home.visit.eyebrow}</div>
              <h2 className="reveal font-display text-6xl md:text-8xl leading-[0.9] mt-4">
                {tr.home.visit.heading1}<span className="italic text-terracotta">{tr.home.visit.headingEm}</span>
              </h2>
              <p className="reveal mt-6 text-cream/80 max-w-md md:text-lg">
                {tr.home.visit.desc}
              </p>
            </div>
            <div className="md:col-span-5 md:col-start-8 space-y-8">
              {[
                { l: tr.home.visit.labelAddress, v: ADDRESS },
                { l: tr.home.visit.labelHours, v: tr.home.visit.hoursValue },
                { l: tr.home.visit.labelPhone, v: PHONE_DISPLAY },
                { l: tr.home.visit.labelDelivery, v: "wolt.com" },
              ].map((row) => (
                <div key={row.l} className="reveal border-t border-cream/20 pt-4 flex items-baseline justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-cream/60">{row.l}</div>
                  <div className="font-display text-2xl md:text-3xl text-right">{row.v}</div>
                </div>
              ))}
              <div className="reveal flex flex-wrap gap-3 pt-4">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] uppercase tracking-[0.25em] font-mono border border-cream rounded-full px-5 py-3 hover:bg-cream hover:text-charcoal transition"
                >
                  {tr.home.visit.getDirections}
                </a>
                <a
                  href={WOLT_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] uppercase tracking-[0.25em] font-mono bg-terracotta text-cream rounded-full px-5 py-3 hover:bg-ember transition"
                >
                  {tr.home.visit.orderWolt}
                </a>
                <Link
                  to="/contact"
                  className="text-[11px] uppercase tracking-[0.25em] font-mono border border-cream rounded-full px-5 py-3 hover:bg-cream hover:text-charcoal transition"
                >
                  {tr.home.visit.reserve}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
