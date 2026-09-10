"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export function FallingCrescents() {
  const crescents = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 18 + 14,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 8,
      rotate: Math.random() * 360,
      opacity: Math.random() * 0.25 + 0.2,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      {/* Ambient radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#0284c70d,transparent_70%)]" />

      {crescents.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            y: "-10vh",
            opacity: 0,
            rotate: item.rotate,
          }}
          animate={{
            y: "110vh",
            opacity: [0, item.opacity, item.opacity, 0],
            rotate: item.rotate + 180,
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            width: item.size,
            height: item.size,
          }}
          className="text-primary drop-shadow-[0_0_4px_rgba(56,189,248,0.3)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-full w-full"
          >
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-5.4-5.4c0-1.81 .89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}