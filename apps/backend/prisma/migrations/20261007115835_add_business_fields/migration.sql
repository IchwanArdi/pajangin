-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "faq" TEXT,
ADD COLUMN     "price_range" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "review_count" INTEGER,
ADD COLUMN     "service_area" TEXT;
