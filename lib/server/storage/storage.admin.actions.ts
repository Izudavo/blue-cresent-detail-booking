"use server";

import { get_current_admin } from "@/lib/server/auth/auth.session";

import { create_vehicle_image_view_url } from "./s3.service";

async function require_admin() {
  const admin = await get_current_admin();

  if (!admin) {
    throw new Error("Unauthorized.");
  }

  return admin;
}

export async function get_vehicle_image_view_url(
  storage_key: string,
) {
  await require_admin();

  const normalized_storage_key = storage_key.trim();

  if (!normalized_storage_key) {
    throw new Error("Vehicle image storage key is required.");
  }

  return create_vehicle_image_view_url(
    normalized_storage_key,
  );
}

