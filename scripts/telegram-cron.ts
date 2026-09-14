import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const {
    start_telegram_escalation_cron,
  } = await import(
    "../lib/server/telegram/telegram.cron"
  );

  start_telegram_escalation_cron();
}

main().catch((error) => {
  console.error("Telegram cron worker failed:", error);
  process.exit(1);
});