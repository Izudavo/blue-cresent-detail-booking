"use server";

import { BookingStatus } from "@prisma/client";

import { get_current_admin } from "@/lib/server/auth/auth.session";

import {
  get_admin_bookings as get_admin_bookings_service,
  update_admin_booking_status as update_admin_booking_status_service,
} from "./booking.service";

async function require_admin() {
  const admin = await get_current_admin();

  if (!admin) {
    throw new Error("Unauthorized.");
  }

  return admin;
}

export async function get_admin_bookings() {
  await require_admin();

  return get_admin_bookings_service();
}

export async function update_admin_booking_status(
  booking_id: string,
  status: BookingStatus,
) {
  await require_admin();

  const normalized_booking_id = booking_id.trim();

  if (!normalized_booking_id) {
    throw new Error("Booking ID is required.");
  }

  if (!Object.values(BookingStatus).includes(status)) {
    throw new Error("Invalid booking status.");
  }

  return update_admin_booking_status_service(
    normalized_booking_id,
    status,
  );
}