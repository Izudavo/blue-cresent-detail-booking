/*
  Warnings:

  - Added the required column `vehicle_details` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `vehicle_details` VARCHAR(191) NOT NULL;
