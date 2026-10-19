/*
  Warnings:

  - You are about to drop the column `auth_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `token_expires_at` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_auth_token_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "auth_token",
DROP COLUMN "password_hash",
DROP COLUMN "token_expires_at";
