import {
  admin_new_booking_email,
  customer_booking_cancelled_email,
  customer_booking_confirmed_email,
  customer_booking_received_email,
} from "./email.templates";

import { send_email } from "./email.service";

import type { AdminBookingResult } from "@/lib/server/booking/booking.admin.types";
import type { BookingResult } from "@/lib/server/booking/booking.types";

type EmailBooking = BookingResult | AdminBookingResult;

const configured_admin_email = process.env.ADMIN_EMAIL;

if (!configured_admin_email) {
  throw new Error("ADMIN_EMAIL is not configured.");
}

const admin_email: string = configured_admin_email;

function to_email_data(booking: EmailBooking) {
  return {
    booking_reference: booking.booking_reference,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    vehicle_details: booking.vehicle_details,
    vehicle_type: booking.vehicle_type,
    appointment_date: booking.appointment_date,
    appointment_start_time: booking.appointment_start_time,
    appointment_end_time: booking.appointment_end_time,
    package_name: booking.package_name,
    package_price: booking.package_price,
    add_ons: booking.add_ons.map((add_on) => ({
      name: add_on.name,
      price: add_on.price,
    })),
    total_price: booking.total_price,
    customer_notes: booking.customer_notes,
  };
}

async function safely_send_email(
  type: string,
  send: () => Promise<unknown>,
) {
  try {
    await send();
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
  }
}

export async function send_booking_received_notifications(
  booking: EmailBooking,
) {
  const email_data = to_email_data(booking);

  await Promise.all([
    safely_send_email("customer booking received", async () => {
      const email = customer_booking_received_email(email_data);

      await send_email({
        to: booking.customer_email,
        subject: email.subject,
        html: email.html,
      });
    }),

    safely_send_email("admin new booking", async () => {
      const email = admin_new_booking_email(email_data);

      await send_email({
        to: admin_email,
        subject: email.subject,
        html: email.html,
      });
    }),
  ]);
}

export async function send_booking_confirmed_notification(
  booking: EmailBooking,
) {
  const email_data = to_email_data(booking);

  await safely_send_email("customer booking confirmed", async () => {
    const email = customer_booking_confirmed_email(email_data);

    await send_email({
      to: booking.customer_email,
      subject: email.subject,
      html: email.html,
    });
  });
}

export async function send_booking_cancelled_notification(
  booking: EmailBooking,
) {
  const email_data = to_email_data(booking);

  await safely_send_email("customer booking cancelled", async () => {
    const email = customer_booking_cancelled_email(email_data);

    await send_email({
      to: booking.customer_email,
      subject: email.subject,
      html: email.html,
    });
  });
}