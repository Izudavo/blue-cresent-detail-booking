/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `service_packages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `service_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service_packages` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `service_packages_slug_key` ON `service_packages`(`slug`);
