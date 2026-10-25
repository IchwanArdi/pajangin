-- Migration penyusul: tabel dan kolom ini sebelumnya dibuat langsung di database
-- development tanpa tercatat di folder migrations. Migration ini membuat schema
-- yang sama dari nol untuk environment baru.

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "theme_color" TEXT;

-- CreateTable
CREATE TABLE "business_images" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "category" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "service_id" TEXT,
    "service_name" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "date" DATE NOT NULL,
    "time_slot" TEXT NOT NULL,
    "pax" INTEGER DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_images_business_id_order_index_idx" ON "business_images"("business_id", "order_index");

-- CreateIndex
CREATE INDEX "bookings_business_id_created_at_idx" ON "bookings"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_business_id_date_idx" ON "bookings"("business_id", "date");

-- CreateIndex
CREATE INDEX "bookings_business_id_status_idx" ON "bookings"("business_id", "status");

-- AddForeignKey
ALTER TABLE "business_images" ADD CONSTRAINT "business_images_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
