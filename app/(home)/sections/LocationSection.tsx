"use client";

import { motion, type Variants } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import { AREAS } from "@/lib/site";

// Header & Text Column Animation
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

// Map Container Animation
const mapVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.15,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export function LocationSection() {
  const googleMyMapUrl =
    "https://www.google.com/maps/d/viewer?mid=1CBxomd2wrToRA7n18aj9FYfHwLozTEQ";

  return (
    <section
      id="location"
      className="relative overflow-hidden border-y border-border bg-ink text-foreground select-none"
    >
      {/* Background Ambient Light Glow */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        {/* Left Column: Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={contentVariants}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-primary" />
            <p className="eyebrow">Proudly Serving</p>
          </div>

          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Duncan, SC &amp; The Upstate
          </h2>

          {/* Location Pills Badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/40 px-3 py-1 font-display text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:text-foreground"
              >
                <MapPin className="size-3 text-primary" />
                {area}
              </span>
            ))}
          </div>

          <div className="hairline my-8 max-w-24 border-t border-border" />

          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Looking for auto detailing in Duncan, SC or nearby Upstate areas?
            Blue Crescent serves drivers across Spartanburg, Greer, Greenville,
            Clemson, Pickens, Easley, Anderson, and surrounding communities with
            premium interior, exterior, and complete vehicle protection services.
          </p>

          {/* Mobile Detailing Highlight Card */}
          <address className="mt-8 border-l-2 border-primary pl-4 not-italic">
            <span className="block font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
              We Come To You!
            </span>
          </address>

          {/* External Map Trigger CTA */}
          <a
            href={googleMyMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
          >
            View Full Service Map in Google Maps
            <ExternalLink className="size-3.5" />
          </a>
        </motion.div>

        {/* Right Column: Embedded Custom Multi-Pin Map */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={mapVariants}
        >
          <a
            href={googleMyMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Upstate Service Area Map in Google Maps"
            className="group relative block overflow-hidden rounded-sm border border-border bg-card/20 p-1.5 shadow-2xl transition-all duration-500 hover:border-primary/60 hover:shadow-primary/10"
          >
            <div className="relative h-80 w-full overflow-hidden rounded-xs border border-border/50 lg:h-[420px]">
              <iframe
                title="Map of Upstate SC service areas"
                src="https://www.google.com/maps/d/embed?mid=1CBxomd2wrToRA7n18aj9FYfHwLozTEQ&ehbc=2E312F&noprof=1"
                loading="lazy"
                className="pointer-events-none h-full w-full border-0"
              />

              {/* Ambient Corner Badge Overlay */}
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xs border border-border bg-ink/90 px-3 py-1.5 shadow-md backdrop-blur-md transition-colors group-hover:border-primary/50">
                <MapPin className="size-3.5 text-primary" />
                <span className="font-display text-[10px] uppercase tracking-widest text-foreground">
                  Upstate Service Areas
                </span>
              </div>

              {/* Hover Indicator Prompt Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-ink/90 px-4 py-2 font-display text-xs uppercase tracking-widest text-white shadow-xl">
                  Open Interactive Map
                  <ExternalLink className="size-3.5 text-primary" />
                </span>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}