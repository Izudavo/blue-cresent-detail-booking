"use client";

import { motion } from "framer-motion";
import { Phone, MessageSquare } from "lucide-react";
import { PHONE, PHONE_HREF } from "@/lib/site";

export function FloatingContactActions() {
  const cleanPhone = PHONE.replace(/\D/g, "");
  const smsHref = `sms:${cleanPhone}`;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        delay: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5"
    >
      {/* Call Button */}
      <motion.a
        href={PHONE_HREF}
        aria-label={`Call ${PHONE}`}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.12,
          transition: {
            duration: 0.2,
          },
        }}
        whileTap={{
          scale: 0.92,
        }}
        className="group relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-colors duration-300 hover:bg-primary/90 hover:shadow-primary/40"
      >
        <Phone className="size-5 transition-transform duration-300 group-hover:rotate-12" />

        <span className="pointer-events-none absolute right-14 translate-x-1 whitespace-nowrap rounded-md border border-border bg-ink px-2.5 py-1 font-display text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          Call {PHONE}
        </span>
      </motion.a>

      {/* Text Button */}
      <motion.a
        href={smsHref}
        aria-label={`Text ${PHONE}`}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 0.4,
        }}
        whileHover={{
          scale: 1.12,
          transition: {
            duration: 0.2,
          },
        }}
        whileTap={{
          scale: 0.92,
        }}
        className="group relative flex size-12 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-xl backdrop-blur-md transition-colors duration-300 hover:border-primary/60 hover:bg-card"
      >
        <MessageSquare className="size-5 text-primary transition-transform duration-300 group-hover:-rotate-12" />

        <span className="pointer-events-none absolute right-14 translate-x-1 whitespace-nowrap rounded-md border border-border bg-ink px-2.5 py-1 font-display text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          Text {PHONE}
        </span>
      </motion.a>
    </motion.div>
  );
}
