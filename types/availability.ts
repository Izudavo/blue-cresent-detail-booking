export interface BusinessHours {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AvailabilityOverride {
  id: string;
  date: Date;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessHoursInput {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface AvailabilityOverrideInput {
  date: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  reason: string | null;
}