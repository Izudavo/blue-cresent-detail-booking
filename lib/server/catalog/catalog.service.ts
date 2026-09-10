import { prisma } from "@/lib/prisma";

import { map_add_on, map_package } from "./catalog.mapper";

export async function get_active_packages() {
  return prisma.servicePackage.findMany({
    where: {
      is_active: true,
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
    orderBy: {
      sort_order: "asc",
    },
  });
}

export async function get_active_add_ons() {
  return prisma.addOn.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      sort_order: "asc",
    },
  });
}

export async function get_catalog() {
  const [packages, add_ons] = await Promise.all([
    get_active_packages(),
    get_active_add_ons(),
  ]);

  return {
    packages: packages.map(map_package),
    addOns: add_ons.map(map_add_on),
  };
}

export async function get_all_packages() {
  return prisma.servicePackage.findMany({
    where: {
      is_active: true,
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
    orderBy: {
      sort_order: "asc",
    },
  });
}

export async function get_admin_catalog() {
  const [packages, add_ons] = await Promise.all([
    get_all_packages(),
    get_active_add_ons(),
  ]);

  return {
    packages: packages.map(map_package),
    addOns: add_ons.map(map_add_on),
  };
}
