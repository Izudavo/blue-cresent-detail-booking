export interface NavLink {
  label: string;
  href: string;
  id: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Services", href: "#services", id: "services" },
  { label: "Gallery", href: "#gallery", id: "gallery" },
  { label: "Reviews", href: "#reviews", id: "reviews" },
  { label: "Location", href: "#location", id: "location" },
];