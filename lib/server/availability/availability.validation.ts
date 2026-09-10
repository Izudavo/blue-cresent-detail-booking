const MAX_REASON_LENGTH = 255;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface BusinessHoursInput {
  day_of_week: number;
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
}

export interface AvailabilityOverrideInput {
  date: string;
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
  reason?: string | null;
}

function validate_time(
  time: string | null | undefined,
  field_name: string,
): string | null {
  if (time === null || time === undefined || time === "") {
    return null;
  }

  if (!TIME_PATTERN.test(time)) {
    throw new Error(`${field_name} must use HH:mm format.`);
  }

  return time;
}

function validate_time_range(
  open_time: string | null,
  close_time: string | null,
) {
  if (!open_time || !close_time) {
    return;
  }

  if (open_time >= close_time) {
    throw new Error("Opening time must be earlier than closing time.");
  }
}

function validate_calendar_date(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  const calendar_date = new Date(Date.UTC(year, month - 1, day));

  if (
    calendar_date.getUTCFullYear() !== year ||
    calendar_date.getUTCMonth() !== month - 1 ||
    calendar_date.getUTCDate() !== day
  ) {
    throw new Error("Invalid date.");
  }
}

export function validate_business_hours_input(
  input: BusinessHoursInput,
): BusinessHoursInput {
  if (
    !Number.isInteger(input.day_of_week) ||
    input.day_of_week < 0 ||
    input.day_of_week > 6
  ) {
    throw new Error("Day of week must be between 0 and 6.");
  }

  const open_time = validate_time(input.open_time, "Opening time");

  const close_time = validate_time(input.close_time, "Closing time");

  if (input.is_open && (!open_time || !close_time)) {
    throw new Error("Open days must have opening and closing times.");
  }

  if (!input.is_open && (open_time || close_time)) {
    throw new Error("Closed days cannot have opening or closing times.");
  }

  validate_time_range(open_time, close_time);

  return {
    day_of_week: input.day_of_week,
    is_open: input.is_open,
    open_time,
    close_time,
  };
}

export function validate_availability_override_input(
  input: AvailabilityOverrideInput,
): AvailabilityOverrideInput {
  const date = input.date.trim();

  if (!date) {
    throw new Error("Date is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  validate_calendar_date(date);

  const today_string = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (date < today_string) {
    throw new Error("Availability dates cannot be in the past.");
  }

  const open_time = validate_time(input.open_time, "Opening time");

  const close_time = validate_time(input.close_time, "Closing time");

  if (input.is_open && (!open_time || !close_time)) {
    throw new Error("Open dates must have opening and closing times.");
  }

  if (!input.is_open && (open_time || close_time)) {
    throw new Error("Closed dates cannot have opening or closing times.");
  }

  validate_time_range(open_time, close_time);

  const reason = input.reason?.trim() || null;

  if (reason && reason.length > MAX_REASON_LENGTH) {
    throw new Error("Reason is too long.");
  }

  return {
    date,
    is_open: input.is_open,
    open_time,
    close_time,
    reason,
  };
}
