import { Suspense } from "react";

import { HeroSection } from "@/app/(home)/sections/HeroSection";
import { AboutSection } from "@/app/(home)/sections/AboutSection";
import { ServicesSection } from "@/app/(home)/sections/ServicesSection";
import { GallerySection } from "@/app/(home)/sections/GallerySection";
import { ReviewsSection } from "@/app/(home)/sections/ReviewsSection";
import { LocationSection } from "@/app/(home)/sections/LocationSection";

import { HomePackages } from "@/app/(home)/sections/HomePackages";
import { PackagesSectionSkeleton } from "@/app/(home)/sections/PackagesSectionSkeleton";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <Suspense fallback={<PackagesSectionSkeleton />}>
        <HomePackages />
      </Suspense>
      <GallerySection />
      <ReviewsSection />
      <LocationSection />
    </>
  );
}
