/**
 * =============================================================================
 * HOW TO ADD ARABIC QUESTIONS AND TRANSLATE OPTIONS
 * =============================================================================
 *
 * 1) ADD ARABIC QUESTION TEXT (the question label that appears above the field)
 *    → Use the object SURVEY_QUESTIONS_AR below.
 *    → The KEY must be exactly the same as the English text in your survey
 *      (e.g. if the backend has "Job role", the key is "Job role" in quotes).
 *    → The VALUE is your Arabic translation.
 *
 *    Example:
 *      "Job role": "الدور الوظيفي",
 *      "Question 9": "ما مدى موافقتك على أن البنية التحتية تدعم العمل بفعالية؟",
 *
 * 2) TRANSLATE OPTIONS (dropdown choices for select questions)
 *    → Use the object SURVEY_OPTIONS_AR below.
 *    → The KEY is the exact English option text (as stored in the backend).
 *    → The VALUE is the Arabic text shown in the dropdown.
 *
 *    Example (Job role options):
 *      "Individual contributor": "مساهم فردي",
 *      "Manager": "مدير",
 *
 *    Example (Gender options):
 *      "Male": "ذكر",
 *      "Female": "أنثى",
 *
 *    Add one line per option. Options are used in:
 *    - The survey form (dropdowns)
 *    - Dashboard/Insights/Recommendations filters (slicer dropdowns)
 *
 * 3) SECTION TITLES (e.g. "Demographic", "Organizational Infrastructure")
 *    → Use SURVEY_SECTIONS_AR. Key = English section title, value = Arabic.
 *
 * 4) DIMENSION NAMES (for dashboard/recommendations)
 *    → Use SURVEY_DIMENSIONS_AR. Key = English dimension name, value = Arabic.
 *
 * When the user selects العربية in the app, these strings are used automatically.
 * If a key is missing, the English text is shown.
 * =============================================================================
 */

// ----- 1) QUESTION LABELS -----
// Key = exact English question label from your survey. Value = Arabic text.
window.SURVEY_QUESTIONS_AR = {
  // Demographic questions
  "Job role": "الدور الوظيفي",
  "Department": "القسم",
  "Tenure": "مدة العمل",
  "Level": "المستوى",
  "Employment type": "نوع التوظيف",
  "Age group": "الفئة العمرية",
  "Gender": "الجنس",
  "Region": "المنطقة",
  // Scale questions (Question 9 … Question 50) – add your real Arabic qu
  "Question 9": "السؤال ٩",
  "Question 10": "السؤال ١٠"
  // Add more lines above (with a comma after "Question 10"): "Question 11": "نص السؤال بالعربية", etc.
};

// ----- 2) SECTION TITLES -----
window.SURVEY_SECTIONS_AR = {
  "Demographic": "الديموغرافيا",
  "Organizational Infrastructure": "البنية التحتية التنظيمية"
};

// ----- 3) DIMENSION NAMES -----
window.SURVEY_DIMENSIONS_AR = {
  "Capabilities & Competencies": "القدرات والكفاءات",
  "Process & Governance": "العمليات والحوكمة",
  "Technology & Tools": "التكنولوجيا والأدوات"
};

// ----- 4) OPTIONS FOR QUESTIONS (dropdown choices) -----
// Key = exact English option text. Value = Arabic text shown in the dropdown.
// Add every option that appears in your select questions (Job role, Tenure, Level, etc.).
window.SURVEY_OPTIONS_AR = {
  "Individual contributor": "مساهم فردي",
  "Team lead": "قائد فريق",
  "Manager": "مدير",
  "Director": "مدير تنفيذي",
  "Executive": "تنفيذي",
  "Other": "أخرى",
  "Less than 1 year": "أقل من سنة",
  "1–3 years": "١–٣ سنوات",
  "3–5 years": "٣–٥ سنوات",
  "5+ years": "٥+ سنوات",
  "Junior": "مبتدئ",
  "Mid": "متوسط",
  "Senior": "أقدم",
  "Lead": "قائد",
  "Full-time": "دوام كامل",
  "Part-time": "دوام جزئي",
  "Contract": "عقد",
  "18–24": "١٨–٢٤",
  "25–34": "٢٥–٣٤",
  "35–44": "٣٥–٤٤",
  "45–54": "٤٥–٥٤",
  "55+": "٥٥+",
  "Male": "ذكر",
  "Female": "أنثى",
  "Non-binary": "غير ثنائي",
  "Prefer not to say": "أفضل عدم الإجابة",
  "(blank)": "(فارغ)"
};
