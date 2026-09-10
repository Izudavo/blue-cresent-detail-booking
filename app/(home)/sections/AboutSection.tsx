"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

// Stagger container for text elements
const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Item animation for text children
const textItemVariants: Variants = {
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

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Animated Image Reveal */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-md lg:max-w-lg"
        >
          <Image
            src="/cali-jessi.png"
            alt="Owner of Blue Crescent Auto Detailing"
            width={1180}
            height={1333}
            loading="lazy"
            className="h-auto max-h-[420px] w-full rounded-lg border border-border bg-muted/30 p-4 object-contain object-center sm:p-5 lg:max-h-[480px]"
          />
        </motion.div>

        {/* Animated Text Container */}
        <motion.div
          variants={textContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={textItemVariants} className="eyebrow">
            About Blue Crescent Auto Detailing
          </motion.p>

          <motion.h2
            variants={textItemVariants}
            className="mt-4 font-medium tracking-tight"
          >
            <span className="block text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
              At Blue Crescent Auto Detailing,
            </span>

            <span className="mt-2 block text-xl font-normal text-muted-foreground sm:text-2xl lg:text-3xl">
              I believe every vehicle deserves to look its best.
            </span>
          </motion.h2>

          <motion.div
            variants={textItemVariants}
            className="hairline my-6 max-w-24"
          />

          <motion.p
            variants={textItemVariants}
            className="leading-relaxed text-muted-foreground"
          >
            With a passion for cars and an eye for detail, I provide quality
            detailing that brings back the clean, polished finish you love.
          </motion.p>

          <motion.p
            variants={textItemVariants}
            className="mt-4 leading-relaxed text-muted-foreground"
          >
            Whether your vehicle needs a quick refresh or a full transformation,
            I take pride in treating every car like it’s my own and making sure
            the little details never get overlooked.
          </motion.p>

          <motion.p
            variants={textItemVariants}
            className="mt-8 border-l-2 border-primary pl-5 font-display text-lg italic text-foreground/90 sm:text-xl"
          >
            “Making cars look it’s best since 2017.”
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}