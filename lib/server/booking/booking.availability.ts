import { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const BUSINESS_TIMEZONE = "America/New_York";

const SLOT_INTERVAL_MINUTES = 30;

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

function get_today_in_business_timezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function get_current_time_in_business_timezone(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function get_day_of_week(date: Date): number {
  return date.getUTCDay();
}

function is_slot_available(
  slot_start_minutes: number,
  slot_end_minutes: number,
  bookings: Array<{
    appointment_start_time: string;
    appointment_end_time: string;
  }>,
): boolean {
  return !bookings.some((booking) => {
    const booking_start = time_to_minutes(booking.appointment_start_time);

    const booking_end = time_to_minutes(booking.appointment_end_time);

    return slot_start_minutes < booking_end && slot_end_minutes > booking_start;
  });
}

export interface GetAvailableBookingTimesInput {
  date: string;
  service_package_id: string;
  vehicle_type: "CARS" | "SUVS_TRUCKS";
  add_on_ids: string[];
}

export interface AvailableBookingTime {
  start_time: string;
  end_time: string;
}

export async function get_available_booking_times(
  input: GetAvailableBookingTimesInput,
): Promise<AvailableBookingTime[]> {
  const appointment_date = date_string_to_utc_date(input.date);

  const today = get_today_in_business_timezone();

  if (input.date < today) {
    return [];
  }

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

  const package_price = service_package.prices[0];

  if (!package_price) {
    throw new Error(
      "This service package is not available for the selected vehicle type.",
    );
  }

  const add_ons =
    input.add_on_ids.length > 0
      ? await prisma.addOn.findMany({
          where: {
            id: {
              in: input.add_on_ids,
            },
            is_active: true,
          },
        })
      : [];

  if (add_ons.length !== input.add_on_ids.length) {
    throw new Error("One or more selected add-ons are no longer available.");
  }

  const add_on_duration = add_ons.reduce(
    (total, add_on) => total + (add_on.additional_minutes ?? 0),
    0,
  );

  const total_duration_minutes =
    service_package.duration_minutes + add_on_duration;

  const override = await prisma.availabilityOverride.findUnique({
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
    const business_hours = await prisma.businessHours.findUnique({
      where: {
        day_of_week: get_day_of_week(appointment_date),
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
    return [];
  }

  const opening_minutes = time_to_minutes(open_time);

  const closing_minutes = time_to_minutes(close_time);

  const bookings = await prisma.booking.findMany({
    where: {
      appointment_date,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    },
    select: {
      appointment_start_time: true,
      appointment_end_time: true,
    },
  });

  let first_slot_minutes = opening_minutes;

  /*
   * If the selected date is today,
   * don't return times that have already
   * passed in the business timezone.
   */
  if (input.date === today) {
    const current_time = time_to_minutes(
      get_current_time_in_business_timezone(),
    );

    first_slot_minutes = Math.max(
      first_slot_minutes,
      Math.ceil(current_time / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES,
    );
  }

  const available_times: AvailableBookingTime[] = [];

  for (
    let start_minutes = first_slot_minutes;
    start_minutes + total_duration_minutes <= closing_minutes;
    start_minutes += SLOT_INTERVAL_MINUTES
  ) {
    const end_minutes = start_minutes + total_duration_minutes;

    if (is_slot_available(start_minutes, end_minutes, bookings)) {
      available_times.push({
        start_time: minutes_to_time(start_minutes),
        end_time: minutes_to_time(end_minutes),
      });
    }
  }

  return available_times;
}
