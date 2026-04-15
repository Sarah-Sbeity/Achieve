# Adding Arabic questions and text in the database

You can store Arabic translations in the database. When the user selects **العربية** in the app, the UI will use these values (and fall back to the frontend file `frontend/question-translations-ar.js` if a value is missing).

## Database columns

| Table           | Column    | Use for                          |
|----------------|-----------|-----------------------------------|
| SurveyQuestion | `labelAr` | Arabic text for the question     |
| SurveySection  | `titleAr` | Arabic title for the section      |
| SurveyDimension| `nameAr`  | Arabic name for the dimension     |

All are optional (nullable). Leave `NULL` if you don’t have a translation.

## How to add or edit Arabic in the database

### Option 1: Prisma Studio (easiest)

1. From the project root, run:
   ```powershell
   cd backend
   npx prisma studio
   ```
2. In the browser, open **SurveyQuestion** (or **SurveySection** / **SurveyDimension**).
3. Find the row and edit the **labelAr** (or **titleAr** / **nameAr**) field with your Arabic text.
4. Save.

### Option 2: SQL

If you use another SQLite client or the command line:

```sql
-- Example: set Arabic for one question (replace QUESTION_ID and the Arabic text)
UPDATE SurveyQuestion SET labelAr = 'النص العربي للسؤال' WHERE id = 'QUESTION_ID';

-- Example: set Arabic for a section
UPDATE SurveySection SET titleAr = 'الديموغرافيا' WHERE title = 'Demographic';

-- Example: set Arabic for a dimension
UPDATE SurveyDimension SET nameAr = 'القدرات والكفاءات' WHERE name = 'Capabilities & Competencies';
```

You can get question IDs from Prisma Studio or by querying `SELECT id, label FROM SurveyQuestion;`.

### Option 3: Seed or script

You can update questions in code (e.g. in a one-off script or in `prisma/seed.ts`) using Prisma:

```ts
await prisma.surveyQuestion.updateMany({
  where: { label: 'Job role' },
  data: { labelAr: 'الدور الوظيفي' },
});
```

## Behaviour

- **Survey form:** Section titles and question labels use `titleAr` / `labelAr` when the app language is Arabic and the value is set.
- **Dashboard, Insights, Recommendations:** Question labels, section titles, and dimension names use the DB Arabic when set and language is Arabic.
- **Fallback:** If a row has no Arabic in the DB, the app uses the translations in `frontend/question-translations-ar.js` (if defined there), otherwise the English text.

After changing the database, refresh the app (and switch to العربية if needed) to see the new text.
