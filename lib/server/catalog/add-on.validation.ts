import type { AddOnItem } from "@/types/catalog";

const MAX_SLUG_LENGTH = 100;
const MAX_NAME_LENGTH = 100;

export interface CreateAddOnInput {
  slug: string;
  name: string;
  price: number;
  additional_minutes?: number;
}

export function validate_add_on_input(add_on: AddOnItem): AddOnItem {
  const id = add_on.id.trim();
  const name = add_on.name.trim();

  if (!id) {
    throw new Error("Add-on ID is required.");
  }

  if (id.length > MAX_SLUG_LENGTH) {
    throw new Error("Add-on ID is too long.");
  }

  if (!name) {
    throw new Error("Add-on name is required.");
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error("Add-on name is too long.");
  }

  if (!Number.isFinite(add_on.price) || add_on.price <= 0) {
    throw new Error("Add-on price must be greater than zero.");
  }

  if (
    add_on.additionalMinutes !== undefined &&
    (!Number.isInteger(add_on.additionalMinutes) ||
      add_on.additionalMinutes < 0)
  ) {
    throw new Error(
      "Additional minutes must be a whole number of zero or greater.",
    );
  }

  return {
    ...add_on,
    id,
    name,
    displayPrice: `$${add_on.price.toFixed(0)}+`,
  };
}

export function validate_create_add_on_input(
  add_on: CreateAddOnInput,
): CreateAddOnInput {
  const slug = add_on.slug.trim().toLowerCase();
  const name = add_on.name.trim();

  if (!slug) {
    throw new Error("Add-on slug is required.");
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    throw new Error("Add-on slug is too long.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "Add-on slug can only contain lowercase letters, numbers, and hyphens.",
    );
  }

  if (!name) {
    throw new Error("Add-on name is required.");
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error("Add-on name is too long.");
  }

  if (!Number.isFinite(add_on.price) || add_on.price <= 0) {
    throw new Error("Add-on price must be greater than zero.");
  }

  if (
    add_on.additional_minutes !== undefined &&
    (!Number.isInteger(add_on.additional_minutes) ||
      add_on.additional_minutes < 0)
  ) {
    throw new Error(
      "Additional minutes must be a whole number of zero or greater.",
    );
  }

  return {
    ...add_on,
    slug,
    name,
  };
}

export function validate_delete_add_on_input(add_on_id: string): string {
  const id = add_on_id.trim();

  if (!id) {
    throw new Error("Add-on ID is required.");
  }

  return id;
}
