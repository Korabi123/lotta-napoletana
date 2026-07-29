import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { z } from "zod";
import {
  SiteHeader,
  SiteFooter,
  ADDRESS,
  EMAIL,
  MAPS_URL,
  PHONE,
  PHONE_DISPLAY,
  WOLT_URL,
} from "@/components/SiteChrome";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  topic: z.enum(["reservation", "private-event", "press", "other"]),
  people: z.coerce.number().int().min(1).max(60).optional().or(z.literal("").transform(() => undefined)),
  date: z.string().trim().max(40).optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().min(10, "Please add a short message").max(1000, "Please keep it under 1000 characters"),
});

type FormState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success" };

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Reservations — Lotta Napoletana" },
      {
        name: "description",
        content:
          "Reserve a table, host a private event, or get in touch with Lotta Napoletana in Prishtinë. Call +383 44 255 064 or send an inquiry online.",
      },
      { property: "og:title", content: "Contact & Reservations — Lotta Napoletana" },
      { property: "og:description", content: "Reservations, private events, and inquiries for Lotta Napoletana in Prishtinë." },
      { property: "og:url", content: "/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLang();
  const tr = t(lang).contact;

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".c-hero span", { yPercent: 110, stagger: 0.08, duration: 1.1, ease: "expo.out" });
      gsap.from(".c-fade", { opacity: 0, y: 20, duration: 0.9, stagger: 0.08, delay: 0.3, ease: "expo.out" });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setState({ status: "error", errors });
      setSubmitting(false);
      return;
    }

    // No backend wired up: hand off to the venue via mailto with a safely
    // built body. Everything is validated + URL-encoded before use.
    const d = parsed.data;
    const lines = [
      `Name: ${d.name}`,
      `Email: ${d.email}`,
      `Topic: ${d.topic}`,
      d.people ? `Party size: ${d.people}` : null,
      d.date ? `Preferred date/time: ${d.date}` : null,
      "",
      d.message,
    ].filter(Boolean);
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `[Inquiry] ${d.topic} — ${d.name}`
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = href;
    setState({ status: "success" });
    setSubmitting(false);
  }

  const errors = state.status === "error" ? state.errors : {};

  return (
    <div ref={rootRef} className="min-h-screen bg-cream text-charcoal">
      <SiteHeader variant="solid" />

      <section className="pt-32 md:pt-40 pb-16 px-6 md:px-10">
        <div className="c-fade text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.eyebrow}</div>
        <h1 className="c-hero font-display text-6xl md:text-[10vw] leading-[0.85] mt-4 tracking-tight">
          <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block">{tr.heading1}</span></div>
          <div className="overflow-hidden py-[0.15em] -my-[0.15em]"><span className="block italic text-terracotta">{tr.heading2}</span></div>
        </h1>
      </section>

      <div className="px-6 md:px-10 pb-24 grid md:grid-cols-12 gap-10">
        {/* CONTACT INFO */}
        <aside className="md:col-span-4 space-y-8">
          <div className="c-fade">
            <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.fastestWay}</div>
            <a href={`tel:${PHONE}`} data-cursor-label="Call" className="mt-2 block font-display text-3xl md:text-4xl hover:text-terracotta transition">
              {PHONE_DISPLAY}
            </a>
            <div className="text-sm text-charcoal/60 mt-1">{tr.openHours}</div>
          </div>

          <div className="c-fade">
            <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.orderOnline}</div>
            <a
              href={WOLT_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor-label="Order"
              className="mt-2 block font-display text-2xl md:text-3xl hover:text-terracotta transition"
            >
              wolt.com →
            </a>
          </div>

          <div className="c-fade">
            <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.emailLabel}</div>
            <a href={`mailto:${EMAIL}`} className="mt-2 block font-display text-2xl md:text-3xl hover:text-terracotta transition break-words">
              {EMAIL}
            </a>
          </div>

          <div className="c-fade">
            <div className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{tr.findUs}</div>
            <address className="mt-2 not-italic font-display text-2xl md:text-3xl leading-tight">
              {ADDRESS}
            </address>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor-label="Directions"
              className="mt-3 inline-block text-[11px] uppercase tracking-[0.25em] font-mono border border-charcoal rounded-full px-4 py-2 hover:bg-charcoal hover:text-cream transition"
            >
              {tr.googleMaps}
            </a>
          </div>
        </aside>

        {/* FORM */}
        <div className="md:col-span-7 md:col-start-6 c-fade">
          {state.status === "success" ? (
            <div className="border border-basil/40 bg-basil/10 p-8 rounded-sm">
              <div className="font-display text-3xl">{tr.successTitle}</div>
              <p className="mt-2 text-charcoal/70">
                {tr.successBody}{" "}
                <a href={`mailto:${EMAIL}`} className="underline decoration-terracotta">
                  {EMAIL}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Field label={tr.fieldName} error={errors.name}>
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={80}
                    autoComplete="name"
                    className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg"
                  />
                </Field>
                <Field label={tr.fieldEmail} error={errors.email}>
                  <input
                    type="email"
                    name="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                    className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg"
                  />
                </Field>
              </div>

              <Field label={tr.fieldTopic} error={errors.topic}>
                <select
                  name="topic"
                  required
                  defaultValue="reservation"
                  className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg"
                >
                  <option value="reservation">{tr.topicReservation}</option>
                  <option value="private-event">{tr.topicPrivate}</option>
                  <option value="press">{tr.topicPress}</option>
                  <option value="other">{tr.topicOther}</option>
                </select>
              </Field>

              <div className="grid md:grid-cols-2 gap-6">
                <Field label={tr.fieldPartySize} error={errors.people}>
                  <input
                    type="number"
                    name="people"
                    min={1}
                    max={60}
                    className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg"
                  />
                </Field>
                <Field label={tr.fieldDate} error={errors.date}>
                  <input
                    type="text"
                    name="date"
                    maxLength={40}
                    placeholder="Fri, 7:30 PM"
                    className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg"
                  />
                </Field>
              </div>

              <Field label={tr.fieldMessage} error={errors.message}>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={5}
                  className="w-full bg-transparent border-b border-charcoal/30 focus:border-charcoal outline-none py-2 text-lg resize-none"
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                data-cursor-label="Send"
                className="text-[11px] uppercase tracking-[0.25em] font-mono bg-charcoal text-cream rounded-full px-6 py-4 hover:bg-terracotta transition disabled:opacity-50"
              >
                {submitting ? tr.submitting : tr.submit}
              </button>
              <p className="text-xs text-charcoal/50">
                {tr.submitNote}
              </p>
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-charcoal/60">{label}</span>
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-xs text-terracotta">{error}</span> : null}
    </label>
  );
}
