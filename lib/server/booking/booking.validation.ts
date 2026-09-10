import type { VehicleType } from "@prisma/client";

import type { CreateBookingInput } from "./booking.types";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_NAME_LENGTH = 100;

const MAX_EMAIL_LENGTH = 254;

const MAX_PHONE_LENGTH = 30;

const MAX_VEHICLE_DETAILS_LENGTH = 150;

const MAX_NOTES_LENGTH = 2000;

const MAX_VEHICLE_IMAGES = 5;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const MAX_IMAGE_NAME_LENGTH = 255;

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

function validate_time(time: string) {
  if (!TIME_PATTERN.test(time)) {
    throw new Error("Appointment start time must use HH:mm format.");
  }

  return time;
}

function validate_vehicle_type(vehicle_type: VehicleType) {
  if (vehicle_type !== "CARS" && vehicle_type !== "SUVS_TRUCKS") {
    throw new Error("Invalid vehicle type.");
  }

  return vehicle_type;
}

function validate_email(email: string) {
  const normalized_email = email.trim().toLowerCase();

  if (!normalized_email) {
    throw new Error("Email is required.");
  }

  if (normalized_email.length > MAX_EMAIL_LENGTH) {
    throw new Error("Email is too long.");
  }

  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email_pattern.test(normalized_email)) {
    throw new Error("Invalid email address.");
  }

  return normalized_email;
}

function validate_vehicle_images(images: CreateBookingInput["vehicle_images"]) {
  if (!Array.isArray(images)) {
    throw new Error("Invalid vehicle images.");
  }

  if (images.length === 0) {
    throw new Error("At least one vehicle image is required.");
  }

  if (images.length > MAX_VEHICLE_IMAGES) {
    throw new Error(
      `A maximum of ${MAX_VEHICLE_IMAGES} vehicle images is allowed.`,
    );
  }

  return images.map((image) => {
    const storage_key = image.storage_key.trim();

    if (!storage_key) {
      throw new Error("Vehicle image storage key is required.");
    }

    const original_name = image.original_name.trim();

    if (!original_name) {
      throw new Error("Vehicle image original name is required.");
    }

    if (original_name.length > MAX_IMAGE_NAME_LENGTH) {
      throw new Error("Vehicle image name is too long.");
    }

    const content_type = image.content_type.trim().toLowerCase();

    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(content_type)) {
      throw new Error("Vehicle images must be JPEG, PNG, or WebP.");
    }

    if (!Number.isInteger(image.file_size) || image.file_size <= 0) {
      throw new Error("Vehicle image file size is invalid.");
    }

    if (image.file_size > MAX_IMAGE_SIZE) {
      throw new Error("Vehicle images must not exceed 10 MB each.");
    }

    return {
      storage_key,
      original_name,
      content_type,
      file_size: image.file_size,
    };
  });
}

export function validate_create_booking_input(
  input: CreateBookingInput,
): CreateBookingInput {
  const customer_name = input.customer_name.trim();

  if (!customer_name) {
    throw new Error("Customer name is required.");
  }

  if (customer_name.length > MAX_NAME_LENGTH) {
    throw new Error("Customer name is too long.");
  }

  const customer_email = validate_email(input.customer_email);

  const customer_phone = input.customer_phone.trim();

  if (!customer_phone) {
    throw new Error("Customer phone is required.");
  }

  if (customer_phone.length > MAX_PHONE_LENGTH) {
    throw new Error("Customer phone is too long.");
  }

  const vehicle_details = input.vehicle_details.trim();

  if (!vehicle_details) {
    throw new Error("Vehicle details are required.");
  }

  if (vehicle_details.length > MAX_VEHICLE_DETAILS_LENGTH) {
    throw new Error("Vehicle details are too long.");
  }

  const appointment_date = input.appointment_date.trim();

  if (!DATE_PATTERN.test(appointment_date)) {
    throw new Error("Appointment date must use YYYY-MM-DD format.");
  }

  validate_calendar_date(appointment_date);

  const appointment_start_time = input.appointment_start_time.trim();

  validate_time(appointment_start_time);

  if (!input.service_package_id.trim()) {
    throw new Error("Service package is required.");
  }

  if (!Array.isArray(input.add_on_ids)) {
    throw new Error("Invalid add-ons.");
  }

  const add_on_ids = input.add_on_ids.map((id) => id.trim()).filter(Boolean);

  if (new Set(add_on_ids).size !== add_on_ids.length) {
    throw new Error("Duplicate add-ons are not allowed.");
  }

  const vehicle_images = validate_vehicle_images(input.vehicle_images);

  const customer_notes = input.customer_notes?.trim() || null;

  if (customer_notes && customer_notes.length > MAX_NOTES_LENGTH) {
    throw new Error("Customer notes are too long.");
  }

  return {
    customer_name,
    customer_email,
    customer_phone,
    vehicle_details,
    appointment_date,
    appointment_start_time,
    vehicle_type: validate_vehicle_type(input.vehicle_type),
    service_package_id: input.service_package_id.trim(),
    add_on_ids,
    vehicle_images,
    customer_notes,
  };
}

