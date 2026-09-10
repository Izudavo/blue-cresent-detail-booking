"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface SplashScreenProps {
  onFinish?: () => void;
  minimumDurationMs?: number;
}

export function SplashScreen({
  onFinish,
  minimumDurationMs = 2800,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const crescents = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 16 + 12,
      duration: Math.random() * 3 + 2.5,
      delay: Math.random() * 1.5,
      rotate: Math.random() * 360,
      opacity: Math.random() * 0.35 + 0.15,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, minimumDurationMs);

    return () => clearTimeout(timer);
  }, [minimumDurationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: "easeInOut",
            },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#070c18] select-none"
        >
          {/* Falling Crescent Particles */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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
                className="text-primary drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
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

          {/* Animated Water / Foam Wave */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] rounded-[40%] bg-gradient-to-br from-primary/30 via-sky-500/10 to-transparent blur-3xl"
            />
          </div>

          {/* Central Branding */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.7,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className="relative mb-6"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 p-1 shadow-2xl shadow-primary/30 sm:h-28 sm:w-28">
                <Image
                  src="/blue-crescent-logo.jpg"
                  alt="Blue Crescent Logo"
                  fill
                  sizes="112px"
                  priority
                  className="rounded-full object-cover"
                />

                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{
                    y: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatDelay: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-sky-400/30 to-white/40 backdrop-blur-[1px]"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
              className="font-display text-2xl font-extrabold tracking-tight uppercase text-white sm:text-3xl"
            >
              Blue Crescent
            </motion.h1>

            <motion.p
              initial={{
                y: 15,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.6,
                delay: 0.5,
              }}
              className="mt-1 font-display text-xs font-semibold tracking-[0.25em] uppercase text-sky-400"
            >
              Auto Detailing
            </motion.p>

            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{
                    duration: minimumDurationMs / 1000 - 0.2,
                    ease: "easeInOut",
                  }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-primary"
                />
              </div>

              <motion.span
                animate={{
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
                className="text-[10px] font-medium tracking-widest uppercase text-slate-400"
              >
                Initializing Precision Wash...
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
