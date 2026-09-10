"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  src: string;
  label: string;
  alt: string;
  desc: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: "/images/boot-detail.jpg",
    label: "Boot Detail",
    alt: "Before and after vehicle boot detailing",
    desc: "A thorough boot-area clean bringing back a fresh, finished appearance.",
  },
  {
    src: "/images/mirror-detail.jpg",
    label: "Clean Finishing",
    alt: "Before and after vehicle finishing",
    desc: "Refinement focused on restoring gloss, clarity, and depth.",
  },
  {
    src: "/images/door-detail.jpg",
    label: "Door & Trim",
    alt: "Before and after vehicle door and trim detailing",
    desc: "Detailed panels, trim, handles, and hard-to-reach areas for a cleaner finish.",
  },
  {
    src: "/images/side-detail.jpg",
    label: "Interior Detail",
    alt: "Before and after interior vehicle detailing",
    desc: "A complete interior transformation finished with a clean, glossy appearance.",
  },
  {
    src: "/images/up-roof.jpg",
    label: "Roof Detail",
    alt: "Before and after vehicle roof detailing",
    desc: "Careful surface cleaning and finishing to bring back a cleaner, brighter roof.",
  },
];

const MARQUEE_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

export function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  /* Lightbox keyboard navigation */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      }

      if (e.key === "ArrowLeft") {
        setLightboxIndex(
          (i) => (i! - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length,
        );
      }

      if (e.key === "ArrowRight") {
        setLightboxIndex(
          (i) => (i! + 1) % GALLERY_ITEMS.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex]);

  return (
    <section
      id="gallery"
      className="relative overflow-hidden border-y border-border bg-ink text-foreground select-none"
    >
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-foreground/5 blur-[140px]" />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 lg:px-8 lg:pb-12 lg:pt-28">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Visual Journey</p>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
              The Crescent Finish
            </h2>
          </div>

          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hover to Pause · Click to Enlarge
          </p>
        </div>
      </div>

      {/* Infinite Marquee */}
      <div
        className="relative w-full overflow-hidden pb-20 lg:pb-28"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left Edge Vignette */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-ink via-ink/80 to-transparent md:w-36" />

        {/* Right Edge Vignette */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-ink via-ink/80 to-transparent md:w-36" />

        {/* Sliding Track */}
        <motion.div
          className="flex w-max gap-6"
          animate={isPaused ? false : { x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {MARQUEE_ITEMS.map((item, i) => {
            const realIndex = i % GALLERY_ITEMS.length;

            const frameLabel = `Frame #${(realIndex + 1)
              .toString()
              .padStart(2, "0")}`;

            return (
              <article
                key={`${item.src}-${i}`}
                onClick={() => setLightboxIndex(realIndex)}
                className="group w-[320px] flex-shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border bg-card shadow-2xl transition-all duration-500 hover:border-primary/60 sm:w-[380px]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full select-none object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />

                  {/* Subtle Hover Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Expand Badge */}
                  <div className="absolute right-3 top-3 flex size-9 scale-90 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <span className="text-sm text-primary">↗</span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="border-t border-border/70 bg-card px-5 py-4">
                  <span className="block font-display text-[10px] uppercase tracking-[0.2em] text-primary">
                    {frameLabel} · {item.label}
                  </span>

                  <p className="mt-1 font-display text-base font-semibold uppercase text-foreground">
                    {item.alt}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 backdrop-blur-xl"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close */}
            <button
              type="button"
              className="absolute right-6 top-6 z-10 p-3 font-display text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close modal"
            >
              ✕ Close
            </button>

            {/* Previous */}
            <button
              type="button"
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-ink/80 text-xl text-foreground transition-colors hover:border-primary md:left-8"
              onClick={(e) => {
                e.stopPropagation();

                setLightboxIndex(
                  (i) =>
                    (i! - 1 + GALLERY_ITEMS.length) %
                    GALLERY_ITEMS.length,
                );
              }}
              aria-label="Previous image"
            >
              ←
            </button>

            {/* Main Image + Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Full Collage */}
                <div className="overflow-hidden rounded-sm border border-border bg-black p-1 shadow-2xl">
                  <img
                    src={GALLERY_ITEMS[lightboxIndex].src}
                    alt={GALLERY_ITEMS[lightboxIndex].alt}
                    draggable={false}
                    className="max-h-[72vh] max-w-[88vw] select-none rounded-xs object-contain"
                  />
                </div>

                {/* Details */}
                <div className="mt-5 max-w-xl text-center">
                  <span className="mb-1 block font-display text-[10px] uppercase tracking-widest text-primary">
                    {GALLERY_ITEMS[lightboxIndex].label} · Frame{" "}
                    {lightboxIndex + 1} of {GALLERY_ITEMS.length}
                  </span>

                  <p className="font-display text-lg font-medium uppercase text-foreground">
                    {GALLERY_ITEMS[lightboxIndex].alt}
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {GALLERY_ITEMS[lightboxIndex].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next */}
            <button
              type="button"
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-ink/80 text-xl text-foreground transition-colors hover:border-primary md:right-8"
              onClick={(e) => {
                e.stopPropagation();

                setLightboxIndex(
                  (i) => (i! + 1) % GALLERY_ITEMS.length,
                );
              }}
              aria-label="Next image"
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}