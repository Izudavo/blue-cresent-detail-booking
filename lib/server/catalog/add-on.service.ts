import { prisma } from "@/lib/prisma";

import type { CreateAddOnInput } from "./add-on.validation";

import type { AddOnItem } from "@/types/catalog";

export async function create_add_on(add_on_data: CreateAddOnInput) {
  return prisma.$transaction(async (tx) => {
    const existing_add_on = await tx.addOn.findUnique({
      where: {
        slug: add_on_data.slug,
      },
    });

    if (existing_add_on) {
      throw new Error("An add-on with this slug already exists.");
    }

    const highest_sort_order = await tx.addOn.aggregate({
      _max: {
        sort_order: true,
      },
    });

    const next_sort_order = (highest_sort_order._max.sort_order ?? -1) + 1;

    const created_add_on = await tx.addOn.create({
      data: {
        slug: add_on_data.slug,
        name: add_on_data.name,
        price: add_on_data.price,
        additional_minutes: add_on_data.additional_minutes ?? null,
        is_active: true,
        sort_order: next_sort_order,
      },
    });

    return created_add_on;
  });
}

export async function update_add_on(add_on_data: AddOnItem) {
  return prisma.$transaction(async (tx) => {
    /*
     * The editor provides the database record ID,
     * so the existing add-on must be looked up by id.
     */
    const existing_add_on = await tx.addOn.findUnique({
      where: {
        id: add_on_data.id,
      },
    });

    if (!existing_add_on) {
      throw new Error("Add-on not found.");
    }

    const updated_add_on = await tx.addOn.update({
      where: {
        id: existing_add_on.id,
      },
      data: {
        name: add_on_data.name,
        price: add_on_data.price,
        additional_minutes:
          add_on_data.additionalMinutes ?? null,
      },
    });

    return updated_add_on;
  });
}

export async function delete_add_on(add_on_id: string) {
  return prisma.addOn.update({
    where: {
      slug: add_on_id,
    },
    data: {
      is_active: false,
    },
  });
}
