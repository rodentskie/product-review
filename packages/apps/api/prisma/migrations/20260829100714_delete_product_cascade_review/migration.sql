-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_productId_fkey";

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
