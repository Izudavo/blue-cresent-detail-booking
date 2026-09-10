"use server";

import { get_current_admin } from "@/lib/server/auth/auth.session";

import {
  create_availability_override as create_availability_override_service,
  delete_availability_override as delete_availability_override_service,
  update_availability_override as update_availability_override_service,
  update_business_hours as update_business_hours_service,
} from "@/lib/server/availability/availability.service";

import {
  validate_availability_override_input,
  validate_business_hours_input,
  type AvailabilityOverrideInput,
  type BusinessHoursInput,
} from "@/lib/server/availability/availability.validation";

async function require_admin() {
  const admin = await get_current_admin();

  if (!admin) {
    throw new Error("Unauthorized.");
  }

  return admin;
}

export async function update_business_hours(
  business_hours: BusinessHoursInput[],
) {
  await require_admin();

  if (business_hours.length !== 7) {
    throw new Error("Business hours must contain all seven days.");
  }

  const validated_business_hours = business_hours.map(
    validate_business_hours_input,
  );

  await update_business_hours_service(validated_business_hours);

  return {
    success: true,
  };
}

export async function create_availability_override(
  override: AvailabilityOverrideInput,
) {
  await require_admin();

  const validated_override = validate_availability_override_input(override);

  await create_availability_override_service(validated_override);

  return {
    success: true,
  };
}

export async function update_availability_override(
  id: string,
  override: AvailabilityOverrideInput,
) {
  await require_admin();

  if (!id.trim()) {
    throw new Error("Availability override ID is required.");
  }

  const validated_override = validate_availability_override_input(override);

  await update_availability_override_service(id.trim(), validated_override);

  return {
    success: true,
  };
}

export async function delete_availability_override(id: string) {
  await require_admin();

  if (!id.trim()) {
    throw new Error("Availability override ID is required.");
  }

  await delete_availability_override_service(id.trim());

  return {
    success: true,
  };
}
