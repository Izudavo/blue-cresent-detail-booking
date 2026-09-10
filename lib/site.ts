export const BOOKING_URL = "/packages";
export const PHONE = "423-413-7437";

export const PHONE_HREF = `tel:${PHONE.replace(/\D/g, "")}`;

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Packages", href: "#packages" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Location", href: "#location" },
];

export const img = {
  logo: "/blue-crescent-logo.jpg",
};

export const AREAS = [
  "Duncan",
  "Spartanburg",
  "Greer",
  "Greenville",
  "Lyman",
  "Clemson",
  "Pickens",
  "Easley",
  "Anderson",
  "Simpsonville",
];