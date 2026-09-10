const BUSINESS_TIMEZONE = "America/New_York";

export function get_business_greeting(): string {
  const current_hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: BUSINESS_TIMEZONE,
    }).format(new Date()),
  );

  if (current_hour < 12) {
    return "Good morning";
  }

  if (current_hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function get_business_current_date(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: BUSINESS_TIMEZONE,
  }).format(new Date());
}