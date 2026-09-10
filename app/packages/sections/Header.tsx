import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ink/80 backdrop-blur-md">
      {/* Booking Requirements Notice */}
      <div className="bg-primary px-4 py-2.5 text-center text-xs font-semibold leading-relaxed text-white sm:text-sm">
        <p>
          Please be sure to have an outside outlet and a hose connector to
          supply water before booking.
        </p>

        <p className="mt-0.5 font-medium text-white/90">
          Appointments are subject to change in the event of severe weather.
        </p>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-primary"
        >
          <span className="text-base transition-transform group-hover:-translate-x-1">
            ←
          </span>
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src="/blue-crescent-logo.jpg"
              alt="Blue Crescent Auto Detailing Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <span className="block font-bold leading-tight text-white">
              Blue Crescent
            </span>

            <span className="block text-xs font-medium text-muted-foreground">
              Auto Detailing • Duncan, SC
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}