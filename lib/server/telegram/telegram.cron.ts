import cron from "node-cron";
import { get_prisma_error_message } from "@/lib/server/errors/prisma.error";

import { prisma } from "@/lib/prisma";
import {
  send_booking_escalation_telegram_notification,
  send_new_booking_telegram_notification,
} from "./telegram.notification.service";

/*
 * Run every 5 minutes.
 *
 * The job checks the database for PENDING bookings
 * that are due for their next Telegram notification.
 */
const TELEGRAM_ESCALATION_INTERVAL_MINUTES = 5;

async function process_pending_booking_alerts() {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",

        OR: [
          /*
           * Telegram has never successfully alerted
           * for this booking.
           *
           * Retry the complete initial notification.
           */
          {
            telegram_alert_count: 0,
            telegram_last_alerted_at: null,
          },

          /*
           * Telegram has already alerted, but the
           * next escalation is now due.
           */
          {
            telegram_alert_count: {
              gt: 0,
            },

            telegram_last_alerted_at: {
              lte: new Date(
                now.getTime() -
                  TELEGRAM_ESCALATION_INTERVAL_MINUTES * 60 * 1000,
              ),
            },
          },
        ],
      },

      include: {
        add_ons: true,
        vehicle_images: true,
      },

      orderBy: {
        created_at: "asc",
      },
    });

    if (bookings.length === 0) {
      return;
    }

    console.log(
      `Telegram escalation job found ${bookings.length} pending booking(s).`,
    );

    for (const booking of bookings) {
      /*
       * If the initial Telegram alert never succeeded,
       * retry the complete notification, including images.
       */
      if (
        booking.telegram_alert_count === 0 &&
        booking.telegram_last_alerted_at === null
      ) {
        const sent = await send_new_booking_telegram_notification({
          ...booking,
          package_price: booking.package_price.toNumber(),
          total_price: booking.total_price.toNumber(),
          add_ons: booking.add_ons.map((add_on) => ({
            add_on_id: add_on.add_on_id,
            name: add_on.name,
            price: add_on.price.toNumber(),
            additional_minutes: add_on.additional_minutes,
          })),
          vehicle_images: booking.vehicle_images.map((image) => ({
            id: image.id,
            storage_key: image.storage_key,
            original_name: image.original_name,
            content_type: image.content_type,
            file_size: image.file_size,
          })),
        });

        if (sent) {
          await prisma.booking.update({
            where: {
              id: booking.id,
            },

            data: {
              telegram_alert_count: 1,
              telegram_last_alerted_at: new Date(),
            },
          });
        }

        continue;
      }

      /*
       * The next alert number is based on the number
       * of successfully sent Telegram alerts.
       */
      const next_alert_count = booking.telegram_alert_count + 1;

      const sent = await send_booking_escalation_telegram_notification(
        {
          ...booking,
          package_price: booking.package_price.toNumber(),
          total_price: booking.total_price.toNumber(),
          add_ons: booking.add_ons.map((add_on) => ({
            add_on_id: add_on.add_on_id,
            name: add_on.name,
            price: add_on.price.toNumber(),
            additional_minutes: add_on.additional_minutes,
          })),
          vehicle_images: booking.vehicle_images.map((image) => ({
            id: image.id,
            storage_key: image.storage_key,
            original_name: image.original_name,
            content_type: image.content_type,
            file_size: image.file_size,
          })),
        },
        next_alert_count,
      );

      /*
       * Only increment the alert counter when
       * Telegram successfully accepted the message.
       */
      if (sent) {
        await prisma.booking.update({
          where: {
            id: booking.id,
          },

          data: {
            telegram_alert_count: next_alert_count,
            telegram_last_alerted_at: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error(
      "Telegram escalation job failed:",
      get_prisma_error_message(error),
    );
  }
}

/*
 * Start the Telegram escalation scheduler.
 *
 * The process must remain alive for node-cron to continue
 * executing scheduled jobs.
 */
export function start_telegram_escalation_cron() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      await process_pending_booking_alerts();
    },
    {
      timezone: "America/New_York",
    },
  );

  console.log("Telegram escalation cron started. Running every 5 minutes.");
}
