"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SERVICES } from "@/app/components/data/content";

// Header reveal animation
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

// Container to manage staggered grid card entrances
const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Card item animation
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export function ServicesSection() {
  return (
    <section id="services" className="border-y border-border bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        {/* Header Block */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
        >
          <p className="eyebrow">Services</p>

          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl lg:text-5xl">
            Car Detailing Built Around Your Vehicle
          </h2>
        </motion.div>

        {/* Services Grid with Staggered Cards */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3"
        >
          {SERVICES.map((s, i) => (
            <motion.article
              key={s.title}
              variants={cardVariants}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
              className="bg-background p-8 transition-colors duration-200 hover:bg-ink"
            >
              <span className="font-display text-sm tracking-[0.24em] text-primary">
                0{i + 1}
              </span>

              <h3 className="mt-4 text-2xl">{s.title}</h3>

              <p className="mt-3 text-sm text-muted-foreground">
                {s.copy}
              </p>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/packages"
            className="btn-base btn-primary mt-10"
          >
            Request a Quote
          </Link>
        </motion.div>
      </div>
    </section>
  );
}