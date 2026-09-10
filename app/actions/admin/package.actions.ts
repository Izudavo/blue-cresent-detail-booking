"use server";

import type { PackageItem } from "@/types/catalog";

import {
  create_package as create_package_service,
  delete_package as delete_package_service,
  update_package as update_package_service,
} from "@/lib/server/catalog/package.service";

import {
  validate_create_package_input,
  validate_delete_package_input,
  validate_package_input,
} from "@/lib/server/catalog/package.validation";

export async function create_package(
  package_data: Parameters<typeof validate_create_package_input>[0],
) {
  const validated_package = validate_create_package_input(package_data);

  await create_package_service(validated_package);

  return {
    success: true,
  };
}

export async function update_package(package_data: PackageItem) {
  const validated_package = validate_package_input(package_data);

  await update_package_service(validated_package);

  return {
    success: true,
  };
}

export async function delete_package(package_id: string) {
  const validated_package_id = validate_delete_package_input(package_id);

  await delete_package_service(validated_package_id);

  return {
    success: true,
  };
}
