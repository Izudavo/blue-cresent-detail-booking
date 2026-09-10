"use server";

import { create_vehicle_image_upload_url } from "./s3.service";

const MAX_VEHICLE_IMAGES = 5;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function create_vehicle_image_upload_urls(
  content_types: string[],
) {
  if (!Array.isArray(content_types)) {
    throw new Error("Invalid image content types.");
  }

  if (content_types.length === 0) {
    throw new Error("At least one image is required.");
  }

  if (content_types.length > MAX_VEHICLE_IMAGES) {
    throw new Error(
      `A maximum of ${MAX_VEHICLE_IMAGES} vehicle images is allowed.`,
    );
  }

  const normalized_content_types = content_types.map((content_type) =>
    content_type.trim().toLowerCase(),
  );

  for (const content_type of normalized_content_types) {
    if (!ALLOWED_CONTENT_TYPES.has(content_type)) {
      throw new Error("Vehicle images must be JPEG, PNG, or WebP.");
    }
  }

  const uploads = await Promise.all(
    normalized_content_types.map(create_vehicle_image_upload_url),
  );

  return {
    uploads,
  };
}
