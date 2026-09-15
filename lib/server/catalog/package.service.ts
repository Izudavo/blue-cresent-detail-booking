import { prisma } from "@/lib/prisma";

import type { CreatePackageInput } from "./package.validation";

import type { PackageItem } from "@/types/catalog";

export async function create_package(package_data: CreatePackageInput) {
  return prisma.$transaction(async (tx) => {
    const existing_package = await tx.servicePackage.findUnique({
      where: {
        slug: package_data.slug,
      },
    });

    if (existing_package) {
      throw new Error("A package with this slug already exists.");
    }

    const highest_sort_order = await tx.servicePackage.aggregate({
      _max: {
        sort_order: true,
      },
    });

    const next_sort_order = (highest_sort_order._max.sort_order ?? -1) + 1;

    const prices = package_data.prices
      ? package_data.prices.map((price) => ({
          vehicle_type:
            price.label === "Cars"
              ? ("CARS" as const)
              : ("SUVS_TRUCKS" as const),
          price: price.price,
        }))
      : [
          {
            vehicle_type: "CARS" as const,
            price: package_data.starting_price!,
          },
        ];

    const created_package = await tx.servicePackage.create({
      data: {
        slug: package_data.slug,
        name: package_data.name,
        badge: package_data.badge ?? null,
        description: package_data.description,
        estimated_time: package_data.estimated_time,
        duration_minutes: package_data.duration_minutes,
        featured: package_data.featured ?? false,
        is_active: true,
        sort_order: next_sort_order,

        prices: {
          create: prices,
        },
      },

      include: {
        prices: {
          orderBy: {
            vehicle_type: "asc",
          },
        },
        inclusions: {
          orderBy: {
            sort_order: "asc",
          },
        },
      },
    });

    return created_package;
  });
}

export async function update_package(package_data: PackageItem) {
  return prisma.$transaction(async (tx) => {
    const existing_package = await tx.servicePackage.findUnique({
      where: {
        id: package_data.id,
      },
    });

    if (!existing_package) {
      throw new Error("Package not found.");
    }

    const updated_package = await tx.servicePackage.update({
      where: {
        id: existing_package.id,
      },
      data: {
        name: package_data.name,
        description: package_data.description,
        estimated_time: package_data.estimatedTime,
        duration_minutes: package_data.durationMinutes,
        featured: package_data.featured ?? false,
      },
    });

    await tx.packagePrice.deleteMany({
      where: {
        service_package_id: existing_package.id,
      },
    });

    if (package_data.prices) {
      await tx.packagePrice.createMany({
        data: package_data.prices.map((price) => ({
          service_package_id: existing_package.id,
          vehicle_type: price.label === "Cars" ? "CARS" : "SUVS_TRUCKS",
          price: price.price,
        })),
      });
    } else {
      await tx.packagePrice.create({
        data: {
          service_package_id: existing_package.id,
          vehicle_type: "CARS",
          price: package_data.startingPrice!,
        },
      });
    }

    return updated_package;
  });
}

export async function delete_package(package_id: string) {
  return prisma.servicePackage.update({
    where: {
      slug: package_id,
    },
    data: {
      is_active: false,
    },
  });
}
