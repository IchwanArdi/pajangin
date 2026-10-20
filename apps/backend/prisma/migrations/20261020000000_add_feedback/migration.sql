-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('masukan', 'kritik', 'bug', 'lainnya');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('baru', 'dibaca', 'selesai');

-- CreateEnum
CREATE TYPE "FeedbackSource" AS ENUM ('dashboard', 'public');

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "user_name" TEXT,
    "user_email" TEXT,
    "user_whatsapp" TEXT,
    "business_id" UUID,
    "business_name" TEXT,
    "source" "FeedbackSource" NOT NULL DEFAULT 'dashboard',
    "category" "FeedbackCategory" NOT NULL DEFAULT 'masukan',
    "rating" INTEGER,
    "message" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'baru',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at");

-- CreateIndex
CREATE INDEX "feedback_category_created_at_idx" ON "feedback"("category", "created_at");

-- CreateIndex
CREATE INDEX "feedback_user_id_created_at_idx" ON "feedback"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "feedback_created_at_idx" ON "feedback"("created_at");
