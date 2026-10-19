/*
  Warnings:

  - Made the column `booking_enabled` on table `businesses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "businesses" ALTER COLUMN "booking_enabled" SET NOT NULL;
