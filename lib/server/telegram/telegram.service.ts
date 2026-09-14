import type { TelegramMessageResponse } from "./telegram.types";

const bot_token = process.env.TELEGRAM_BOT_TOKEN;
const chat_id = process.env.TELEGRAM_CHAT_ID;

if (!bot_token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
}

if (!chat_id) {
  throw new Error("TELEGRAM_CHAT_ID is not configured.");
}

const telegram_api_url = `https://api.telegram.org/bot${bot_token}`;

async function telegram_request(
  method: string,
  body: Record<string, unknown>,
): Promise<TelegramMessageResponse> {
  const response = await fetch(
    `${telegram_api_url}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data =
    (await response.json()) as TelegramMessageResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ??
        `Telegram API request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function send_telegram_message(
  text: string,
) {
  return telegram_request("sendMessage", {
    chat_id,
    text,
    parse_mode: "HTML",
  });
}

export async function send_telegram_photo(
  photo_url: string,
  caption?: string,
) {
  return telegram_request("sendPhoto", {
    chat_id,
    photo: photo_url,
    ...(caption ? { caption } : {}),
    parse_mode: "HTML",
  });
}