interface BookingEmailData {
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_details: string;
  vehicle_type: string;
  appointment_date: Date;
  appointment_start_time: string;
  appointment_end_time: string;
  package_name: string;
  package_price: number;
  add_ons: {
    name: string;
    price: number;
  }[];
  total_price: number;
  customer_notes: string | null;
}

function format_date(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

function format_currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function escape_html(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function booking_details_html(data: BookingEmailData) {
  const add_ons =
    data.add_ons.length > 0
      ? `
        <div style="margin-top: 16px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #111;">
            Add-ons
          </p>

          ${data.add_ons
            .map(
              (add_on) => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #444;">
                  <span>${escape_html(add_on.name)}</span>
                  <span>${format_currency(add_on.price)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      `
      : "";

  const notes = data.customer_notes
    ? `
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 6px; font-weight: 600; color: #111;">
          Notes
        </p>

        <p style="margin: 0; color: #555; white-space: pre-line;">
          ${escape_html(data.customer_notes)}
        </p>
      </div>
    `
    : "";

  return `
    <div style="margin-top: 24px; border: 1px solid #e5e5e5; border-radius: 10px; padding: 18px;">
      <p style="margin: 0 0 14px; font-size: 14px; font-weight: 700; color: #111;">
        Booking details
      </p>

      <div style="margin-bottom: 8px;">
        <span style="color: #666;">Reference:</span>
        <strong style="color: #111;">${escape_html(data.booking_reference)}</strong>
      </div>

      <div style="margin-bottom: 8px;">
        <span style="color: #666;">Service:</span>
        <strong style="color: #111;">${escape_html(data.package_name)}</strong>
      </div>

      <div style="margin-bottom: 8px;">
        <span style="color: #666;">Vehicle:</span>
        <strong style="color: #111;">${escape_html(data.vehicle_details)}</strong>
      </div>

      <div style="margin-bottom: 8px;">
        <span style="color: #666;">Date:</span>
        <strong style="color: #111;">${format_date(data.appointment_date)}</strong>
      </div>

      <div style="margin-bottom: 8px;">
        <span style="color: #666;">Time:</span>
        <strong style="color: #111;">
          ${escape_html(data.appointment_start_time)} – ${escape_html(
            data.appointment_end_time,
          )}
        </strong>
      </div>

      <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">Package</span>
          <span style="color: #111;">${format_currency(data.package_price)}</span>
        </div>

        ${add_ons}

        <div style="display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eee;">
          <strong style="color: #111;">Total</strong>
          <strong style="color: #111;">${format_currency(data.total_price)}</strong>
        </div>
      </div>

      ${notes}
    </div>
  `;
}

function base_template(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Blue Crescent Detailing</title>
      </head>

      <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, Helvetica, sans-serif; color: #111;">
        <div style="padding: 32px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
            <div style="padding: 22px 24px; background: #111; color: #fff;">
              <p style="margin: 0; font-size: 18px; font-weight: 700;">
                Blue Crescent Detailing
              </p>
            </div>

            <div style="padding: 24px;">
              ${content}
            </div>

            <div style="padding: 18px 24px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
              <p style="margin: 0;">
                Blue Crescent Detailing
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function customer_booking_received_email(
  data: BookingEmailData,
) {
  return {
    subject: `Booking received — ${data.booking_reference}`,
    html: base_template(`
      <h1 style="margin: 0; font-size: 22px; color: #111;">
        Booking received
      </h1>

      <p style="margin: 12px 0 0; color: #555; line-height: 1.6;">
        Hi ${escape_html(data.customer_name)}, we’ve received your booking request.
        Your appointment is currently pending confirmation.
      </p>

      ${booking_details_html(data)}

      <p style="margin: 20px 0 0; color: #555; line-height: 1.6;">
        We’ll send you another email once your appointment has been confirmed.
      </p>
    `),
  };
}

export function admin_new_booking_email(
  data: BookingEmailData,
) {
  return {
    subject: `New booking — ${data.booking_reference}`,
    html: base_template(`
      <h1 style="margin: 0; font-size: 22px; color: #111;">
        New booking request
      </h1>

      <p style="margin: 12px 0 0; color: #555; line-height: 1.6;">
        A new booking request has been submitted and is waiting for review.
      </p>

      <div style="margin-top: 20px;">
        <p style="margin: 0 0 6px; font-weight: 600; color: #111;">
          Customer
        </p>

        <p style="margin: 0; color: #555;">
          ${escape_html(data.customer_name)}
        </p>

        <p style="margin: 4px 0 0; color: #555;">
          ${escape_html(data.customer_email)}
        </p>

        <p style="margin: 4px 0 0; color: #555;">
          ${escape_html(data.customer_phone)}
        </p>
      </div>

      ${booking_details_html(data)}
    `),
  };
}

export function customer_booking_confirmed_email(
  data: BookingEmailData,
) {
  return {
    subject: `Booking confirmed — ${data.booking_reference}`,
    html: base_template(`
      <h1 style="margin: 0; font-size: 22px; color: #111;">
        Booking confirmed
      </h1>

      <p style="margin: 12px 0 0; color: #555; line-height: 1.6;">
        Hi ${escape_html(data.customer_name)}, your Blue Crescent Detailing
        appointment has been confirmed.
      </p>

      ${booking_details_html(data)}

      <p style="margin: 20px 0 0; color: #555; line-height: 1.6;">
        We look forward to seeing you.
      </p>
    `),
  };
}

export function customer_booking_cancelled_email(
  data: BookingEmailData,
) {
  return {
    subject: `Booking cancelled — ${data.booking_reference}`,
    html: base_template(`
      <h1 style="margin: 0; font-size: 22px; color: #111;">
        Booking cancelled
      </h1>

      <p style="margin: 12px 0 0; color: #555; line-height: 1.6;">
        Hi ${escape_html(data.customer_name)}, your Blue Crescent Detailing
        appointment has been cancelled.
      </p>

      ${booking_details_html(data)}

      <p style="margin: 20px 0 0; color: #555; line-height: 1.6;">
        If you have any questions, please contact us.
      </p>
    `),
  };
}

