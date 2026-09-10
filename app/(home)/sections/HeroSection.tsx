"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { AREAS } from "@/lib/site";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function HeroSection() {
  const tickerAreas = [...AREAS, ...AREAS];

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[92vh] items-end overflow-hidden bg-ink"
    >
      {/* Background Image */}
      <motion.img
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        src="/cali-hero-bg.jpg"
        alt="blue cresent detailing"
        width={1920}
        height={1088}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_5%]"
      />

      {/* Lighting */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/65 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-radial-[at_top_right] from-primary/15 via-transparent to-transparent opacity-70" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-7xl px-6 pt-36 pb-16 lg:px-12 lg:pb-24"
      >
        {/* Top Meta */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3"
        >

          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-ink/80 px-3.5 py-1 shadow-inner backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />

            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              A New Phase of Clean
            </span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl/none"
        >
          Every Vehicle Deserves a{" "}
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Fresh Start.
          </span>
        </motion.h1>

        {/* Body */}
        <motion.p
          variants={itemVariants}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground/90 sm:text-lg"
        >
          Precision vehicle care engineered with an obsession for detail.
          Mobile & studio solutions serving Duncan and upstate South Carolina.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/packages"
            className="btn-base btn-primary group relative overflow-hidden px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-300"
          >
            <span>Get a Quote</span>
          </Link>

          <a
            href="#services"
            className="btn-base btn-outline px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:border-foreground/40 hover:text-foreground"
          >
            View Services
          </a>
        </motion.div>

        {/* Service Coverage Ticker */}
        <motion.div
          variants={itemVariants}
          className="mt-14 overflow-hidden border-t border-border/40 pt-5"
        >
          <div className="flex items-center gap-4">
            <div className="z-10 flex shrink-0 items-center gap-2 bg-ink pr-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Service Coverage
            </div>

            <div className="relative min-w-0 flex-1 overflow-hidden">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex w-max items-center gap-4 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/70"
              >
                {tickerAreas.map((area, index) => (
                  <span key={`${area}-${index}`} className="flex items-center gap-4">
                    <span>{area}</span>
                    <span className="text-primary/60">•</span>
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}