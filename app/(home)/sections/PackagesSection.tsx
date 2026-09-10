"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { PackageItem } from "@/types/catalog";

interface PackagesSectionProps {
  packages: PackageItem[];
}


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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export function PackagesSection({
  packages,
}: PackagesSectionProps) {
  const featuredPackages = packages.filter((p) =>
    ["Express Detail", "Full Phase Detail", "New Moon Deep Clean"].includes(p.name)
  );

  return (
    <section
      id="packages"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      {/* Header Block */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={headerVariants}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="eyebrow">Packages</p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
            Choose Your Detail
          </h2>
        </div>

        {/* Link to Dedicated Page */}
        <Link href="/packages" className="btn-base btn-outline shrink-0">
          View All Packages & Add-Ons
        </Link>
      </motion.div>

      {/* Preview Cards Grid */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-12 grid gap-6 lg:grid-cols-3"
      >
        {featuredPackages.map((p) => {
          const mainPrice = p.startingPrice || p.prices?.[0]?.price;

          return (
            <motion.article
              key={p.name}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={`flex flex-col border p-8 transition-colors duration-200 ${
                p.featured
                  ? "border-primary bg-card shadow-[var(--shadow-glow)]"
                  : "border-border bg-card/60 hover:border-border/80"
              }`}
            >
              {p.featured && (
                <span className="mb-4 self-start bg-primary px-3 py-1 font-display text-[0.65rem] uppercase tracking-[0.22em] text-primary-foreground">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl">{p.name}</h3>

              <p className="mt-3 font-display text-4xl text-primary">
                {mainPrice}
                <span className="ml-2 align-middle text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Starting at
                </span>
              </p>

              <p className="mt-4 text-sm text-muted-foreground">
                {p.description}
              </p>

              {/* Display top 4 teaser items */}
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {(p.items.length > 0
                  ? p.items
                  : p.exteriorItems || []
                )
                  .slice(0, 4)
                  .map((i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-muted-foreground"
                    >
                      <span aria-hidden className="text-primary">
                        —
                      </span>
                      {i}
                    </li>
                  ))}
              </ul>

              <Link
                href="/packages"
                className={`btn-base mt-8 w-full text-center ${
                  p.featured ? "btn-primary" : "btn-outline"
                }`}
              >
                View Details & Specs
              </Link>
            </motion.article>
          );
        })}
      </motion.div>

      {/* Bottom CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Looking for custom standalone services like Headlight Restoration,
          Clay Bar, or Engine Bay Detailing?
        </p>

        <Link
          href="/packages#add-ons"
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Explore Add-On Treatments &rarr;
        </Link>
      </motion.div>
    </section>
  );
}