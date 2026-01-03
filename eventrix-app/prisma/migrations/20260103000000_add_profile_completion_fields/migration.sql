-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "college" TEXT,
ADD COLUMN     "yearOfStudy" TEXT,
ADD COLUMN     "department" TEXT;

-- CreateIndex
CREATE INDEX "users_profileCompleted_idx" ON "users"("profileCompleted");
