-- Satu akun hanya boleh memiliki satu bisnis.
-- Bisnis baru harus dibuat dari akun Google yang berbeda.
DROP INDEX IF EXISTS "businesses_user_id_idx";
CREATE UNIQUE INDEX "businesses_user_id_key" ON "businesses"("user_id");
