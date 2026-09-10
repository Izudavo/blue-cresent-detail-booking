import type {
  Booking,
  BookingAddOn,
  BookingVehicleImage,
} from "@prisma/client";

import type {
  AdminBookingResult,
} from "./booking.admin.types";

type BookingWithRelations = Booking & {
  add_ons: BookingAddOn[];
  vehicle_images: BookingVehicleImage[];
};

function decimal_to_number(value: { toNumber(): number }): number {
  return value.toNumber();
}

export function map_admin_booking(
  booking: BookingWithRelations,
): AdminBookingResult {
  return {
    id: booking.id,
    booking_reference: booking.booking_reference,

    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    vehicle_details: booking.vehicle_details,

    appointment_date: booking.appointment_date,
    appointment_start_time: booking.appointment_start_time,
    appointment_end_time: booking.appointment_end_time,

    vehicle_type: booking.vehicle_type,

    service_package_id: booking.service_package_id,
    package_name: booking.package_name,
    package_price: decimal_to_number(booking.package_price),
    package_duration_minutes: booking.package_duration_minutes,

    add_ons: booking.add_ons.map((add_on) => ({
      id: add_on.id,
      name: add_on.name,
      price: decimal_to_number(add_on.price),
      additional_minutes: add_on.additional_minutes,
    })),

    total_price: decimal_to_number(booking.total_price),

    status: booking.status,

    customer_notes: booking.customer_notes,

    confirmed_at: booking.confirmed_at,
    cancelled_at: booking.cancelled_at,
    completed_at: booking.completed_at,

    vehicle_images: booking.vehicle_images.map((image) => ({
      id: image.id,
      storage_key: image.storage_key,
      original_name: image.original_name,
      content_type: image.content_type,
      file_size: image.file_size,
    })),

    created_at: booking.created_at,
    updated_at: booking.updated_at,
  };
}

