-- AlterTable (SQLite does not support ADD CONSTRAINT for FKs; relation is in Prisma schema)
ALTER TABLE "SurveyResponse" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_userId_key" ON "SurveyResponse"("userId");
