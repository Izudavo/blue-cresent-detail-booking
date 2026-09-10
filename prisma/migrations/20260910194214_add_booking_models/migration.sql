-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `booking_reference` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `customer_phone` VARCHAR(191) NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_start_time` VARCHAR(191) NOT NULL,
    `appointment_end_time` VARCHAR(191) NOT NULL,
    `vehicle_type` ENUM('CARS', 'SUVS_TRUCKS') NOT NULL,
    `service_package_id` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `package_price` DECIMAL(10, 2) NOT NULL,
    `package_duration_minutes` INTEGER NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `customer_notes` TEXT NULL,
    `confirmed_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_booking_reference_key`(`booking_reference`),
    INDEX `bookings_appointment_date_status_idx`(`appointment_date`, `status`),
    INDEX `bookings_customer_email_idx`(`customer_email`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_service_package_id_idx`(`service_package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_add_ons` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `add_on_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `additional_minutes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_add_ons_booking_id_idx`(`booking_id`),
    INDEX `booking_add_ons_add_on_id_idx`(`add_on_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_vehicle_images` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `storage_key` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NULL,
    `content_type` VARCHAR(191) NULL,
    `file_size` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_vehicle_images_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_package_id_fkey` FOREIGN KEY (`service_package_id`) REFERENCES `service_packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_add_ons` ADD CONSTRAINT `booking_add_ons_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_add_ons` ADD CONSTRAINT `booking_add_ons_add_on_id_fkey` FOREIGN KEY (`add_on_id`) REFERENCES `add_ons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_vehicle_images` ADD CONSTRAINT `booking_vehicle_images_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
