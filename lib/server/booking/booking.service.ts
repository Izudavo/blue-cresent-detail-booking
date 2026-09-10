import { BookingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verify_vehicle_image } from "@/lib/server/storage/s3.service";
import { map_admin_booking } from "./booking.admin.mapper";
import type { AdminBookingResult } from "./booking.admin.types";

import type {
  BookingAddOnSnapshot,
  BookingResult,
  CreateBookingInput,
} from "./booking.types";

const BUSINESS_TIMEZONE = "America/New_York";

function date_string_to_utc_date(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function time_to_minutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutes_to_time(total_minutes: number): string {
  const hours = Math.floor(total_minutes / 60);
  const minutes = total_minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

function decimal_to_number(value: { toNumber(): number }): number {
  return value.toNumber();
}

function generate_booking_reference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `BC-${timestamp}-${random}`;
}

function get_today_in_business_timezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function acquire_booking_date_lock(
  tx: Prisma.TransactionClient,
  appointment_date: string,
) {
  const lock_name = `bc:booking:${appointment_date}`;

  const result = await tx.$queryRaw<Array<{ locked: number | bigint | null }>>`
    SELECT GET_LOCK(${lock_name}, 10) AS locked
  `;

  if (Number(result[0]?.locked) !== 1) {
    throw new Error("The booking system is busy. Please try again.");
  }

  return lock_name;
}

async function release_booking_date_lock(
  tx: Prisma.TransactionClient,
  lock_name: string,
) {
  await tx.$queryRaw`
    SELECT RELEASE_LOCK(${lock_name})
  `;
}

async function validate_booking_availability(
  tx: Prisma.TransactionClient,
  appointment_date: Date,
  appointment_date_string: string,
  appointment_start_time: string,
  appointment_end_time: string,
) {
  const today = get_today_in_business_timezone();

  if (appointment_date_string < today) {
    throw new Error("Appointments cannot be booked for a date in the past.");
  }

  const appointment_day_of_week = appointment_date.getUTCDay();

  const override = await tx.availabilityOverride.findUnique({
    where: {
      date: appointment_date,
    },
  });

  let is_open: boolean;
  let open_time: string | null;
  let close_time: string | null;

  if (override) {
    is_open = override.is_open;
    open_time = override.open_time;
    close_time = override.close_time;
  } else {
    const business_hours = await tx.businessHours.findUnique({
      where: {
        day_of_week: appointment_day_of_week,
      },
    });

    if (!business_hours) {
      throw new Error("Business hours have not been configured for this date.");
    }

    is_open = business_hours.is_open;
    open_time = business_hours.open_time;
    close_time = business_hours.close_time;
  }

  if (!is_open || !open_time || !close_time) {
    throw new Error("The business is closed on the selected date.");
  }

  const requested_start_minutes = time_to_minutes(appointment_start_time);
  const requested_end_minutes = time_to_minutes(appointment_end_time);

  const opening_minutes = time_to_minutes(open_time);
  const closing_minutes = time_to_minutes(close_time);

  if (
    requested_start_minutes < opening_minutes ||
    requested_end_minutes > closing_minutes
  ) {
    throw new Error("The selected appointment is outside business hours.");
  }

  const overlapping_booking = await tx.booking.findFirst({
    where: {
      appointment_date,

      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },

      appointment_start_time: {
        lt: appointment_end_time,
      },

      appointment_end_time: {
        gt: appointment_start_time,
      },
    },

    select: {
      id: true,
    },
  });

  if (overlapping_booking) {
    throw new Error("The selected appointment time is no longer available.");
  }
}

export async function create_booking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const appointment_date = date_string_to_utc_date(input.appointment_date);

  /*
   * Load the service package and its price for
   * the selected vehicle type from the database.
   */
  const service_package = await prisma.servicePackage.findFirst({
    where: {
      id: input.service_package_id,
      is_active: true,
    },
    include: {
      prices: {
        where: {
          vehicle_type: input.vehicle_type,
        },
      },
    },
  });

  if (!service_package) {
    throw new Error("Service package not found or is no longer available.");
  }

  const package_price_record = service_package.prices[0];

  if (!package_price_record) {
    throw new Error(
      "This service package is not available for the selected vehicle type.",
    );
  }

  /*
   * Load the selected add-ons from the database.
   *
   * Prices and durations are never trusted from
   * the client.
   */
  const add_ons =
    input.add_on_ids.length > 0
      ? await prisma.addOn.findMany({
          where: {
            id: {
              in: input.add_on_ids,
            },
            is_active: true,
          },
          orderBy: {
            sort_order: "asc",
          },
        })
      : [];

  if (add_ons.length !== input.add_on_ids.length) {
    throw new Error("One or more selected add-ons are no longer available.");
  }

  /*
   * Restore the customer's selected add-on order.
   */
  const add_on_map = new Map(add_ons.map((add_on) => [add_on.id, add_on]));

  const ordered_add_ons = input.add_on_ids.map((id) => {
    const add_on = add_on_map.get(id);

    if (!add_on) {
      throw new Error("One or more selected add-ons are invalid.");
    }

    return add_on;
  });

  /*
   * Create immutable snapshots of the add-on
   * information that will be stored with the booking.
   */
  const package_price = decimal_to_number(package_price_record.price);

  const add_on_snapshots: BookingAddOnSnapshot[] = ordered_add_ons.map(
    (add_on) => ({
      add_on_id: add_on.id,
      name: add_on.name,
      price: decimal_to_number(add_on.price),
      additional_minutes: add_on.additional_minutes ?? 0,
    }),
  );

  const add_on_total = add_on_snapshots.reduce(
    (total, add_on) => total + add_on.price,
    0,
  );

  const add_on_duration = add_on_snapshots.reduce(
    (total, add_on) => total + add_on.additional_minutes,
    0,
  );

  const total_duration_minutes =
    service_package.duration_minutes + add_on_duration;

  /*
   * Calculate the final appointment end time
   * entirely on the server.
   */
  const start_minutes = time_to_minutes(input.appointment_start_time);

  const end_minutes = start_minutes + total_duration_minutes;

  if (end_minutes > 24 * 60) {
    throw new Error("The selected appointment would extend past midnight.");
  }

  const appointment_end_time = minutes_to_time(end_minutes);

  const total_price = package_price + add_on_total;

  /*
   * Verify every uploaded vehicle image against
   * the actual S3 object before creating the booking.
   *
   * Browser-provided metadata is not trusted.
   */
  const verified_vehicle_images = await Promise.all(
    input.vehicle_images.map(async (image) => {
      const verified_image = await verify_vehicle_image({
        storage_key: image.storage_key,
        content_type: image.content_type,
        file_size: image.file_size,
      });

      return {
        ...verified_image,
        original_name: image.original_name,
      };
    }),
  );

  /*
   * Create the booking inside a transaction.
   *
   * A MySQL named lock is acquired for the appointment
   * date so concurrent booking requests for the same
   * date cannot pass the availability check together.
   */
  const booking = await prisma.$transaction(async (tx) => {
    const lock_name = await acquire_booking_date_lock(
      tx,
      input.appointment_date,
    );

    try {
      /*
       * Re-check availability immediately before
       * creating the booking.
       *
       * This is the final source of truth because
       * frontend availability can become stale.
       */
      await validate_booking_availability(
        tx,
        appointment_date,
        input.appointment_date,
        input.appointment_start_time,
        appointment_end_time,
      );

      const created_booking = await tx.booking.create({
        data: {
          booking_reference: generate_booking_reference(),

          customer_name: input.customer_name,
          customer_email: input.customer_email,
          customer_phone: input.customer_phone,
          vehicle_details: input.vehicle_details,

          appointment_date,
          appointment_start_time: input.appointment_start_time,
          appointment_end_time,

          vehicle_type: input.vehicle_type,

          service_package_id: service_package.id,
          package_name: service_package.name,
          package_price: package_price_record.price,
          package_duration_minutes: service_package.duration_minutes,

          total_price,

          status: BookingStatus.PENDING,

          customer_notes: input.customer_notes ?? null,

          add_ons: {
            create: add_on_snapshots.map((add_on) => ({
              add_on_id: add_on.add_on_id,
              name: add_on.name,
              price: add_on.price,
              additional_minutes: add_on.additional_minutes,
            })),
          },

          vehicle_images: {
            create: verified_vehicle_images.map((image) => ({
              storage_key: image.storage_key,
              original_name: image.original_name,
              content_type: image.content_type,
              file_size: image.file_size,
            })),
          },
        },

        include: {
          add_ons: true,
        },
      });

      return created_booking;
    } finally {
      /*
       * Always release the MySQL named lock,
       * including when booking creation fails.
       */
      await release_booking_date_lock(tx, lock_name);
    }
  });

  /*
   * Map Prisma's Decimal values into plain numbers
   * before returning the booking result.
   */
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
      add_on_id: add_on.add_on_id,
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

    created_at: booking.created_at,
    updated_at: booking.updated_at,
  };
}



export async function get_admin_bookings(): Promise<
  AdminBookingResult[]
> {
  const bookings = await prisma.booking.findMany({
    orderBy: [
      {
        appointment_date: "asc",
      },
      {
        appointment_start_time: "asc",
      },
      {
        created_at: "desc",
      },
    ],

    include: {
      add_ons: true,
      vehicle_images: true,
    },
  });

  return bookings.map(map_admin_booking);
}


export async function update_admin_booking_status(
  booking_id: string,
  status: BookingStatus,
): Promise<AdminBookingResult> {
  const booking = await prisma.booking.findUnique({
    where: {
      id: booking_id,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const now = new Date();

  const updated_booking = await prisma.booking.update({
    where: {
      id: booking_id,
    },

    data: {
      status,

      confirmed_at:
        status === BookingStatus.CONFIRMED
          ? booking.confirmed_at ?? now
          : booking.confirmed_at,

      cancelled_at:
        status === BookingStatus.CANCELLED
          ? booking.cancelled_at ?? now
          : booking.cancelled_at,

      completed_at:
        status === BookingStatus.COMPLETED
          ? booking.completed_at ?? now
          : booking.completed_at,
    },

    include: {
      add_ons: true,
      vehicle_images: true,
    },
  });

  return map_admin_booking(updated_booking);
}