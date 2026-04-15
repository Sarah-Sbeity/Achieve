// ============================================================
// Survey Platform – frontend config (copy to env.js)
// ============================================================
// 1. Copy this file to env.js:  cp env.example.js env.js
// 2. Set values below. Leave API_BASE unset to use same host as this page on port 3000.
//
// Backend API URL (optional). If the backend runs on a different host/port, set it here:
// window.API_BASE = "http://localhost:3000";
//
// ============================================================
// Microsoft Forms (or other form) embed URL
// ============================================================
//
// MICROSOFT FORMS:
// - Open your form at https://forms.office.com
// - Click "Collect responses" (or the share icon)
// - Choose "Get a link" or "Embed" and copy the iframe URL.
//   The embed URL looks like:
//   https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_FORM_ID
//   Add "&embed=true" for best display: ...aspx?id=YOUR_FORM_ID&embed=true
//
// Example (replace with your form ID):
window.NEXT_PUBLIC_SURVEY_EMBED_URL = "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_FORM_ID&embed=true";
