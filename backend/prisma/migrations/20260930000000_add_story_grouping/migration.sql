-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "storyId" TEXT;

-- CreateIndex
CREATE INDEX "NewsArticle_storyId_idx" ON "NewsArticle"("storyId");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "NewsArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

