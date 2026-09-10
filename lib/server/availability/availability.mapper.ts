import type {
  AvailabilityOverride as PrismaAvailabilityOverride,
  BusinessHours as PrismaBusinessHours,
} from "@prisma/client";

import type { AvailabilityOverride, BusinessHours } from "@/types/availability";

export function map_business_hours(
  business_hours: PrismaBusinessHours,
): BusinessHours {
  return {
    id: business_hours.id,
    day_of_week: business_hours.day_of_week,
    is_open: business_hours.is_open,
    open_time: business_hours.open_time,
    close_time: business_hours.close_time,
    created_at: business_hours.created_at,
    updated_at: business_hours.updated_at,
  };
}

export function map_availability_override(
  override: PrismaAvailabilityOverride,
): AvailabilityOverride {
  return {
    id: override.id,
    date: override.date,
    is_open: override.is_open,
    open_time: override.open_time,
    close_time: override.close_time,
    reason: override.reason,
    created_at: override.created_at,
    updated_at: override.updated_at,
  };
}
