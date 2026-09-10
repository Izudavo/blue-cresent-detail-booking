import type { BookingStatus, VehicleType } from "@prisma/client";

export type AdminBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminBookingAddOn {
  id: string;
  name: string;
  price: number;
  additional_minutes: number;
}

export interface AdminBookingImage {
  id: string;
  storage_key: string;
  original_name: string | null;
  content_type: string | null;
  file_size: number | null;
}

export interface AdminBookingResult {
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

  add_ons: AdminBookingAddOn[];

  total_price: number;

  status: BookingStatus;

  customer_notes: string | null;

  confirmed_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;

  vehicle_images: AdminBookingImage[];

  created_at: Date;
  updated_at: Date;
}

