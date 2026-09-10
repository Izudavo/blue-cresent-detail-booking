"use client";

import { useState } from "react";
import { PackageCard } from "@/app/packages/sections/PackageCard";
import { AddOnsList } from "@/app/packages/sections/AddOnsList";
import { BookingDrawer } from "@/app/packages/sections/BookingDrawer";
import type { AddOnItem, PackageItem } from "@/types/catalog";

interface PackagesClientProps {
  packages: PackageItem[];
  addOns: AddOnItem[];
}

export function PackagesClient({
  packages,
  addOns,
}: PackagesClientProps) {
  const [selectedPackage, setSelectedPackage] =
    useState<PackageItem | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            packageData={pkg}
            onSelect={handleSelectPackage}
          />
        ))}
      </div>

      <AddOnsList addOns={addOns} />

      <BookingDrawer
        isOpen={isDrawerOpen}
        selectedPackage={selectedPackage}
        addOns={addOns}
        onClose={handleCloseDrawer}
      />
    </>
  );
}