import type { BookingStatus, VehicleType } from "@prisma/client";

export interface BookingVehicleImageInput {
  storage_key: string;
  original_name: string;
  content_type: string;
  file_size: number;
}

/*
 * Persisted vehicle image record returned
 * with a booking.
 */
export interface BookingVehicleImageResult {
  id: string;
  storage_key: string;
  original_name: string | null;
  content_type: string | null;
  file_size: number | null;
}

export interface CreateBookingInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_details: string;
  appointment_date: string;
  appointment_start_time: string;
  vehicle_type: VehicleType;
  service_package_id: string;
  add_on_ids: string[];
  vehicle_images: BookingVehicleImageInput[];
  customer_notes?: string | null;
}

export interface BookingAddOnSnapshot {
  add_on_id: string;
  name: string;
  price: number;
  additional_minutes: number;
}

export interface BookingResult {
  id: string;

  booking_reference: string;

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_details: string;

  appointment_date: Date;
  appointment_start_time: string;
  appointment_end_time: string;

  vehicle_type: VehicleType;

  service_package_id: string;
  package_name: string;
  package_price: number;
  package_duration_minutes: number;

  add_ons: BookingAddOnSnapshot[];

  total_price: number;

  status: BookingStatus;

  customer_notes: string | null;

  confirmed_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;

  /*
   * Persisted vehicle images attached to the booking.
   */
  vehicle_images: BookingVehicleImageResult[];

  created_at: Date;
  updated_at: Date;
}

