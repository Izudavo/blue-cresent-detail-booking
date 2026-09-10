"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  AREAS,
  NAV_LINKS,
  PHONE,
  PHONE_HREF,
  img,
} from "@/lib/site";

const FACEBOOK_URL =
  "https://web.facebook.com/profile.php?id=61593481851899";

const footerVariants: Variants = {
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

const displayBrandingVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-ink pt-14 pb-0 select-none">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={footerVariants}
        className="mx-auto max-w-7xl px-5 lg:px-8"
      >
        {/* Main Grid Wrapper */}
        <div className="grid gap-10 sm:grid-cols-2">
          {/* Brand Info & Serving Areas */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src={img.logo}
                alt="Blue Crescent Auto Detailing logo"
                width={44}
                height={44}
                loading="lazy"
                className="h-11 w-11 rounded-full object-cover"
              />

              <span className="font-display text-lg uppercase tracking-wide text-foreground">
                Blue Crescent Auto Detailing
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Every vehicle deserves a fresh start.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Duncan, SC
            </p>

            <p className="mt-4 font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {AREAS.join(" • ")}
            </p>
          </div>

          {/* Navigation Links & Socials */}
          <nav
            aria-label="Footer Navigation"
            className="sm:justify-self-end"
          >
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Link
                      href={link.href}
                      className="inline-block font-display uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}

              {/* Phone & Social Contact Section */}
              <li className="col-span-2 mt-2 space-y-2.5 border-t border-white/10 pt-3">
                <motion.a
                  href={PHONE_HREF}
                  whileHover={{ x: 3 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="block font-display font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                >
                  Call or text: {PHONE}
                </motion.a>

                {/* Facebook */}
                <motion.a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Blue Crescent Auto Detailing on Facebook"
                  whileHover={{ x: 3 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>

                  <span>Facebook</span>
                </motion.a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Blue Crescent Auto Detailing. All rights reserved.
        </p>
      </motion.div>

      {/* Editorial Display Branding */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        variants={displayBrandingVariants}
        className="mt-6 -mb-[2vw] overflow-hidden select-none text-center"
      >
        <h1 className="whitespace-nowrap font-display text-[12.5vw] font-black uppercase leading-[0.8] tracking-tight text-white opacity-90">
          BLUE CRESCENT
        </h1>
      </motion.div>
    </footer>
  );
}