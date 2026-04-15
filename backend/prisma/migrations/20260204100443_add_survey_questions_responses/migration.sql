-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
