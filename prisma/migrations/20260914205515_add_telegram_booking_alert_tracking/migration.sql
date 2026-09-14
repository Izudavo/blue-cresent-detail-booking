-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `telegram_alert_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `telegram_last_alerted_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `bookings_status_telegram_last_alerted_at_idx` ON `bookings`(`status`, `telegram_last_alerted_at`);
