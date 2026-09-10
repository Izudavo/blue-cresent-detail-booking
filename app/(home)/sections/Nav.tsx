"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import {
  BOOKING_URL,
  NAV_LINKS,
  PHONE,
  PHONE_HREF,
  img,
} from "@/lib/site";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll header background contrast
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b1329]/95 shadow-xl backdrop-blur-xl"
            : "bg-[#0b1329]/80 backdrop-blur-md"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        >
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Image
              src={img.logo}
              alt="Blue Crescent Auto Detailing"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-white/20 object-cover"
            />

            <span className="font-display text-base font-bold tracking-tight text-white">
              Blue Crescent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3.5 py-2 text-sm font-medium transition-all ${
                    link.href === "/"
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Phone, CTA & Mobile Trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white md:flex"
            >
              <Phone className="size-3.5 text-primary" />
              <span>{PHONE}</span>
            </a>

            <a
              href={BOOKING_URL}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Book Now
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="size-5" strokeWidth={2} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-[#0b1329]/98 backdrop-blur-xl transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-6 pt-6 pb-10">
          {/* Mobile Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src={img.logo}
                alt="Blue Crescent Auto Detailing"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-white/20 object-cover"
              />

              <span className="font-display text-base font-bold text-white">
                Blue Crescent
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white hover:bg-white/10"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Links */}
          <ul className="mt-10 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-display text-xl font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile CTA */}
          <div className="mt-auto space-y-4 pt-8">
            <a
              href={PHONE_HREF}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Phone className="size-4 text-primary" />
              <span>{PHONE}</span>
            </a>

            <a
              href={BOOKING_URL}
              onClick={() => setOpen(false)}
              className="block rounded-full bg-primary py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Book Your Detail
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

