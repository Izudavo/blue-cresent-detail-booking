"use server";

import { send_telegram_message } from "./telegram.service";

export async function test_telegram_connection() {
  await send_telegram_message(
    "Blue Crescent Telegram integration is working.",
  );

  return {
    success: true,
  };
}