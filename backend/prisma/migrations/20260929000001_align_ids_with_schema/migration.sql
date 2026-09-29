-- The initial migration created integer SERIAL ids, but schema.prisma uses String
-- UUID ids (and NewsArticle.imageUrl), so a fresh `prisma migrate deploy` produced
-- a database the app could not write to. This brings the tables in line with the schema.

-- DropForeignKey
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "NewsArticle" DROP CONSTRAINT "NewsArticle_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_articleId_fkey";

-- DropForeignKey
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_articleId_fkey";

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_categoryId_fkey";

-- AlterTable
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_pkey",
DROP COLUMN "id",
ALTER COLUMN "articleId" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("articleId", "categoryId");

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Category_id_seq";

-- AlterTable
ALTER TABLE "LoginHistory" DROP CONSTRAINT "LoginHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LoginHistory_id_seq";

-- AlterTable
ALTER TABLE "NewsArticle" DROP CONSTRAINT "NewsArticle_pkey",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ADD CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "NewsArticle_id_seq";

-- AlterTable
ALTER TABLE "Source" DROP CONSTRAINT "Source_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Source_id_seq";

-- AlterTable
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "articleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Summary_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Summary_id_seq";

-- AlterTable
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_pkey",
DROP COLUMN "id",
ALTER COLUMN "articleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("userId", "articleId", "interactionType");

-- AlterTable
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_pkey",
DROP COLUMN "id",
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

