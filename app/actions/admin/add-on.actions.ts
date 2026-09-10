"use server";

import type { AddOnItem } from "@/types/catalog";

import {
  create_add_on as create_add_on_service,
  delete_add_on as delete_add_on_service,
  update_add_on as update_add_on_service,
} from "@/lib/server/catalog/add-on.service";

import {
  validate_add_on_input,
  validate_create_add_on_input,
  validate_delete_add_on_input,
} from "@/lib/server/catalog/add-on.validation";

export async function create_add_on(
  add_on_data: Parameters<typeof validate_create_add_on_input>[0],
) {
  const validated_add_on = validate_create_add_on_input(add_on_data);

  await create_add_on_service(validated_add_on);

  return {
    success: true,
  };
}

export async function update_add_on(add_on_data: AddOnItem) {
  const validated_add_on = validate_add_on_input(add_on_data);

  await update_add_on_service(validated_add_on);

  return {
    success: true,
  };
}

export async function delete_add_on(add_on_id: string) {
  const validated_add_on_id = validate_delete_add_on_input(add_on_id);

  await delete_add_on_service(validated_add_on_id);

  return {
    success: true,
  };
}
