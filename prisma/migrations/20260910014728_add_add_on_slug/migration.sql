/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `add_ons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `add_ons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `add_ons` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `add_ons_slug_key` ON `add_ons`(`slug`);
