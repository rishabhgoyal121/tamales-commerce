-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "isNsfw" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isNsfw_idx" ON "Product"("isNsfw");
