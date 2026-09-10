"use server";

import type { VehicleType } from "@prisma/client";

import {
  get_available_booking_times,
  type GetAvailableBookingTimesInput,
} from "./booking.availability";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validate_calendar_date(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  const calendar_date = new Date(Date.UTC(year, month - 1, day));

  if (
    calendar_date.getUTCFullYear() !== year ||
    calendar_date.getUTCMonth() !== month - 1 ||
    calendar_date.getUTCDate() !== day
  ) {
    throw new Error("Invalid appointment date.");
  }
}

function validate_date(date: string): string {
  const normalized_date = date.trim();

  if (!DATE_PATTERN.test(normalized_date)) {
    throw new Error("Appointment date must use YYYY-MM-DD format.");
  }

  validate_calendar_date(normalized_date);

  return normalized_date;
}

function validate_vehicle_type(vehicle_type: VehicleType): VehicleType {
  if (vehicle_type !== "CARS" && vehicle_type !== "SUVS_TRUCKS") {
    throw new Error("Invalid vehicle type.");
  }

  return vehicle_type;
}

function validate_service_package_id(service_package_id: string): string {
  const normalized_id = service_package_id.trim();

  if (!normalized_id) {
    throw new Error("Service package is required.");
  }

  return normalized_id;
}

function validate_add_on_ids(add_on_ids: string[]): string[] {
  if (!Array.isArray(add_on_ids)) {
    throw new Error("Invalid add-ons.");
  }

  const normalized_ids = add_on_ids.map((id) => id.trim()).filter(Boolean);

  if (new Set(normalized_ids).size !== normalized_ids.length) {
    throw new Error("Duplicate add-ons are not allowed.");
  }

  return normalized_ids;
}

export async function get_booking_availability(
  input: GetAvailableBookingTimesInput,
) {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid availability request.");
  }

  const date = validate_date(input.date);

  const service_package_id = validate_service_package_id(
    input.service_package_id,
  );

  const vehicle_type = validate_vehicle_type(input.vehicle_type);

  const add_on_ids = validate_add_on_ids(input.add_on_ids);

  const available_times = await get_available_booking_times({
    date,
    service_package_id,
    vehicle_type,
    add_on_ids,
  });

  return {
    date,
    available_times,
  };
}
