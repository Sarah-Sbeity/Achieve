-- Add optional flag to control which demographic questions appear as filter dropdowns.
-- null or true = show in filters; false = hide from filters.
ALTER TABLE "SurveyQuestion" ADD COLUMN "showInFilters" INTEGER;
