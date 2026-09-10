import { prisma } from "@/lib/prisma";

import type {
  AvailabilityOverrideInput,
  BusinessHoursInput,
} from "./availability.validation";

import {
  map_availability_override,
  map_business_hours,
} from "./availability.mapper";

const BUSINESS_TIMEZONE = "America/New_York";

function get_today_in_business_timezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function date_string_to_utc_date(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function get_business_hours() {
  const business_hours = await prisma.businessHours.findMany({
    orderBy: {
      day_of_week: "asc",
    },
  });

  return business_hours.map(map_business_hours);
}

export async function get_upcoming_availability_overrides() {
  const today = date_string_to_utc_date(get_today_in_business_timezone());

  const overrides = await prisma.availabilityOverride.findMany({
    where: {
      date: {
        gte: today,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return overrides.map(map_availability_override);
}

export async function get_availability_settings() {
  const [business_hours, overrides] = await Promise.all([
    get_business_hours(),
    get_upcoming_availability_overrides(),
  ]);

  return {
    business_hours,
    overrides,
  };
}

export async function update_business_hours(
  business_hours: BusinessHoursInput[],
) {
  await prisma.$transaction(
    business_hours.map((day) =>
      prisma.businessHours.upsert({
        where: {
          day_of_week: day.day_of_week,
        },
        update: {
          is_open: day.is_open,
          open_time: day.open_time ?? null,
          close_time: day.close_time ?? null,
        },
        create: {
          day_of_week: day.day_of_week,
          is_open: day.is_open,
          open_time: day.open_time ?? null,
          close_time: day.close_time ?? null,
        },
      }),
    ),
  );

  const updated_business_hours = await prisma.businessHours.findMany({
    orderBy: {
      day_of_week: "asc",
    },
  });

  return updated_business_hours.map(map_business_hours);
}

export async function create_availability_override(
  override: AvailabilityOverrideInput,
) {
  const date = date_string_to_utc_date(override.date);

  const created_override = await prisma.availabilityOverride.create({
    data: {
      date,
      is_open: override.is_open,
      open_time: override.open_time ?? null,
      close_time: override.close_time ?? null,
      reason: override.reason ?? null,
    },
  });

  return map_availability_override(created_override);
}

export async function update_availability_override(
  id: string,
  override: AvailabilityOverrideInput,
) {
  const date = date_string_to_utc_date(override.date);

  const existing_override = await prisma.availabilityOverride.findUnique({
    where: {
      id,
    },
  });

  if (!existing_override) {
    throw new Error("Availability override not found.");
  }

  const updated_override = await prisma.availabilityOverride.update({
    where: {
      id,
    },
    data: {
      date,
      is_open: override.is_open,
      open_time: override.open_time ?? null,
      close_time: override.close_time ?? null,
      reason: override.reason ?? null,
    },
  });

  return map_availability_override(updated_override);
}

export async function delete_availability_override(id: string) {
  const existing_override = await prisma.availabilityOverride.findUnique({
    where: {
      id,
    },
  });

  if (!existing_override) {
    throw new Error("Availability override not found.");
  }

  const deleted_override = await prisma.availabilityOverride.delete({
    where: {
      id,
    },
  });

  return map_availability_override(deleted_override);
}
