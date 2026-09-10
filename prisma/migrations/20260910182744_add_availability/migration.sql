-- CreateTable
CREATE TABLE `business_hours` (
    `id` VARCHAR(191) NOT NULL,
    `day_of_week` INTEGER NOT NULL,
    `is_open` BOOLEAN NOT NULL DEFAULT true,
    `open_time` VARCHAR(191) NULL,
    `close_time` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `business_hours_day_of_week_key`(`day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_overrides` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `is_open` BOOLEAN NOT NULL DEFAULT true,
    `open_time` VARCHAR(191) NULL,
    `close_time` VARCHAR(191) NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `availability_overrides_date_idx`(`date`),
    UNIQUE INDEX `availability_overrides_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
