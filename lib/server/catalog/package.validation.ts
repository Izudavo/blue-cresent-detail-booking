import type { PackageItem } from "@/types/catalog";

const MAX_SLUG_LENGTH = 100;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ESTIMATED_TIME_LENGTH = 100;
const MAX_BADGE_LENGTH = 50;

export interface CreatePackageInput {
  slug: string;
  name: string;
  description: string;
  estimated_time: string;
  duration_minutes: number;
  featured?: boolean;
  badge?: string;
  starting_price?: number;
  prices?: {
    label: "Cars" | "SUVs/Trucks";
    price: number;
  }[];
}

export function validate_package_input(package_data: PackageItem): PackageItem {
  if (!package_data.id.trim()) {
    throw new Error("Package ID is required.");
  }

  if (!package_data.name.trim()) {
    throw new Error("Package name is required.");
  }

  if (package_data.name.trim().length > MAX_NAME_LENGTH) {
    throw new Error("Package name is too long.");
  }

  if (!package_data.description.trim()) {
    throw new Error("Package description is required.");
  }

  if (package_data.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    throw new Error("Package description is too long.");
  }

  if (!package_data.estimatedTime.trim()) {
    throw new Error("Estimated duration is required.");
  }

  if (package_data.estimatedTime.trim().length > MAX_ESTIMATED_TIME_LENGTH) {
    throw new Error("Estimated duration is too long.");
  }

  if (
    !Number.isInteger(package_data.durationMinutes) ||
    package_data.durationMinutes <= 0
  ) {
    throw new Error("Duration must be a positive whole number.");
  }

  if (package_data.prices) {
    if (package_data.prices.length === 0) {
      throw new Error("At least one vehicle price is required.");
    }

    for (const price of package_data.prices) {
      if (!Number.isFinite(price.price) || price.price <= 0) {
        throw new Error(`Invalid price for ${price.label}.`);
      }
    }
  } else {
    if (
      package_data.startingPrice === undefined ||
      !Number.isFinite(package_data.startingPrice) ||
      package_data.startingPrice <= 0
    ) {
      throw new Error("A valid starting price is required.");
    }
  }

  return {
    ...package_data,
    name: package_data.name.trim(),
    description: package_data.description.trim(),
    estimatedTime: package_data.estimatedTime.trim(),
  };
}

export function validate_create_package_input(
  package_data: CreatePackageInput,
): CreatePackageInput {
  const slug = package_data.slug.trim().toLowerCase();
  const name = package_data.name.trim();
  const description = package_data.description.trim();
  const estimated_time = package_data.estimated_time.trim();

  if (!slug) {
    throw new Error("Package slug is required.");
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    throw new Error("Package slug is too long.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "Package slug can only contain lowercase letters, numbers, and hyphens.",
    );
  }

  if (!name) {
    throw new Error("Package name is required.");
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error("Package name is too long.");
  }

  if (!description) {
    throw new Error("Package description is required.");
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error("Package description is too long.");
  }

  if (!estimated_time) {
    throw new Error("Estimated duration is required.");
  }

  if (estimated_time.length > MAX_ESTIMATED_TIME_LENGTH) {
    throw new Error("Estimated duration is too long.");
  }

  if (
    !Number.isInteger(package_data.duration_minutes) ||
    package_data.duration_minutes <= 0
  ) {
    throw new Error("Duration must be a positive whole number.");
  }

  if (package_data.prices) {
    if (package_data.prices.length === 0) {
      throw new Error("At least one vehicle price is required.");
    }

    for (const price of package_data.prices) {
      if (!Number.isFinite(price.price) || price.price <= 0) {
        throw new Error(`Invalid price for ${price.label}.`);
      }
    }
  } else if (
    package_data.starting_price === undefined ||
    !Number.isFinite(package_data.starting_price) ||
    package_data.starting_price <= 0
  ) {
    throw new Error("A valid starting price is required.");
  }

  if (
    package_data.badge !== undefined &&
    package_data.badge.trim().length > MAX_BADGE_LENGTH
  ) {
    throw new Error("Package badge is too long.");
  }

  return {
    ...package_data,
    slug,
    name,
    description,
    estimated_time,
    badge: package_data.badge?.trim() || undefined,
  };
}

export function validate_delete_package_input(package_id: string): string {
  const id = package_id.trim();

  if (!id) {
    throw new Error("Package ID is required.");
  }

  return id;
}
