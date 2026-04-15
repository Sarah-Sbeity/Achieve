-- Fix foreign key between SurveyQuestion and SurveyDimension (and SurveySection)
-- by recreating SurveyQuestion with proper REFERENCES. Orphaned ids are set to NULL.

PRAGMA foreign_keys = OFF;

-- Recreate SurveyQuestion with explicit foreign keys
CREATE TABLE "SurveyQuestion_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT,
    "dimensionId" TEXT,
    CONSTRAINT "SurveyQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SurveySection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SurveyQuestion_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "SurveyDimension" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data: only keep sectionId/dimensionId if they exist in the referenced tables
INSERT INTO "SurveyQuestion_new" ("id", "label", "type", "options", "order", "sectionId", "dimensionId")
SELECT
    q."id",
    q."label",
    q."type",
    q."options",
    q."order",
    CASE WHEN s."id" IS NOT NULL THEN q."sectionId" ELSE NULL END,
    CASE WHEN d."id" IS NOT NULL THEN q."dimensionId" ELSE NULL END
FROM "SurveyQuestion" q
LEFT JOIN "SurveySection" s ON s."id" = q."sectionId"
LEFT JOIN "SurveyDimension" d ON d."id" = q."dimensionId";

DROP TABLE "SurveyQuestion";
ALTER TABLE "SurveyQuestion_new" RENAME TO "SurveyQuestion";

PRAGMA foreign_keys = ON;
