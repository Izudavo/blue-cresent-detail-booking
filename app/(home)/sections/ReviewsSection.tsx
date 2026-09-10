"use client";

import { motion, type Variants } from "framer-motion";
import { REVIEWS } from "@/app/components/data/content";

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

// Review card entrance animation
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

// Gold Star Component
function GoldStars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <svg
          key={index}
          className="h-4 w-4 fill-amber-400 text-amber-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      {/* Header Block */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={headerVariants}
      >
        <p className="eyebrow">Customer Feedback</p>

        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
          Reviews
        </h2>

        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          See what our clients have to say about their auto detailing
          experiences with Blue Crescent.
        </p>
      </motion.div>

      {/* Reviews Grid */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-12 grid gap-6 sm:grid-cols-3"
      >
        {REVIEWS.map((r, i) => {
          const reviewValue: unknown = r;
          const reviewRecord =
            typeof reviewValue === "object" && reviewValue !== null
              ? (reviewValue as Record<string, unknown>)
              : null;

          const reviewText = reviewRecord
            ? "text" in reviewRecord
              ? String(reviewRecord.text)
              : "review" in reviewRecord
                ? String(reviewRecord.review)
                : ""
            : String(reviewValue);

          const rating =
            reviewRecord && typeof reviewRecord.rating === "number"
              ? reviewRecord.rating
              : 5;

          const key = reviewRecord
            ? reviewRecord.id
              ? String(reviewRecord.id)
              : i
            : `${String(reviewValue).substring(0, 15)}-${i}`;

          return (
            <motion.blockquote
              key={key}
              variants={cardVariants}
              whileHover={{
                y: -4,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              className="flex flex-col justify-between border border-border bg-card p-7 transition-colors duration-200 hover:border-primary/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <GoldStars count={rating} />

                  <span className="font-display text-xs uppercase tracking-[0.2em] text-primary">
                    Verified
                  </span>
                </div>

                <p className="mt-4 text-muted-foreground">
                  “{reviewText}”
                </p>
              </div>
            </motion.blockquote>
          );
        })}
      </motion.div>
    </section>
  );
}