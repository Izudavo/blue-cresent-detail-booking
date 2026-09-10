import type { Metadata } from "next";
import { SplashWrapper } from "@/app/components/SplashWrapper";

import "./globals.css";

export const metadata: Metadata = {
  title: "Blue Crescent Auto Detailing",
  description: "Professional mobile auto detailing services in Duncan, SC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SplashWrapper>{children}</SplashWrapper>
      </body>
    </html>
  );
}