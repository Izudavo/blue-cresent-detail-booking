import type { AddOnItem, PackageItem, PriceTier } from "@/types/catalog";

import { InclusionGroup, VehicleType } from "@prisma/client";

type ServicePackageWithRelations = Awaited<
  ReturnType<typeof import("./catalog.service").get_active_packages>
>[number];

type AddOnRecord = Awaited<
  ReturnType<typeof import("./catalog.service").get_active_add_ons>
>[number];

function format_price(price: number): string {
  return `$${price.toFixed(0)}+`;
}

function map_vehicle_type(vehicle_type: VehicleType): PriceTier["label"] {
  switch (vehicle_type) {
    case VehicleType.CARS:
      return "Cars";

    case VehicleType.SUVS_TRUCKS:
      return "SUVs/Trucks";
  }
}

export function map_package(
  service_package: ServicePackageWithRelations,
): PackageItem {
  const prices = service_package.prices.map((price) => ({
    label: map_vehicle_type(price.vehicle_type),
    price: Number(price.price),
    displayPrice: format_price(Number(price.price)),
  }));

  const general_items = service_package.inclusions
    .filter((inclusion) => inclusion.group === InclusionGroup.GENERAL)
    .map((inclusion) => inclusion.name);

  const exterior_items = service_package.inclusions
    .filter((inclusion) => inclusion.group === InclusionGroup.EXTERIOR)
    .map((inclusion) => inclusion.name);

  const interior_items = service_package.inclusions
    .filter((inclusion) => inclusion.group === InclusionGroup.INTERIOR)
    .map((inclusion) => inclusion.name);

  const package_item: PackageItem = {
    /*
     * Use the actual database ID.
     *
     * The booking backend expects this value
     * as service_package_id.
     */
    id: service_package.id,

    name: service_package.name,
    description: service_package.description,
    estimatedTime: service_package.estimated_time,
    durationMinutes: service_package.duration_minutes,
    items: general_items,
  };

  if (service_package.badge) {
    package_item.badge = service_package.badge;
  }

  if (service_package.featured) {
    package_item.featured = true;
  }

  if (prices.length === 1) {
    package_item.startingPrice = prices[0].price;

    package_item.displayStartingPrice = prices[0].displayPrice;
  } else if (prices.length > 1) {
    package_item.prices = prices;
  }

  if (exterior_items.length > 0) {
    package_item.exteriorItems = exterior_items;
  }

  if (interior_items.length > 0) {
    package_item.interiorItems = interior_items;
  }

  return package_item;
}

export function map_add_on(add_on: AddOnRecord): AddOnItem {
  const price = Number(add_on.price);

  return {
    /*
     * Use the actual database ID.
     *
     * The booking backend expects these values
     * as add_on_ids.
     */
    id: add_on.id,

    name: add_on.name,
    price,
    displayPrice: format_price(price),

    ...(add_on.additional_minutes !== null
      ? {
          additionalMinutes: add_on.additional_minutes,
        }
      : {}),
  };
}
