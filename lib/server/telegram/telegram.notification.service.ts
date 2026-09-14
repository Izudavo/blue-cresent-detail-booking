import type { AdminBookingResult } from "@/lib/server/booking/booking.admin.types";
import type { BookingResult } from "@/lib/server/booking/booking.types";
import { create_vehicle_image_view_url } from "@/lib/server/storage/s3.service";

import { send_telegram_message, send_telegram_photo } from "./telegram.service";

type TelegramBooking = BookingResult | AdminBookingResult;

function format_currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function format_duration_since(date: Date) {
  const elapsed_ms = Date.now() - date.getTime();

  const total_minutes = Math.max(0, Math.floor(elapsed_ms / (1000 * 60)));

  const hours = Math.floor(total_minutes / 60);
  const minutes = total_minutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function escape_html(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function format_add_ons(booking: TelegramBooking) {
  if (booking.add_ons.length === 0) {
    return "None";
  }

  return booking.add_ons
    .map(
      (add_on) =>
        `• ${escape_html(add_on.name)} — ${format_currency(add_on.price)}`,
    )
    .join("\n");
}

function format_booking_message(booking: TelegramBooking, alert_count: number) {
  const pending_duration = format_duration_since(booking.created_at);

  return [
    "🚨 <b>NEW BOOKING</b>",
    "",
    `<b>Reference:</b> ${escape_html(booking.booking_reference)}`,
    `<b>Status:</b> ${escape_html(booking.status)}`,
    `<b>Alert:</b> #${alert_count}`,
    `<b>Pending:</b> ${pending_duration}`,
    "",
    "<b>CUSTOMER</b>",
    `Name: ${escape_html(booking.customer_name)}`,
    `Email: ${escape_html(booking.customer_email)}`,
    `Phone: ${escape_html(booking.customer_phone)}`,
    "",
    "<b>VEHICLE</b>",
    `Type: ${escape_html(booking.vehicle_type)}`,
    `Details: ${escape_html(booking.vehicle_details)}`,
    "",
    "<b>APPOINTMENT</b>",
    `Date: ${booking.appointment_date.toLocaleDateString("en-US")}`,
    `Time: ${escape_html(booking.appointment_start_time)} - ${escape_html(booking.appointment_end_time)}`,
    "",
    "<b>SERVICE</b>",
    `Package: ${escape_html(booking.package_name)}`,
    `Package price: ${format_currency(booking.package_price)}`,
    `Add-ons:\n${format_add_ons(booking)}`,
    "",
    `<b>Total:</b> ${format_currency(booking.total_price)}`,
    "",
    booking.customer_notes
      ? `<b>Notes:</b>\n${escape_html(booking.customer_notes)}`
      : "<b>Notes:</b> None",
  ].join("\n");
}

export async function send_new_booking_telegram_notification(
  booking: TelegramBooking,
): Promise<boolean> {
  try {
    const alert_count = 1;

    /*
     * Send the complete booking details first.
     */
    const message = format_booking_message(booking, alert_count);

    await send_telegram_message(message);

    /*
     * Send every vehicle image attached to the booking.
     *
     * The S3 bucket remains private. A fresh presigned
     * GET URL is generated for each image and passed
     * to Telegram.
     */
    for (const image of booking.vehicle_images) {
      const image_url = await create_vehicle_image_view_url(image.storage_key);

      await send_telegram_photo(
        image_url,
        `Vehicle image - ${booking.booking_reference}`,
      );
    }

    /*
     * The complete initial notification succeeded,
     * including all vehicle images.
     */
    return true;
  } catch (error) {
    /*
     * Telegram is an external notification service.
     * A Telegram failure must never cause the booking
     * itself to fail.
     */
    console.error("Failed to send new booking Telegram notification:", error);

    return false;
  }
}

export async function send_booking_escalation_telegram_notification(
  booking: TelegramBooking,
  alert_count: number,
): Promise<boolean> {
  try {
    const pending_duration = format_duration_since(booking.created_at);

    const message = [
      "⚠️ <b>BOOKING STILL PENDING</b>",
      "",
      `<b>Reference:</b> ${escape_html(booking.booking_reference)}`,
      `<b>Status:</b> ${escape_html(booking.status)}`,
      `<b>Alert:</b> #${alert_count}`,
      `<b>Pending:</b> ${pending_duration}`,
      "",
      "<b>CUSTOMER</b>",
      `Name: ${escape_html(booking.customer_name)}`,
      `Phone: ${escape_html(booking.customer_phone)}`,
      "",
      "<b>APPOINTMENT</b>",
      `Date: ${booking.appointment_date.toLocaleDateString("en-US")}`,
      `Time: ${escape_html(booking.appointment_start_time)} - ${escape_html(booking.appointment_end_time)}`,
      "",
      "<b>SERVICE</b>",
      `Package: ${escape_html(booking.package_name)}`,
      `<b>Total:</b> ${format_currency(booking.total_price)}`,
      "",
      "Please review this pending booking.",
    ].join("\n");

    await send_telegram_message(message);

    return true;
  } catch (error) {
    console.error(
      "Failed to send booking escalation Telegram notification:",
      error,
    );

    return false;
  }
}
