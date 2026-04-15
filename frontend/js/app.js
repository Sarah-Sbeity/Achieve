      // When hosting: set window.API_BASE in env.js, or we use same host as this page with port 3000
      const API_BASE = (typeof window !== "undefined" && window.API_BASE) ? window.API_BASE : ("http://" + (typeof window !== "undefined" && window.location && window.location.hostname ? window.location.hostname : "localhost") + ":3000");
      window.addEventListener("error", function (e) {
        console.error("Uncaught error:", e.message, e.filename, e.lineno);
        if (e.message && (e.message.indexOf("Script") !== -1 || e.message.indexOf("Out of memory") !== -1)) {
          var el = document.getElementById("view-survey") || document.querySelector(".main");
          if (el && !document.querySelector(".app-error-banner")) {
            var banner = document.createElement("div");
            banner.className = "app-error-banner";
            banner.setAttribute("style", "padding:16px 20px;margin:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#b91c1c;");
            banner.innerHTML = "Something went wrong. Try refreshing the page or clearing your browser cache.";
            el.insertBefore(banner, el.firstChild);
          }
        }
      });
      var SURVEY_EMBED_URL = typeof window.NEXT_PUBLIC_SURVEY_EMBED_URL !== "undefined" ? window.NEXT_PUBLIC_SURVEY_EMBED_URL : "";

      // Which layers to show in the dashboard "Score by Layer" table. Empty = show all.
      // Use layerLabel (e.g. "Layer 1") or layerTitle (e.g. "Organizational Infrastructure") â€“ matches either.
      var DASHBOARD_LAYER_FILTER = ["Layer 1","Layer 2","Layer 3","Layer 4"];
      // Which demographic questions show as filter dropdowns. Empty = show all. Use question labels (e.g. "Employment type", "Department") or question IDs.
      var DEMOGRAPHIC_FILTER_QUESTIONS = [];
      var dashboardDemographicFilters = {};

      function demographicFiltersToShow(demographics) {
        if (!demographics || !demographics.length) return demographics || [];
        if (!DEMOGRAPHIC_FILTER_QUESTIONS || DEMOGRAPHIC_FILTER_QUESTIONS.length === 0) return demographics;
        return demographics.filter(function (d) {
          return DEMOGRAPHIC_FILTER_QUESTIONS.indexOf(d.label) !== -1 || DEMOGRAPHIC_FILTER_QUESTIONS.indexOf(d.questionId) !== -1;
        });
      }

      // Language
      var LANG_STORAGE_KEY = "survey-platform-lang";
      var currentLang = (typeof localStorage !== "undefined" && localStorage.getItem(LANG_STORAGE_KEY)) || "en";
      var translations = {
        en: {
          navSurvey: "Survey", navReports: "Reports", navDashboard: "Dashboard", navInsights: "Insights", navRecommendations: "Recommendations", navCharts: "Charts", navUsers: "Users", navAccount: "Account", navLogout: "Logout",
          langLabel: "Language",
          titleLogin: "Login", subtitleLogin: "Access dashboards and reports", labelEmail: "Email", labelPassword: "Password", showPassword: "Show Password", forgotPrompt: "Forgot ", forgotLink: "Username / Password?", btnSignIn: "Sign in", toggleNotUser: "Don't have an account? ", linkSignUp: "Sign up", titleSignUp: "Sign up", btnCreateAccount: "Create account", toggleHaveAccount: "Already have an account? ", linkLogIn: "Log in",
          titleSurvey: "Achieve", subtitleSurvey: "Share your perspective to help understand organizational readiness.", surveyAnonymous: "Your responses are anonymous.",
          titleAnalytics: "Benchmarking Survey", subtitleAnalytics: "Overview, detailed results, insights, and recommendationsâ€”all for the same selected scope.",
          tabOverview: "Overview", tabDetailedResults: "Results", tabInsights: "Insights", tabRecommendations: "Recommendations", treeScope: "Scope", treeAll: "All", scopeHintDimension: "Select a dimension to see questions.", scopeHintQuestion: "Open a question in the list for detail.",
          titleDashboard: "Dashboard", subtitleDashboard: "Average scores over 100. Questions marked (R) use reversed scoring. Use filters to slice by demographic.",
          navAnalytics: "Analytics",
          titleInsights: "Insights", subtitleInsights: "Explore relationships between scale questions. Use filters to slice by demographic.",
          titleRecommendations: "Recommendations", subtitleRecommendations: "Actionable insights from your OSR dataâ€”where to focus and how to improve. Filter by demographic to drill down.",
          titleCharts: "Charts & comparisons", subtitleCharts: "Compare scores over time, by industry, and by demographic groups.",
          chartsCompareBy: "Compare by:", chartsOverTime: "Scores over time", chartsOverTimeDesc: "Overall index by month (previous vs current periods).",
          chartsByGroup: "Comparison by group", chartsByGroupDesc: "Overall score compared across selected demographic (e.g. industry or department).",
          chartsByLayer: "Scores by layer across groups", chartsByLayerDesc: "Average score per section/layer for each demographic group.",
          chartsJointTitle: "Joint analysis by demographics", chartsJointDesc: "Cross-tabulation: scores and response counts by two demographics (e.g. Industry Ã— Department).",
          chartsJointFirst: "First demographic (rows):", chartsJointSecond: "Second demographic (columns):", chartsJointCount: "N",
          titleUsers: "Users", subtitleUsers: "Invite users by link. You can send the link by email or copy it.", inviteUser: "Invite user", labelRole: "Role",
          roleViewer: "Viewer", roleAnalyst: "Editor", roleAdmin: "Admin", sendInviteByEmail: " Send invite link by email", sendInvite: "Send invite", inviteLinkLabel: "Invite link (copy and share):",
          allUsers: "All users", setPassword: "Set your password", subtitleInvite: "You've been invited. Choose a password to activate your account.", confirmPassword: "Confirm password", activateAccount: "Activate account",
          accessDenied: "Access denied", forbiddenMsg: "You don't have permission to view this page.", goToSurvey: "Go to Achieve",
          scoreByLayer: "Score by Layer", scoreByDimension: "Score by Dimension", scoreByQuestion: "Score by Individual Question", layer: "Layer", dimension: "Dimension", question: "Question", score: "Score",
          distributionLabel: "Likert distribution", pctFavorable: "Favorable", pctNeutral: "Neutral", pctUnfavorable: "Unfavorable", trendLabel: "Trend vs previous period", benchmarkGapLabel: "Benchmark gap",
          compareVsPreviousPeriod: "Compare vs previous period", compareVsBenchmarkCohort: "Compare vs benchmark cohort (if available)", compareVsPreviousTitle: "Vs previous period", benchmarkCohortNote: "Benchmark cohort comparison will appear here when available.",
          insightsWhatWeSee: "What we see", insightsWhyItMatters: "Why it matters", insightsSegmentsToWatch: "Segments to watch", insightsConfidence: "Confidence",
          drawerGenerateInsights: "Generate insights for this question", drawerGenerateRecommendations: "Generate recommendations", drawerWhyMattersPlaceholder: "Generate insights to see why this question matters.",
          recRecommendedActions: "Recommended actions", recQuickWins: "Quick wins", recStrategicInitiatives: "Strategic initiatives", recSuccessMetrics: "Success metrics", recScope: "Scope",
          insightSummary: "Insight Summary", actionPlan: "Action Plan", recAction: "Action", recOwner: "Owner", recTimeframe: "Timeframe", recEffort: "Effort", recImpact: "Impact", recMetrics: "Metrics", recRationale: "Rationale", recEvidence: "Evidence",
          responseRate: "Response rate", basedOnResponses: "Based on {count} response(s).", demographicBreakdown: "Demographic breakdown", showing: "Showing", clearAll: "Clear all",
          noResponses: "No responses.", noResponsesMatch: "No responses match the current filters.", noResponsesYet: "No responses yet. Insights will appear here once people complete the Achieve.",
          insufficientSample: "Insufficient sample",
          exportScores: "Export scores (CSV)", exportInsights: "Export insights (CSV)",
          consentIntro: "Before you begin, please read and agree to the following.",
          consentText: "By continuing, you confirm that you have read this and agree to participate. Your responses will be collected <strong>anonymously</strong> and used only in aggregate to understand organizational strengths and areas for improvement. No individual responses will be shared or identified. The survey takes approximately 10â€“12 minutes to complete. There are no right or wrong answers, we are interested in your honest perspective.",
          consentCheck: "I agree to participate and consent to the use of my anonymous responses for organizational insights.",
          consentBtn: "Start survey",
          alreadyCompleted: "You have already completed this survey. Only one response per participant is allowed.",
          surveyThanksAlready: "Thank you. Your response has already been recorded.",
          surveyRequired: "This question is required.",
          surveyRequiredAll: "Please answer all required questions below."
        },
        ar: {
          navSurvey: "Ø§Ù„Ø§Ø³ØªØ¨ÙŠØ§Ù†", navReports: "Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±", navDashboard: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…", navInsights: "Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª", navRecommendations: "Ø§Ù„ØªÙˆØµÙŠØ§Øª", navCharts: "Ø§Ù„Ø±Ø³ÙˆÙ… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ©", navUsers: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†", navAccount: "Ø§Ù„Ø­Ø³Ø§Ø¨", navLogout: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬",
          langLabel: "Ø§Ù„Ù„ØºØ©",
          titleLogin: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", subtitleLogin: "Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø§Øª Ø§Ù„ØªØ­ÙƒÙ… ÙˆØ§Ù„ØªÙ‚Ø§Ø±ÙŠØ±", labelEmail: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", labelPassword: "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", showPassword: "Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", forgotPrompt: "Ù†Ø³ÙŠØª ", forgotLink: "Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… / ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ", btnSignIn: "Ø¯Ø®ÙˆÙ„", toggleNotUser: "Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ ", linkSignUp: "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨", titleSignUp: "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨", btnCreateAccount: "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨", toggleHaveAccount: "Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ ", linkLogIn: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„",
          titleSurvey: "Ù†Ù…ÙˆØ°Ø¬ OSR", subtitleSurvey: "Ø´Ø§Ø±Ùƒ ÙˆØ¬Ù‡Ø© Ù†Ø¸Ø±Ùƒ Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© ÙÙŠ ÙÙ‡Ù… Ø§Ù„Ø¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØ©.", surveyAnonymous: "Ø¥Ø¬Ø§Ø¨Ø§ØªÙƒ Ù…Ø¬Ù‡ÙˆÙ„Ø© Ø§Ù„Ù‡ÙˆÙŠØ©.",
          titleAnalytics: "Ù…Ø³Ø­ Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ±", subtitleAnalytics: "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©ØŒ Ù†ØªØ§Ø¦Ø¬ Ù…ÙØµÙ„Ø©ØŒ Ø±Ø¤Ù‰ ÙˆØªÙˆØµÙŠØ§Øªâ€”ÙƒÙ„Ù‡Ø§ Ù„Ù†ÙØ³ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø­Ø¯Ø¯.",
          tabOverview: "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©", tabDetailedResults: "Ù†ØªØ§Ø¦Ø¬", tabInsights: "Ø§Ù„Ø±Ø¤Ù‰", tabRecommendations: "Ø§Ù„ØªÙˆØµÙŠØ§Øª", treeScope: "Ø§Ù„Ù†Ø·Ø§Ù‚", treeAll: "Ø§Ù„ÙƒÙ„", scopeHintDimension: "Ø§Ø®ØªØ± Ø¨ÙØ¹Ø¯Ø§Ù‹ Ù„Ø±Ø¤ÙŠØ© Ø§Ù„Ø£Ø³Ø¦Ù„Ø©.", scopeHintQuestion: "Ø§ÙØªØ­ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ù„Ù„ØªÙØ§ØµÙŠÙ„.", navAnalytics: "Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª",
          titleDashboard: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…", subtitleDashboard: "Ù…ØªÙˆØ³Ø· Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ù…Ù† 100. Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…ÙˆØ³ÙˆÙ…Ø© (R) ØªØ³ØªØ®Ø¯Ù… ØªØ³Ø¬ÙŠÙ„Ø§Ù‹ Ù…Ø¹ÙƒÙˆØ³Ø§Ù‹. Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„ÙÙ„Ø§ØªØ± Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§.",
          titleInsights: "Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª", subtitleInsights: "Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø¹Ù„Ø§Ù‚Ø§Øª Ø¨ÙŠÙ† Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…Ù‚ÙŠØ§Ø³. Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„ÙÙ„Ø§ØªØ± Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§.",
          titleRecommendations: "Ø§Ù„ØªÙˆØµÙŠØ§Øª", subtitleRecommendations: "Ø±Ø¤Ù‰ Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ·Ø¨ÙŠÙ‚ Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª OSRâ€”Ø£ÙŠÙ† ØªØ±ÙƒØ² ÙˆÙƒÙŠÙ ØªØ­Ø³Ù‘Ù†. ÙÙ„ØªØ± Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§ Ù„Ù„ØªØ¹Ù…Ù‚.",
          titleCharts: "Ø§Ù„Ø±Ø³ÙˆÙ… Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© ÙˆØ§Ù„Ù…Ù‚Ø§Ø±Ù†Ø§Øª", subtitleCharts: "Ù‚Ø§Ø±Ù† Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø¹Ø¨Ø± Ø§Ù„Ø²Ù…Ù†ØŒ Ø­Ø³Ø¨ Ø§Ù„Ù‚Ø·Ø§Ø¹ØŒ ÙˆØ­Ø³Ø¨ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ©.",
          chartsCompareBy: "Ù‚Ø§Ø±Ù† Ø­Ø³Ø¨:", chartsOverTime: "Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø¹Ø¨Ø± Ø§Ù„Ø²Ù…Ù†", chartsOverTimeDesc: "Ø§Ù„Ù…Ø¤Ø´Ø± Ø§Ù„Ø¹Ø§Ù… Ø­Ø³Ø¨ Ø§Ù„Ø´Ù‡Ø± (ÙØªØ±Ø§Øª Ø³Ø§Ø¨Ù‚Ø© ÙˆØ­Ø§Ù„ÙŠØ©).",
          chartsByGroup: "Ø§Ù„Ù…Ù‚Ø§Ø±Ù†Ø© Ø­Ø³Ø¨ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©", chartsByGroupDesc: "Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù…Ù‚Ø§Ø±Ù†Ø© Ø¨Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© (Ù…Ø«Ù„Ø§Ù‹ Ø§Ù„Ù‚Ø·Ø§Ø¹ Ø£Ùˆ Ø§Ù„Ù‚Ø³Ù…).",
          chartsByLayer: "Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø­Ø³Ø¨ Ø§Ù„Ø·Ø¨Ù‚Ø© Ø¹Ø¨Ø± Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª", chartsByLayerDesc: "Ù…ØªÙˆØ³Ø· Ø§Ù„Ø¯Ø±Ø¬Ø© Ù„ÙƒÙ„ Ù‚Ø³Ù…/Ø·Ø¨Ù‚Ø© Ù„ÙƒÙ„ Ù…Ø¬Ù…ÙˆØ¹Ø© Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ©.",
          chartsJointTitle: "Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø´ØªØ±Ùƒ Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§", chartsJointDesc: "Ø¬Ø¯ÙˆÙ„ ØªÙ‚Ø§Ø·Ø¹ÙŠ: Ø§Ù„Ø¯Ø±Ø¬Ø§Øª ÙˆØ¹Ø¯Ø¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø­Ø³Ø¨ Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØªÙŠÙ† (Ù…Ø«Ù„Ø§Ù‹ Ø§Ù„Ù‚Ø·Ø§Ø¹ Ã— Ø§Ù„Ù‚Ø³Ù…).",
          chartsJointFirst: "Ø£ÙˆÙ„ Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§ (ØµÙÙˆÙ):", chartsJointSecond: "Ø«Ø§Ù†ÙŠ Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠØ§ (Ø£Ø¹Ù…Ø¯Ø©):", chartsJointCount: "Ù†",
          titleUsers: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†", subtitleUsers: "Ø§Ø¯Ø¹Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¹Ø¨Ø± Ø§Ù„Ø±Ø§Ø¨Ø·. ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø§Ø¨Ø· Ø¨Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø£Ùˆ Ù†Ø³Ø®Ù‡.", inviteUser: "Ø¯Ø¹ÙˆØ© Ù…Ø³ØªØ®Ø¯Ù…", labelRole: "Ø§Ù„Ø¯ÙˆØ±",
          roleViewer: "Ø¹Ø§Ø±Ø¶", roleAnalyst: "Ù…Ø­Ø±Ø±", roleAdmin: "Ù…Ø¯ÙŠØ±", sendInviteByEmail: " Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Ø§Ù„Ø¯Ø¹ÙˆØ© Ø¨Ø§Ù„Ø¨Ø±ÙŠØ¯", sendInvite: "Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¯Ø¹ÙˆØ©", inviteLinkLabel: "Ø±Ø§Ø¨Ø· Ø§Ù„Ø¯Ø¹ÙˆØ© (Ø§Ù†Ø³Ø® ÙˆØ´Ø§Ø±Ùƒ):",
          allUsers: "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†", setPassword: "ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", subtitleInvite: "ØªÙ…Øª Ø¯Ø¹ÙˆØªÙƒ. Ø§Ø®ØªØ± ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ù„ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ.", confirmPassword: "ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", activateAccount: "ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨",
          accessDenied: "Ø§Ù„ÙˆØµÙˆÙ„ Ù…Ø±ÙÙˆØ¶", forbiddenMsg: "Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¹Ø±Ø¶ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©.", goToSurvey: "Ø§Ù„Ø°Ù‡Ø§Ø¨ Ø¥Ù„Ù‰ Ù†Ù…ÙˆØ°Ø¬ OSR",
          scoreByLayer: "Ø§Ù„Ø¯Ø±Ø¬Ø© Ø­Ø³Ø¨ Ø§Ù„Ø·Ø¨Ù‚Ø©", scoreByDimension: "Ø§Ù„Ø¯Ø±Ø¬Ø© Ø­Ø³Ø¨ Ø§Ù„Ø¨Ø¹Ø¯", scoreByQuestion: "Ø§Ù„Ø¯Ø±Ø¬Ø© Ø­Ø³Ø¨ Ø§Ù„Ø³Ø¤Ø§Ù„", layer: "Ø§Ù„Ø·Ø¨Ù‚Ø©", dimension: "Ø§Ù„Ø¨Ø¹Ø¯", question: "Ø§Ù„Ø³Ø¤Ø§Ù„", score: "Ø§Ù„Ø¯Ø±Ø¬Ø©",
          distributionLabel: "ØªÙˆØ²ÙŠØ¹ Ù„ÙŠÙƒØ±Øª", pctFavorable: "Ø¥ÙŠØ¬Ø§Ø¨ÙŠ", pctNeutral: "Ù…Ø­Ø§ÙŠØ¯", pctUnfavorable: "Ø³Ù„Ø¨ÙŠ", trendLabel: "Ø§Ù„Ø§ØªØ¬Ø§Ù‡ Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„ÙØªØ±Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©", benchmarkGapLabel: "ÙØ¬ÙˆØ© Ø§Ù„Ù…Ø¹ÙŠØ§Ø±",
          compareVsPreviousPeriod: "Ù‚Ø§Ø±Ù† Ù…Ø¹ Ø§Ù„ÙØªØ±Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©", compareVsBenchmarkCohort: "Ù‚Ø§Ø±Ù† Ù…Ø¹ Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ± (Ø¥Ù† ÙˆÙØ¬Ø¯Øª)", compareVsPreviousTitle: "Ù…Ø¹ Ø§Ù„ÙØªØ±Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©", benchmarkCohortNote: "Ù…Ù‚Ø§Ø±Ù†Ø© Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø¹Ù†Ø¯ ØªÙˆÙØ±Ù‡Ø§.",
          insightsWhatWeSee: "Ù…Ø§ Ù†Ø±Ø§Ù‡", insightsWhyItMatters: "Ù„Ù…Ø§Ø°Ø§ ÙŠÙ‡Ù…", insightsSegmentsToWatch: "Ø´Ø±Ø§Ø¦Ø­ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©", insightsConfidence: "Ø§Ù„Ø«Ù‚Ø©",
          drawerGenerateInsights: "ØªÙˆÙ„ÙŠØ¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø³Ø¤Ø§Ù„", drawerGenerateRecommendations: "ØªÙˆÙ„ÙŠØ¯ Ø§Ù„ØªÙˆØµÙŠØ§Øª", drawerWhyMattersPlaceholder: "ÙˆÙ„Ù‘Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ù„Ù…Ø¹Ø±ÙØ© Ù„Ù…Ø§Ø°Ø§ ÙŠÙ‡Ù… Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„.",
          recRecommendedActions: "Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…ÙˆØµÙ‰ Ø¨Ù‡Ø§", recQuickWins: "Ù…ÙƒØ§Ø³Ø¨ Ø³Ø±ÙŠØ¹Ø©", recStrategicInitiatives: "Ù…Ø¨Ø§Ø¯Ø±Ø§Øª Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©", recSuccessMetrics: "Ù…Ù‚Ø§ÙŠÙŠØ³ Ø§Ù„Ù†Ø¬Ø§Ø­", recScope: "Ø§Ù„Ù†Ø·Ø§Ù‚",
          insightSummary: "Ù…Ù„Ø®Øµ Ø§Ù„ØªØ­Ù„ÙŠÙ„", actionPlan: "Ø®Ø·Ø© Ø§Ù„Ø¹Ù…Ù„", recAction: "Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡", recOwner: "Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„", recTimeframe: "Ø§Ù„Ø²Ù…Ù†", recEffort: "Ø§Ù„Ø¬Ù‡Ø¯", recImpact: "Ø§Ù„ØªØ£Ø«ÙŠØ±", recMetrics: "Ø§Ù„Ù…Ù‚Ø§ÙŠÙŠØ³", recRationale: "Ø§Ù„Ù…Ø¨Ø±Ø±", recEvidence: "Ø§Ù„Ø¯Ù„ÙŠÙ„",
          responseRate: "Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©", basedOnResponses: "Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ {count} Ø¥Ø¬Ø§Ø¨Ø©.", demographicBreakdown: "Ø§Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¯ÙŠÙ…ÙˆØºØ±Ø§ÙÙŠ", showing: "Ø¹Ø±Ø¶", clearAll: "Ù…Ø³Ø­ Ø§Ù„ÙƒÙ„",
          noResponses: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø§Øª.", noResponsesMatch: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø§Øª ØªØ·Ø§Ø¨Ù‚ Ø§Ù„ÙÙ„Ø§ØªØ± Ø§Ù„Ø­Ø§Ù„ÙŠØ©.", noResponsesYet: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø§Øª Ø¨Ø¹Ø¯. Ø³ØªØ¸Ù‡Ø± Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ø¹Ù†Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ù†Ù…ÙˆØ°Ø¬ OSR.",
          insufficientSample: "Ø¹ÙŠÙ†Ø© ØºÙŠØ± ÙƒØ§ÙÙŠØ©",
          exportScores: "ØªØµØ¯ÙŠØ± Ø§Ù„Ø¯Ø±Ø¬Ø§Øª (CSV)", exportInsights: "ØªØµØ¯ÙŠØ± Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª (CSV)",
          consentIntro: "Ù‚Ø¨Ù„ Ø£Ù† ØªØ¨Ø¯Ø£ØŒ ÙŠØ±Ø¬Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„ØªØ§Ù„ÙŠØ© ÙˆØ§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„ÙŠÙ‡Ø§.",
          consentText: "Ø¨Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŒ ØªØ¤ÙƒØ¯ Ø£Ù†Ùƒ Ù‚Ø±Ø£Øª Ù‡Ø°Ø§ ÙˆÙ…ÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©. Ø³ÙŠØªÙ… Ø¬Ù…Ø¹ Ø¥Ø¬Ø§Ø¨Ø§ØªÙƒ <strong>Ø¨Ø´ÙƒÙ„ Ù…Ø¬Ù‡ÙˆÙ„</strong> ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙÙ‚Ø· Ø¨Ø´ÙƒÙ„ Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù„ÙÙ‡Ù… Ù†Ù‚Ø§Ø· Ø§Ù„Ù‚ÙˆØ© ÙˆØ§Ù„ØªØ­Ø³ÙŠÙ† ÙÙŠ Ø§Ù„Ù…Ù†Ø¸Ù…Ø©. Ù„Ù† ØªØªÙ… Ù…Ø´Ø§Ø±ÙƒØ© Ø£Ùˆ ØªØ­Ø¯ÙŠØ¯ Ø£ÙŠ Ø¥Ø¬Ø§Ø¨Ø§Øª ÙØ±Ø¯ÙŠØ©. ÙŠØ³ØªØºØ±Ù‚ Ø§Ù„Ø§Ø³ØªØ¨ÙŠØ§Ù† Ø­ÙˆØ§Ù„ÙŠ Ù¡Ù â€“Ù¡Ù¢ Ø¯Ù‚ÙŠÙ‚Ø©. Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø§Øª ØµØ­ÙŠØ­Ø© Ø£Ùˆ Ø®Ø§Ø·Ø¦Ø©ØŒ Ù†Ø­Ù† Ù…Ù‡ØªÙ…ÙˆÙ† Ø¨ÙˆØ¬Ù‡Ø© Ù†Ø¸Ø±Ùƒ Ø§Ù„ØµØ±ÙŠØ­Ø©.",
          consentCheck: "Ø£ÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙˆØ§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¥Ø¬Ø§Ø¨Ø§ØªÙŠ Ø§Ù„Ù…Ø¬Ù‡ÙˆÙ„Ø© Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª ØªÙ†Ø¸ÙŠÙ…ÙŠØ©.",
          consentBtn: "Ø¨Ø¯Ø¡ Ø§Ù„Ø§Ø³ØªØ¨ÙŠØ§Ù†",
          alreadyCompleted: "Ù„Ù‚Ø¯ Ø£ØªÙ…Ù…Øª Ù‡Ø°Ø§ Ø§Ù„Ø§Ø³ØªØ¨ÙŠØ§Ù† Ù…Ø³Ø¨Ù‚Ø§Ù‹. ÙŠÙØ³Ù…Ø­ Ø¨Ø¥Ø¬Ø§Ø¨Ø© ÙˆØ§Ø­Ø¯Ø© ÙÙ‚Ø· Ù„ÙƒÙ„ Ù…Ø´Ø§Ø±Ùƒ.",
          surveyThanksAlready: "Ø´ÙƒØ±Ø§Ù‹ Ù„Ùƒ. ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø¥Ø¬Ø§Ø¨ØªÙƒ Ù…Ø³Ø¨Ù‚Ø§Ù‹.",
          surveyRequired: "Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„ Ù…Ø·Ù„ÙˆØ¨.",
          surveyRequiredAll: "ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ø£Ø¯Ù†Ø§Ù‡."
        }
      };
      function t(key, params) {
        var s = (translations[currentLang] && translations[currentLang][key]) || (translations.en && translations.en[key]) || key;
        if (params && typeof s === "string") {
          Object.keys(params).forEach(function (k) { s = s.replace(new RegExp("\\{" + k + "\\}", "g"), params[k]); });
        }
        return s;
      }
      function trQuestionLabel(en, arFromDb) { if (!en) return en; if (currentLang === "ar" && arFromDb) return arFromDb; if (currentLang !== "ar") return en; return (window.SURVEY_QUESTIONS_AR && window.SURVEY_QUESTIONS_AR[en]) || en; }
      function trSectionTitle(en, arFromDb) { if (!en) return en; if (currentLang === "ar" && arFromDb) return arFromDb; if (currentLang !== "ar") return en; return (window.SURVEY_SECTIONS_AR && window.SURVEY_SECTIONS_AR[en]) || en; }
      function trDimensionName(en, arFromDb) { if (!en) return en; if (currentLang === "ar" && arFromDb) return arFromDb; if (currentLang !== "ar") return en; return (window.SURVEY_DIMENSIONS_AR && window.SURVEY_DIMENSIONS_AR[en]) || en; }
      function trOption(en) { if (!en || currentLang !== "ar" || !window.SURVEY_OPTIONS_AR) return en; return window.SURVEY_OPTIONS_AR[en] || en; }
      function applyTranslations() {
        var isRtl = currentLang === "ar";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.lang = isRtl ? "ar" : "en";
        document.body.classList.toggle("rtl", isRtl);
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
          var key = el.getAttribute("data-i18n");
          if (key && t(key)) el.textContent = t(key);
        });
        document.querySelectorAll(".navbar-lang-btn, .user-menu-lang-btn").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
        });
        var inviteRole = document.getElementById("invite-role");
        if (inviteRole) {
          var opts = inviteRole.querySelectorAll("option");
          if (opts.length >= 3) { opts[0].textContent = t("roleViewer"); opts[1].textContent = t("roleAnalyst"); opts[2].textContent = t("roleAdmin"); }
        }
        var inviteLinkLabel = document.querySelector("#invite-link-wrap label");
        if (inviteLinkLabel) inviteLinkLabel.textContent = t("inviteLinkLabel");
        var sendInviteBtn = document.querySelector("#form-invite button[type=submit]");
        if (sendInviteBtn) sendInviteBtn.textContent = t("sendInvite");
        var inviteTitle = document.querySelector("#view-invite .page-title");
        if (inviteTitle) inviteTitle.textContent = t("setPassword");
        var inviteSubtitle = document.querySelector("#view-invite .subtitle");
        if (inviteSubtitle) inviteSubtitle.textContent = t("subtitleInvite");
        var invitePwLabel = document.querySelector("#form-accept-invite label");
        if (invitePwLabel) invitePwLabel.textContent = t("labelPassword");
        var inviteConfirmLabel = document.querySelector("#form-accept-invite label:nth-of-type(2)");
        if (inviteConfirmLabel) inviteConfirmLabel.textContent = t("confirmPassword");
        var activateBtn = document.getElementById("invite-submit-btn");
        if (activateBtn) activateBtn.textContent = t("activateAccount");
        var view403Title = document.querySelector("#view-403 .page-title");
        if (view403Title) view403Title.textContent = t("accessDenied");
        var view403Msg = document.querySelector("#view-403 .forbidden-msg");
        if (view403Msg) view403Msg.textContent = t("forbiddenMsg");
        var view403Link = document.querySelector("#view-403 a");
        if (view403Link) view403Link.textContent = t("goToSurvey");
        var allUsersH3 = document.querySelector("#users-list-wrap h3");
        if (allUsersH3) allUsersH3.textContent = t("allUsers");
        var loginTitleEl = document.getElementById("login-title");
        var submitBtnEl = document.getElementById("submitBtn");
        var toggleTextEl = document.getElementById("toggleText");
        var toggleLinkEl = document.getElementById("toggleLink");
        if (loginTitleEl) loginTitleEl.textContent = (typeof mode !== "undefined" && mode === "signup") ? t("titleSignUp") : t("titleLogin");
        if (submitBtnEl) submitBtnEl.textContent = (typeof mode !== "undefined" && mode === "signup") ? t("btnCreateAccount") : t("btnSignIn");
        if (toggleTextEl) toggleTextEl.textContent = (typeof mode !== "undefined" && mode === "signup") ? t("toggleHaveAccount") : t("toggleNotUser");
        if (toggleLinkEl) toggleLinkEl.textContent = (typeof mode !== "undefined" && mode === "signup") ? t("linkLogIn") : t("linkSignUp");
      }
      function setLanguage(lang) {
        currentLang = lang;
        try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {}
        applyTranslations();
        var p = path();
        if (p === "/dashboard" && typeof loadDashboardResponses === "function") loadDashboardResponses();
        else if (p === "/insights" && typeof loadCorrelationsPage === "function") loadCorrelationsPage();
        else if (p === "/recommendations" && typeof loadRecommendationsPage === "function") loadRecommendationsPage();
      }

      const navbar = document.getElementById("navbar");
      const navAnalytics = document.getElementById("nav-analytics");
      const navCharts = document.getElementById("nav-charts");
      const navUsers = document.getElementById("nav-users");
      const navLogout = document.getElementById("nav-logout");
      const viewLogin = document.getElementById("view-login");
      const viewSurvey = document.getElementById("view-survey");
      const viewDashboard = document.getElementById("view-dashboard");
      const viewUsers = document.getElementById("view-users");
      const viewInvite = document.getElementById("view-invite");
      const view403 = document.getElementById("view-403");

      const form = document.getElementById("form");
      const loginTitle = document.getElementById("login-title");
      const submitBtn = document.getElementById("submitBtn");
      const toggleText = document.getElementById("toggleText");
      const toggleLink = document.getElementById("toggleLink");
      const statusEl = document.getElementById("status");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");

      let currentUser = null;
      let mode = "login";

      document.querySelectorAll(".navbar-lang-btn, .user-menu-lang-btn").forEach(function (btn) {
        btn.addEventListener("click", function () { setLanguage(btn.getAttribute("data-lang")); });
      });
      var userMenuBtn = document.getElementById("user-menu-btn");
      var userMenuDropdown = document.getElementById("user-menu-dropdown");
      var userMenuWrap = document.getElementById("user-menu-wrap");
      function closeUserMenu() {
        if (userMenuDropdown) userMenuDropdown.classList.remove("open");
        if (userMenuBtn) userMenuBtn.setAttribute("aria-expanded", "false");
      }
      function openUserMenu() {
        if (userMenuDropdown) userMenuDropdown.classList.add("open");
        if (userMenuBtn) userMenuBtn.setAttribute("aria-expanded", "true");
      }
      if (userMenuBtn && userMenuDropdown) {
        userMenuBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var isOpen = userMenuDropdown.classList.contains("open");
          if (isOpen) closeUserMenu(); else openUserMenu();
        });
        document.addEventListener("click", function () { closeUserMenu(); });
        userMenuDropdown.addEventListener("click", function (e) { e.stopPropagation(); });
      }
      var userMenuAccount = document.getElementById("user-menu-account");
      var userMenuUsers = document.getElementById("user-menu-users");
      if (userMenuAccount) {
        userMenuAccount.addEventListener("click", function (e) {
          e.preventDefault();
          closeUserMenu();
          setPath("/survey");
          renderRoute();
        });
      }
      if (userMenuUsers) {
        userMenuUsers.addEventListener("click", function (e) {
          e.preventDefault();
          closeUserMenu();
          setPath("/users");
          renderRoute();
        });
      }
      var sidebarToggle = document.getElementById("sidebar-toggle");
      if (sidebarToggle && navbar) {
        try {
          var saved = localStorage.getItem("sidebar-collapsed");
          if (saved === "1") {
            navbar.classList.add("collapsed");
            sidebarToggle.setAttribute("aria-label", "Expand sidebar");
            sidebarToggle.setAttribute("title", "Expand sidebar");
          }
        } catch (_) {}
        sidebarToggle.addEventListener("click", function () {
          navbar.classList.toggle("collapsed");
          sidebarToggle.setAttribute("aria-label", navbar.classList.contains("collapsed") ? "Expand sidebar" : "Collapse sidebar");
          sidebarToggle.setAttribute("title", navbar.classList.contains("collapsed") ? "Expand sidebar" : "Collapse sidebar");
          try { localStorage.setItem("sidebar-collapsed", navbar.classList.contains("collapsed") ? "1" : "0"); } catch (_) {}
        });
      }
      applyTranslations();

      function setStatus(msg, type) {
        statusEl.textContent = msg;
        statusEl.className = "status " + (type || "");
      }

      function path() {
        if (window.location.protocol === "file:") {
          var h = window.location.hash || "#/";
          var p = h.replace(/^#/, "").replace(/\/$/, "") || "/";
          return p;
        }
        return window.location.pathname.replace(/\/$/, "") || "/";
      }
      function setPath(p) {
        if (window.location.protocol === "file:") { window.location.hash = p || "#/"; return; }
        window.history.pushState({}, "", p || "/");
      }

      const viewAnalytics = document.getElementById("view-analytics");
      const viewCorrelations = document.getElementById("view-correlations");
      const viewRecommendations = document.getElementById("view-recommendations");
      const viewCharts = document.getElementById("view-charts");
      function showView(name) {
        if (viewLogin) viewLogin.classList.add("hidden");
        if (viewSurvey) viewSurvey.classList.add("hidden");
        if (viewDashboard) viewDashboard.classList.add("hidden");
        if (viewAnalytics) viewAnalytics.classList.add("hidden");
        if (viewCorrelations) viewCorrelations.classList.add("hidden");
        if (viewRecommendations) viewRecommendations.classList.add("hidden");
        if (viewCharts) viewCharts.classList.add("hidden");
        if (viewUsers) viewUsers.classList.add("hidden");
        if (viewInvite) viewInvite.classList.add("hidden");
        if (view403) view403.classList.add("hidden");
        var main = document.querySelector(".main");
        if (main) {
          if (name === "login" || name === "invite") main.classList.add("center-login");
          else main.classList.remove("center-login");
        }
        if (document.body) {
          if (name === "login" || name === "invite") document.body.classList.add("auth-view");
          else document.body.classList.remove("auth-view");
        }
        var view = document.getElementById("view-" + name);
        if (view) view.classList.remove("hidden");
      }

      function renderSurveyEmbed() {
        var container = document.getElementById("survey-embed-container");
        if (!container) return;
        var url = (SURVEY_EMBED_URL || "").trim();
        container.innerHTML = "";
        if (url) {
          var wrap = document.createElement("div");
          wrap.className = "survey-embed-wrap";
          var iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.title = "Survey form";
          iframe.setAttribute("allowfullscreen", "");
          wrap.appendChild(iframe);
          container.appendChild(wrap);
          var fallback = document.createElement("div");
          fallback.className = "survey-fallback";
          var link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "If the form didnâ€™t load, open it in a new tab";
          fallback.appendChild(link);
          container.appendChild(fallback);
        } else {
          renderBuiltinSurveyForm(container);
        }
      }

      async function renderBuiltinSurveyForm(container) {
        var formWrap = document.createElement("div");
        formWrap.className = "survey-builtin";
        formWrap.innerHTML = '<p class="survey-loading">Loadingâ€¦</p>';
        container.appendChild(formWrap);
        try {
          var statusRes = await fetch(API_BASE + "/survey/response-status", { credentials: "include" });
          if (statusRes.ok) {
            var statusData = await statusRes.json();
            if (statusData.alreadySubmitted) {
              formWrap.innerHTML = '<div class="survey-consent-block"><p class="survey-consent-intro">' + t("alreadyCompleted") + '</p><p class="survey-consent-text">' + t("surveyThanksAlready") + '</p></div>';
              return;
            }
          }
          var res = await fetch(API_BASE + "/survey/sections");
          var sections = await res.json();
          if (!Array.isArray(sections) || sections.length === 0) {
            formWrap.innerHTML = "<p>No sections configured. Run backend seed (prisma/seed) or add SurveySection + questions.</p>";
            return;
          }
          var consentHtml = '<div id="survey-consent" class="survey-consent-block">' +
            '<p class="survey-consent-intro">' + t("consentIntro") + '</p>' +
            '<div class="survey-consent-text">' + t("consentText") + '</div>' +
            '<label class="survey-consent-check"><input type="checkbox" id="survey-consent-checkbox"> ' + t("consentCheck") + '</label>' +
            '<button type="button" class="survey-btn survey-consent-btn" id="survey-consent-btn" disabled>' + t("consentBtn") + '</button>' +
            '</div>' +
            '<div id="survey-form-wrap" class="hidden">';
          var html = consentHtml + '<form id="survey-form">';
          sections.forEach(function (sec, pageIndex) {
            html += '<div class="survey-page" data-page="' + pageIndex + '" id="survey-page-' + pageIndex + '">';
            html += '<div class="survey-page-validation-msg hidden" role="alert" id="survey-validation-msg-' + pageIndex + '"></div>';
            html += '<div class="survey-section-block">';
            html += '<div class="survey-section-title">' + escapeHtml(trSectionTitle(sec.title, sec.titleAr)) + '</div>';
            if (sec.description) html += '<div class="survey-section-desc">' + escapeHtml(sec.description) + '</div>';
            if (sec.layerLabel) html += '<div class="survey-layer">' + escapeHtml(sec.layerLabel) + ' *</div>';
            var questions = sec.questions || [];
            var allScale = questions.length > 0 && questions.every(function (q) { return (q.type || "").toLowerCase() === "scale"; });
            if (allScale) {
              html += '<table class="survey-matrix"><thead><tr><th></th><th class="matrix-cell-label">Strongly disagree</th><th></th><th></th><th></th><th class="matrix-cell-label">Strongly agree</th></tr><tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody>';
            }
            questions.forEach(function (q) {
              var qType = (q.type || "").toLowerCase();
              var qLabel = trQuestionLabel(q.label, q.labelAr);
              if (qType === "scale") {
                if (allScale) {
                  html += '<tr class="survey-matrix-row"><td>' + escapeHtml(qLabel) + '</td>';
                  for (var n = 1; n <= 5; n++) {
                    html += '<td><label class="scale-opt"><input type="radio" name="' + escapeHtml(q.id) + '" value="' + n + '" required></label></td>';
                  }
                  html += '</tr>';
                } else {
                  html += '<div class="survey-q-row"><label class="q-label field-required">' + escapeHtml(qLabel) + '</label><div class="scale-row">';
                  for (var n = 1; n <= 5; n++) {
                    html += '<label class="scale-opt"><input type="radio" name="' + escapeHtml(q.id) + '" value="' + n + '" required> ' + n + '</label>';
                  }
                  html += '</div></div>';
                }
              } else if (qType === "select") {
                var opts = parseSelectOptions(q.options);
                var selId = "sel-" + escapeAttr(q.id);
                html += '<div class="survey-q-row"><label class="q-label field-required" for="' + selId + '">' + escapeHtml(qLabel) + '</label>';
                html += '<select id="' + selId + '" name="' + escapeHtml(q.id) + '" required class="survey-select"><option value="">Selectâ€¦</option>';
                opts.forEach(function (opt) {
                  var v = String(opt).trim();
                  if (v) html += '<option value="' + escapeHtml(v) + '">' + escapeHtml(trOption(v)) + '</option>';
                });
                html += '</select></div>';
              } else {
                html += '<div class="survey-q-row"><label class="q-label field-required">' + escapeHtml(qLabel) + '</label>';
                html += '<input type="text" name="' + escapeHtml(q.id) + '" placeholder="Your answer" required></div>';
              }
            });
            if (allScale) html += '</tbody></table>';
            html += '</div>';
            html += '<div class="survey-page-nav">';
            if (pageIndex > 0) html += '<button type="button" class="survey-btn secondary" data-action="prev">Previous</button>';
            if (pageIndex < sections.length - 1) html += '<button type="button" class="survey-btn" data-action="next">Next</button>';
            else html += '<button type="submit" class="survey-submit">Submit</button>';
            html += '</div></div>';
          });
          html += '<p class="survey-thanks" id="survey-thanks">Thank you.<br><br>Your responses will be analyzed in aggregate and used to better understand organizational strengths and areas for improvement. We appreciate your time and your honest input.</p>';
          html += '</form></div>';
          formWrap.innerHTML = html;
          var consentCheck = document.getElementById("survey-consent-checkbox");
          var consentBtn = document.getElementById("survey-consent-btn");
          var formWrapEl = document.getElementById("survey-form-wrap");
          var consentEl = document.getElementById("survey-consent");
          if (consentCheck && consentBtn) {
            consentCheck.addEventListener("change", function () { consentBtn.disabled = !consentCheck.checked; });
          }
          if (consentBtn && formWrapEl && consentEl) {
            consentBtn.addEventListener("click", function () {
              consentEl.classList.add("hidden");
              formWrapEl.classList.remove("hidden");
            });
          }
          var form = document.getElementById("survey-form");
          var thanks = document.getElementById("survey-thanks");
          var currentPage = 0;
          var totalPages = sections.length;
          function showPage(idx) {
            currentPage = idx;
            formWrap.querySelectorAll(".survey-page").forEach(function (el, i) {
              el.classList.toggle("active", i === idx);
            });
          }
          showPage(0);
          function clearSurveyValidation() {
            formWrap.querySelectorAll(".survey-q-row-invalid, .survey-matrix-row.survey-row-invalid").forEach(function (el) { el.classList.remove("survey-q-row-invalid", "survey-row-invalid"); });
            formWrap.querySelectorAll(".survey-field-error").forEach(function (el) { el.remove(); });
            formWrap.querySelectorAll(".survey-page-validation-msg").forEach(function (el) { el.classList.add("hidden"); el.textContent = ""; });
          }
          function markInvalidQuestion(name, isRadio) {
            var control = form.querySelector(isRadio ? 'input[name="' + name + '"]' : '[name="' + name + '"]');
            if (!control) return null;
            var row = control.closest(".survey-q-row") || control.closest("tr.survey-matrix-row");
            if (!row) return null;
            if (row.classList.contains("survey-q-row")) {
              row.classList.add("survey-q-row-invalid");
              if (!row.querySelector(".survey-field-error")) {
                var err = document.createElement("span");
                err.className = "survey-field-error";
                err.setAttribute("role", "alert");
                err.textContent = (typeof t === "function" && t("surveyRequired")) ? t("surveyRequired") : "This question is required.";
                row.appendChild(err);
              }
            } else {
              row.classList.add("survey-row-invalid");
              var firstCell = row.querySelector("td:first-child");
              if (firstCell && !firstCell.querySelector(".survey-field-error")) {
                var err = document.createElement("span");
                err.className = "survey-field-error";
                err.setAttribute("role", "alert");
                err.textContent = (typeof t === "function" && t("surveyRequired")) ? t("surveyRequired") : "This question is required.";
                firstCell.appendChild(err);
              }
            }
            return row;
          }
          formWrap.querySelectorAll("input, select, textarea").forEach(function (el) {
            el.addEventListener("input", function () { clearSurveyValidation(); });
            el.addEventListener("change", function () { clearSurveyValidation(); });
          });
          formWrap.querySelectorAll("[data-action=prev]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              clearSurveyValidation();
              if (currentPage > 0) showPage(currentPage - 1);
            });
          });
          formWrap.querySelectorAll("[data-action=next]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              clearSurveyValidation();
              var pageEl = formWrap.querySelector("#survey-page-" + currentPage);
              var names = {};
              pageEl.querySelectorAll("input, select, textarea").forEach(function (el) {
                if (el.name && (el.required || el.getAttribute("required") !== null)) {
                  if (el.type === "radio") names[el.name] = "radio";
                  else if (!names[el.name]) names[el.name] = "other";
                }
              });
              var valid = true;
              var invalidNames = [];
              Object.keys(names).forEach(function (name) {
                if (names[name] === "radio") {
                  if (!form.querySelector('input[name="' + name + '"]:checked')) { valid = false; invalidNames.push({ name: name, isRadio: true }); }
                } else {
                  var el = form.querySelector('[name="' + name + '"]');
                  if (el && !el.value.trim()) { valid = false; invalidNames.push({ name: name, isRadio: false }); }
                }
              });
              if (valid && currentPage < totalPages - 1) { showPage(currentPage + 1); return; }
              if (valid) { form.requestSubmit(); return; }
              var firstRow = null;
              invalidNames.forEach(function (item) {
                var row = markInvalidQuestion(item.name, item.isRadio);
                if (!firstRow) firstRow = row;
              });
              var msgEl = document.getElementById("survey-validation-msg-" + currentPage);
              var requiredMsg = (typeof t === "function" && t("surveyRequiredAll")) ? t("surveyRequiredAll") : "Please answer all required questions below.";
              if (msgEl) { msgEl.textContent = requiredMsg; msgEl.classList.remove("hidden"); }
              if (firstRow && firstRow.scrollIntoView) firstRow.scrollIntoView({ behavior: "smooth", block: "center" });
            });
          });
          if (form && thanks) {
            form.addEventListener("submit", async function (e) {
              e.preventDefault();
              var fd = new FormData(form);
              var answers = {};
              fd.forEach(function (value, key) { answers[key] = value; });
              var submitBtn = form.querySelector(".survey-submit");
              if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submittingâ€¦"; }
              try {
                var r = await fetch(API_BASE + "/survey/responses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ answers: answers }),
                });
                if (r.ok) {
                  form.querySelectorAll(".survey-page, .survey-page-nav").forEach(function (el) { el.style.display = "none"; });
                  thanks.style.display = "block";
                } else if (r.status === 409) {
                  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit"; }
                  thanks.textContent = t("alreadyCompleted") + " " + t("surveyThanksAlready");
                  thanks.style.display = "block";
                  thanks.style.color = "#fecaca";
                } else {
                  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit"; }
                  thanks.textContent = "Something went wrong. Please try again.";
                  thanks.style.display = "block";
                  thanks.style.color = "#fecaca";
                }
              } catch (err) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit"; }
                thanks.textContent = "Network error. Please try again.";
                thanks.style.display = "block";
                thanks.style.color = "#fecaca";
              }
            });
          }
        } catch (err) {
          formWrap.innerHTML = "<p>Could not load questions. Make sure the backend is running.</p>";
        }
      }

      function escapeHtml(s) {
        var div = document.createElement("div");
        div.textContent = s;
        return div.innerHTML;
      }
      function escapeAttr(s) {
        return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
      }
      function parseSelectOptions(o) {
        if (Array.isArray(o)) return o.map(String);
        if (o == null || o === "") return [];
        var s = String(o).trim();
        if (!s) return [];
        try {
          var parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed.map(String) : [s];
        } catch (_) {
          return s.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        }
      }

      function scoreClass(s) {
        if (s >= 60) return "score-high";
        if (s >= 40) return "score-mid";
        return "score-low";
      }
      function corrClass(r) {
        if (r >= 0.3) return "corr-positive";
        if (r <= -0.3) return "corr-negative";
        return "corr-weak";
      }
      function corrFmt(r) { var n = Number(r); return isNaN(n) ? "" : n.toFixed(2); }
      function scoreFmt(n) { var x = Number(n); return isNaN(x) ? "" : x.toFixed(1); }

      var analyticsScope = { layer: null, dimension: null, question: null };
      var analyticsData = null;
      var analyticsActiveTab = "results";

      function defaultAnalyticsState() {
        return {
          survey_type: "benchmarking",
          layer_id: null,
          dimension_id: null,
          question_id: null,
          compare_vs_previous_period: false,
          compare_vs_benchmark_cohort: false,
          filters: {
            time_period: null,
            benchmark_cohort: null,
            demographics: {}
          }
        };
      }
      var analyticsByPeriodData = null;
      var analyticsState = defaultAnalyticsState();
      // Global store: single source of truth for scope + results/insights/recommendations (synced to URL via analyticsState).
      var benchmarkingStore = {
        results: null,
        insights: null,
        recommendations: null
      };

      function getBenchmarkingSearch() {
        var p = path();
        if (p.indexOf("?") >= 0) return p.slice(p.indexOf("?"));
        if (window.location.protocol === "file:") {
          var hash = window.location.hash || "";
          var qIndex = hash.indexOf("?");
          if (qIndex >= 0) return hash.slice(qIndex);
        }
        return window.location.search || "";
      }
      function getAnalyticsStateFromUrl() {
        var state = defaultAnalyticsState();
        var p = path();
        var isBench = p === "/dashboard/benchmarking";
        if (!isBench) return state;
        var search = p === "/dashboard/benchmarking" ? getBenchmarkingSearch() : (window.location.protocol === "file:" ? (window.location.hash || "").slice((window.location.hash || "").indexOf("?")) : window.location.search);
        if (!search) return state;
        var params = new URLSearchParams(search);
        state.survey_type = params.get("survey_type") || state.survey_type;
        state.layer_id = params.get("layer") || params.get("layer_id") || null;
        state.dimension_id = params.get("dimension") || params.get("dimension_id") || null;
        state.question_id = params.get("question") || params.get("question_id") || null;
        var viewParam = params.get("view");
        if (viewParam === "results" || viewParam === "insights" || viewParam === "recommendations") analyticsActiveTab = viewParam;
        state.compare_vs_previous_period = params.get("compare_previous") === "1";
        state.compare_vs_benchmark_cohort = params.get("compare_benchmark") === "1";
        state.filters.time_period = params.get("time_period") || null;
        state.filters.benchmark_cohort = params.get("benchmark_cohort") || null;
        var demStr = params.get("demographics");
        if (demStr) {
          try {
            state.filters.demographics = JSON.parse(decodeURIComponent(demStr)) || {};
          } catch (_) { state.filters.demographics = {}; }
        }
        return state;
      }

      function setAnalyticsStateInUrl(state) {
        var p = path();
        if (p !== "/dashboard/benchmarking") return;
        var base = "/dashboard/benchmarking";
        var params = new URLSearchParams();
        params.set("survey_type", state.survey_type || "benchmarking");
        if (state.layer_id) params.set("layer", state.layer_id);
        if (state.dimension_id) params.set("dimension", state.dimension_id);
        if (state.question_id) params.set("question", state.question_id);
        params.set("view", analyticsActiveTab || "results");
        if (state.compare_vs_previous_period) params.set("compare_previous", "1");
        if (state.compare_vs_benchmark_cohort) params.set("compare_benchmark", "1");
        if (state.filters.time_period) params.set("time_period", state.filters.time_period);
        if (state.filters.benchmark_cohort) params.set("benchmark_cohort", state.filters.benchmark_cohort);
        if (state.filters.demographics && Object.keys(state.filters.demographics).length > 0) {
          params.set("demographics", encodeURIComponent(JSON.stringify(state.filters.demographics)));
        }
        var qs = params.toString();
        var url = base + (qs ? "?" + qs : "");
        if (window.location.protocol === "file:") {
          try { window.location.hash = "#" + url; } catch (_) {}
          return;
        }
        window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
      }

      function syncScopeFromState(data) {
        if (!data) return;
        analyticsScope.layer = null;
        analyticsScope.dimension = null;
        analyticsScope.question = null;
        var s = analyticsState;
        if (s.layer_id) {
          var byLayer = data.byLayer || [];
          var layerKey = s.layer_id;
          for (var i = 0; i < byLayer.length; i++) {
            var row = byLayer[i];
            var key = (row.layerLabel || "") + "|" + (row.layerTitle || "");
            if (key === layerKey) {
              analyticsScope.layer = { layerLabel: row.layerLabel, layerTitle: row.layerTitle };
              break;
            }
          }
        }
        if (s.dimension_id && analyticsScope.layer) {
          var byDimension = data.byDimension || [];
          for (var j = 0; j < byDimension.length; j++) {
            if (byDimension[j].dimensionId === s.dimension_id) {
              analyticsScope.dimension = { dimensionId: byDimension[j].dimensionId, dimensionName: byDimension[j].dimensionName, dimensionNameAr: byDimension[j].dimensionNameAr };
              break;
            }
          }
        }
        if (s.question_id) {
          var byQuestion = data.byQuestion || [];
          for (var k = 0; k < byQuestion.length; k++) {
            if (byQuestion[k].questionId === s.question_id) {
              analyticsScope.question = byQuestion[k];
              break;
            }
          }
        }
      }

      function setAnalyticsState(partial, options) {
        if (partial.survey_type !== undefined) analyticsState.survey_type = partial.survey_type;
        if (partial.layer_id !== undefined) analyticsState.layer_id = partial.layer_id;
        if (partial.dimension_id !== undefined) analyticsState.dimension_id = partial.dimension_id;
        if (partial.question_id !== undefined) analyticsState.question_id = partial.question_id;
        if (partial.compare_vs_previous_period !== undefined) analyticsState.compare_vs_previous_period = partial.compare_vs_previous_period;
        if (partial.compare_vs_benchmark_cohort !== undefined) analyticsState.compare_vs_benchmark_cohort = partial.compare_vs_benchmark_cohort;
        if (partial.filters) {
          if (partial.filters.time_period !== undefined) analyticsState.filters.time_period = partial.filters.time_period;
          if (partial.filters.benchmark_cohort !== undefined) analyticsState.filters.benchmark_cohort = partial.filters.benchmark_cohort;
          if (partial.filters.demographics !== undefined) analyticsState.filters.demographics = partial.filters.demographics;
        }
        setAnalyticsStateInUrl(analyticsState);
        if (analyticsData) syncScopeFromState(analyticsData);
        renderAnalyticsBreadcrumb();
        renderAnalyticsOverviewPanel();
        renderBenchmarkingResultsPanel();
        renderAnalyticsInsightsPanel();
        renderAnalyticsRecommendationsPanel();
        updateBenchmarkingMainView();
      }

      function updateBenchmarkingMainView() {
        if (!analyticsData) return;
        var hasDimension = !!(analyticsState.dimension_id);
        var hasQuestion = !!(analyticsState.question_id);
        var mainContent = document.getElementById("benchmarking-main-content");
        var questionsArea = document.getElementById("benchmarking-questions-area");
        if (!mainContent || !questionsArea) return;
        mainContent.style.display = "";
        questionsArea.style.display = "none";
        questionsArea.classList.add("hidden");
        if (hasDimension && !hasQuestion) {
          mainContent.style.display = "none";
          questionsArea.style.display = "block";
          questionsArea.classList.remove("hidden");
          renderBenchmarkingQuestionsTable(analyticsData);
        }
        if (hasQuestion) {
          mainContent.style.display = "none";
          questionsArea.style.display = "none";
          openQuestionDrawer(analyticsState.question_id);
        } else {
          closeQuestionDrawer();
        }
      }

      function filterAnalyticsByScope(data) {
        if (!data) return null;
        var scope = analyticsScope;
        var byLayer = (data.byLayer || []).filter(function (row) {
          if (!DASHBOARD_LAYER_FILTER || DASHBOARD_LAYER_FILTER.length === 0) return true;
          var label = (row.layerLabel || "").trim();
          var title = (row.layerTitle || "").trim();
          return DASHBOARD_LAYER_FILTER.some(function (f) { var s = String(f).trim(); return s && (s === label || s === title); });
        });
        var layerKey = scope.layer ? (scope.layer.layerLabel ? scope.layer.layerLabel + " â€“ " + scope.layer.layerTitle : scope.layer.layerTitle) : null;
        var byDimension = (data.byDimension || []).filter(function (row) {
          if (!layerKey) return true;
          var rowKey = (row.layerLabel && row.sectionTitle) ? (row.layerLabel + " â€“ " + row.sectionTitle) : (row.layerLabel || row.sectionTitle || "");
          return rowKey === layerKey;
        });
        var dimensionId = scope.dimension ? scope.dimension.dimensionId : null;
        var byQuestion = (data.byQuestion || []).filter(function (row) {
          if (dimensionId) return row.dimensionId === dimensionId;
          if (layerKey) return (row.layerLabel ? row.layerLabel + " â€“ " + row.sectionTitle : row.sectionTitle) === layerKey;
          return true;
        });
        var questionIds = byQuestion.map(function (q) { return q.questionId; });
        var correlations = (data.correlations || []).filter(function (p) {
          if (questionIds.length === 0) return true;
          return questionIds.indexOf(p.questionIdA) >= 0 || questionIds.indexOf(p.questionIdB) >= 0;
        });
        return { byLayer: byLayer, byDimension: byDimension, byQuestion: byQuestion, correlations: correlations, overallIndex: data.overallIndex, totalResponses: data.totalResponses, demographics: data.demographics || [] };
      }

      function renderAnalyticsBreadcrumb() {
        var el = document.getElementById("analytics-breadcrumb");
        if (!el) return;
        var scope = analyticsScope;
        var parts = [];
        parts.push('<a href="#" class="analytics-scope-link" data-scope="all">All</a>');
        if (scope.layer) {
          var layerLabel = scope.layer.layerLabel ? scope.layer.layerLabel + " â€“ " + scope.layer.layerTitle : scope.layer.layerTitle;
          parts.push('<span>â€º</span>');
          parts.push('<a href="#" class="analytics-scope-link" data-scope="layer">' + escapeHtml(layerLabel) + "</a>");
        }
        if (scope.dimension) {
          parts.push('<span>â€º</span>');
          parts.push('<a href="#" class="analytics-scope-link" data-scope="dimension">' + escapeHtml(trDimensionName(scope.dimension.dimensionName, scope.dimension.dimensionNameAr)) + "</a>");
        }
        if (scope.question) {
          parts.push('<span>â€º</span>');
          parts.push('<a href="#" class="analytics-scope-link" data-scope="question">' + escapeHtml(trQuestionLabel(scope.question.label, scope.question.labelAr)) + "</a>");
        }
        el.innerHTML = "<strong>Scope:</strong> " + parts.join(" ");
        el.querySelectorAll(".analytics-scope-link").forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var s = a.getAttribute("data-scope");
            if (s === "all") setAnalyticsState({ layer_id: null, dimension_id: null, question_id: null });
            else if (s === "layer") setAnalyticsState({ dimension_id: null, question_id: null });
            else if (s === "dimension") setAnalyticsState({ question_id: null });
            else if (s === "question") { }
            setAnalyticsStateInUrl(analyticsState);
            loadUnifiedAnalytics();
          });
        });
      }

      function renderScopeSummaryChips() {
        var el = document.getElementById("scope-summary-chips");
        if (!el || !analyticsData) { if (el) el.innerHTML = ""; return; }
        var n = analyticsData.totalResponses != null ? analyticsData.totalResponses : 0;
        var mean = analyticsData.overallIndex != null ? Number(analyticsData.overallIndex) : null;
        var scope = analyticsScope;
        var trendStr = "";
        if (analyticsByPeriodData && analyticsByPeriodData.byPeriod && analyticsByPeriodData.byPeriod.length >= 2) {
          var periods = analyticsByPeriodData.byPeriod;
          var prev = periods[periods.length - 2];
          var curr = periods[periods.length - 1];
          var delta = (Number(curr.overallIndex) || 0) - (Number(prev.overallIndex) || 0);
          trendStr = (delta >= 0 ? "+" : "") + scoreFmt(delta);
        }
        var gapStr = "";
        if (scope.question && scope.question.benchmarkGap != null) gapStr = (scope.question.benchmarkGap >= 0 ? "+" : "") + scoreFmt(scope.question.benchmarkGap);
        var html = "<span class=\"chip\"><strong>n</strong> " + n + "</span>";
        if (mean != null) html += "<span class=\"chip\"><strong>mean</strong> " + scoreFmt(mean) + "</span>";
        if (trendStr) html += "<span class=\"chip\"><strong>" + t("trendLabel") + "</strong> " + trendStr + "</span>";
        if (gapStr) html += "<span class=\"chip\"><strong>" + t("benchmarkGapLabel") + "</strong> " + gapStr + "</span>";
        el.innerHTML = html;
      }

      function renderLayerCards(data) {
        var wrap = document.getElementById("layer-cards-wrap");
        if (!wrap || !data || !data.byLayer) return;
        var byLayer = (data.byLayer || []).filter(function (l) { return (l.layerTitle || "").toLowerCase() !== "demographic"; });
        var layerKey = function (row) { return (row.layerLabel || "") + "|" + (row.layerTitle || ""); };
        var html = "";
        byLayer.forEach(function (layer) {
          var key = layerKey(layer);
          var label = (layer.layerLabel ? layer.layerLabel + " – " : "") + (layer.layerTitle || "");
          html += "<button type=\"button\" class=\"layer-card\" data-layer-key=\"" + escapeAttr(key) + "\"><span class=\"layer-card-score " + scoreClass(layer.averageScore) + "\">" + scoreFmt(layer.averageScore) + "</span><span class=\"layer-card-label\">" + escapeHtml(label) + "</span></button>";
        });
        wrap.innerHTML = html || "<p>No layers.</p>";
        wrap.querySelectorAll(".layer-card").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setAnalyticsState({ layer_id: btn.getAttribute("data-layer-key"), dimension_id: null, question_id: null });
            setAnalyticsStateInUrl(analyticsState);
            loadUnifiedAnalytics();
          });
        });
      }

      var heatmapSortBy = "layer";

      function sortDimensionsForHeatmap(dimensions, byLayer, sortBy) {
        var list = dimensions.slice();
        if (sortBy === "score") {
          list.sort(function (a, b) { return (b.averageScore != null ? b.averageScore : 0) - (a.averageScore != null ? a.averageScore : 0); });
          return list;
        }
        if (!byLayer || !byLayer.length) return list;
        var layerOrder = {};
        byLayer.forEach(function (l, i) {
          var key = (l.layerLabel || "") + "|" + (l.layerTitle || "");
          layerOrder[key] = i;
        });
        var dimKey = function (d) { return (d.layerLabel || "") + "|" + (d.sectionTitle || ""); };
        list.sort(function (a, b) {
          var oa = layerOrder[dimKey(a)] != null ? layerOrder[dimKey(a)] : 999;
          var ob = layerOrder[dimKey(b)] != null ? layerOrder[dimKey(b)] : 999;
          if (oa !== ob) return oa - ob;
          return (b.averageScore != null ? b.averageScore : 0) - (a.averageScore != null ? a.averageScore : 0);
        });
        return list;
      }

      function renderDimensionsHeatmapAll(data) {
        var wrap = document.getElementById("dimensions-heatmap");
        var sortLayerBtn = document.getElementById("heatmap-all-sort-layer");
        var sortScoreBtn = document.getElementById("heatmap-all-sort-score");
        if (!wrap || !data || !data.byDimension) return;
        var byLayer = (data.byLayer || []).filter(function (l) { return (l.layerTitle || "").toLowerCase() !== "demographic"; });
        var byDimension = (data.byDimension || []).filter(function (d) { return (d.sectionTitle || "").toLowerCase() !== "demographic"; });
        var sorted = sortDimensionsForHeatmap(byDimension, byLayer, heatmapSortBy);
        var maxCells = 21;
        var list = sorted.slice(0, maxCells);
        var html = "";
        list.forEach(function (dim) {
          var name = trDimensionName(dim.dimensionName, dim.dimensionNameAr);
          var shortName = name.length > 14 ? name.slice(0, 14) + "\u2026" : name;
          var layerKey = (dim.layerLabel || "") + "|" + (dim.sectionTitle || "");
          html += "<button type=\"button\" class=\"heatmap-cell " + scoreClass(dim.averageScore) + "\" data-dimension-id=\"" + escapeAttr(dim.dimensionId || "") + "\" data-layer-key=\"" + escapeAttr(layerKey) + "\" title=\"" + escapeAttr(name) + " " + scoreFmt(dim.averageScore) + "\">";
          html += "<span class=\"heatmap-cell-name\">" + escapeHtml(shortName) + "</span><span class=\"heatmap-cell-score\">" + scoreFmt(dim.averageScore) + "</span></button>";
        });
        wrap.innerHTML = html || "<p>No dimensions.</p>";
        wrap.querySelectorAll(".heatmap-cell").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setAnalyticsState({ layer_id: btn.getAttribute("data-layer-key") || null, dimension_id: btn.getAttribute("data-dimension-id") || null, question_id: null });
            setAnalyticsStateInUrl(analyticsState);
            loadUnifiedAnalytics();
          });
        });
        if (sortLayerBtn) { sortLayerBtn.classList.toggle("active", heatmapSortBy === "layer"); sortLayerBtn.setAttribute("aria-pressed", heatmapSortBy === "layer" ? "true" : "false"); }
        if (sortScoreBtn) { sortScoreBtn.classList.toggle("active", heatmapSortBy === "score"); sortScoreBtn.setAttribute("aria-pressed", heatmapSortBy === "score" ? "true" : "false"); }
        if (!wrap._heatmapSortBound) {
          wrap._heatmapSortBound = true;
          [sortLayerBtn, sortScoreBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener("click", function () {
              heatmapSortBy = btn.getAttribute("data-sort") || "layer";
              renderDimensionsHeatmapAll(analyticsData);
            });
          });
        }
      }

      function renderLayerScopeContent(data) {
        var heatEl = document.getElementById("layer-dimensions-heatmap");
        var sortLayerBtn = document.getElementById("heatmap-layer-sort-layer");
        var sortScoreBtn = document.getElementById("heatmap-layer-sort-score");
        if (!data || !data.byDimension) return;
        var filtered = filterAnalyticsByScope(data);
        if (!filtered) return;
        var dims = filtered.byDimension || [];
        var byLayer = (data.byLayer || []).filter(function (l) { return (l.layerTitle || "").toLowerCase() !== "demographic"; });
        var sorted = sortDimensionsForHeatmap(dims, byLayer, heatmapSortBy);
        var maxCells = 21;
        var list = sorted.slice(0, maxCells);
        if (heatEl) {
          var h = "";
          list.forEach(function (dim) {
            var name = trDimensionName(dim.dimensionName, dim.dimensionNameAr);
            var shortName = name.length > 14 ? name.slice(0, 14) + "\u2026" : name;
            h += "<button type=\"button\" class=\"heatmap-cell " + scoreClass(dim.averageScore) + "\" data-dimension-id=\"" + escapeAttr(dim.dimensionId || "") + "\" title=\"" + escapeAttr(name) + " " + scoreFmt(dim.averageScore) + "\">";
            h += "<span class=\"heatmap-cell-name\">" + escapeHtml(shortName) + "</span><span class=\"heatmap-cell-score\">" + scoreFmt(dim.averageScore) + "</span></button>";
          });
          heatEl.innerHTML = h || "<p>No dimensions.</p>";
          heatEl.querySelectorAll(".heatmap-cell").forEach(function (btn) {
            btn.addEventListener("click", function () {
              setAnalyticsState({ dimension_id: btn.getAttribute("data-dimension-id") || null, question_id: null });
              setAnalyticsStateInUrl(analyticsState);
              loadUnifiedAnalytics();
            });
          });
        }
        if (sortLayerBtn) { sortLayerBtn.classList.toggle("active", heatmapSortBy === "layer"); sortLayerBtn.setAttribute("aria-pressed", heatmapSortBy === "layer" ? "true" : "false"); }
        if (sortScoreBtn) { sortScoreBtn.classList.toggle("active", heatmapSortBy === "score"); sortScoreBtn.setAttribute("aria-pressed", heatmapSortBy === "score" ? "true" : "false"); }
        if (heatEl && !heatEl._layerSortBound) {
          heatEl._layerSortBound = true;
          [sortLayerBtn, sortScoreBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener("click", function () {
              heatmapSortBy = btn.getAttribute("data-sort") || "layer";
              renderLayerScopeContent(analyticsData);
            });
          });
        }
      }

      function renderAIPanel() {
        var el = document.getElementById("ai-panel-content");
        if (!el) return;
        var scope = analyticsScope;
        var insights = benchmarkingStore.insights;
        var rec = benchmarkingStore.recommendations;
        var html = "";
        if (insights && (insights.headline || (insights.what_we_see && insights.what_we_see.length))) {
          html += "<div class=\"ai-panel-section\"><h4 style=\"font-size:0.85rem;margin:0 0 8px;\">" + t("tabInsights") + "</h4>";
          if (insights.headline) html += "<p style=\"margin:0 0 8px;font-weight:600;\">" + escapeHtml(insights.headline) + "</p>";
          if (insights.what_we_see && insights.what_we_see.length) html += "<ul style=\"margin:0 0 12px;padding-left:18px;\">" + insights.what_we_see.map(function (b) { return "<li>" + escapeHtml(b) + "</li>"; }).join("") + "</ul>";
          html += "</div>";
        }
        if (rec && (rec.recommended_actions && rec.recommended_actions.length)) {
          html += "<div class=\"ai-panel-section\"><h4 style=\"font-size:0.85rem;margin:0 0 8px;\">" + t("tabRecommendations") + "</h4><ul style=\"margin:0;padding-left:18px;\">";
          rec.recommended_actions.slice(0, 5).forEach(function (a) {
            html += "<li>" + escapeHtml(typeof a === "string" ? a : (a.action || a.text || "")) + "</li>";
          });
          html += "</ul></div>";
        }
        if (!html) el.innerHTML = "<p class=\"ai-panel-placeholder\">Select a scope to see AI insights and recommendations here.</p>";
        else el.innerHTML = html;
      }

      function renderAnalyticsOverviewPanel() {
        var el = document.getElementById("analytics-panel-overview");
        if (!el || !analyticsData) return;
        var filtered = filterAnalyticsByScope(analyticsData);
        if (!filtered) return;
        var overall = analyticsData.overallIndex != null ? Number(analyticsData.overallIndex) : 0;
        var byLayer = filtered.byLayer || [];
        var totalResponses = analyticsData.totalResponses || 0;
        var html = "<p style=\"margin-bottom:16px;font-size:0.9rem;\">" + t("basedOnResponses", { count: totalResponses }) + "</p>";
        html += "<div class=\"analytics-overview-hero\">";
        html += "<div class=\"overview-index-label\">Overall index</div>";
        html += "<div class=\"overview-index-value " + scoreClass(overall) + "\">" + scoreFmt(overall) + "</div>";
        html += "<p style=\"margin:8px 0 0;font-size:0.9rem;opacity:0.9;\">0â€“100 scale</p>";
        html += "</div>";
        html += "<h4 style=\"font-size:1rem;margin:0 0 12px;\">Layer summary</h4>";
        html += "<div class=\"analytics-overview-layers\">";
        byLayer.forEach(function (row) {
          var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
          html += "<div class=\"analytics-overview-layer-card\"><div class=\"layer-score " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</div><div class=\"layer-label\">" + escapeHtml(label) + "</div></div>";
        });
        html += "</div>";
        if (analyticsState.compare_vs_previous_period && analyticsByPeriodData && analyticsByPeriodData.byPeriod && analyticsByPeriodData.byPeriod.length >= 2) {
        var periods = analyticsByPeriodData.byPeriod;
        var prev = periods[periods.length - 2];
        var curr = periods[periods.length - 1];
        var prevIdx = Number(prev.overallIndex) || 0;
        var currIdx = Number(curr.overallIndex) || 0;
        var delta = currIdx - prevIdx;
        var deltaStr = (delta >= 0 ? "+" : "") + scoreFmt(delta);
        var deltaClass = delta >= 0 ? "score-good" : "score-low";
        html += "<div class=\"analytics-compare-box\" style=\"margin-top:16px;\"><h5>" + t("compareVsPreviousTitle") + "</h5>";
        html += "<p style=\"margin:0;\"><span>" + escapeHtml(prev.period) + ":</span> <span class=\"" + scoreClass(prevIdx) + "\">" + scoreFmt(prevIdx) + "</span> &rarr; <span>" + escapeHtml(curr.period) + ":</span> <span class=\"" + scoreClass(currIdx) + "\">" + scoreFmt(currIdx) + "</span> <span class=\"" + deltaClass + "\">(" + deltaStr + ")</span></p>";
        html += "<p style=\"margin:6px 0 0;font-size:0.85rem;color:var(--color-text-muted);\">Responses: " + (prev.totalResponses || 0) + " &rarr; " + (curr.totalResponses || 0) + "</p></div>";
      }
        html += "<p style=\"margin-top:20px;font-size:0.9rem;color:var(--color-text-muted);\">Use <strong>Detailed Results</strong>, <strong>Insights</strong>, or <strong>Recommendations</strong> above to explore the same scope in more detail.</p>";
        el.innerHTML = html;
      }

      function renderAnalyticsCompareRow() {
        var el = document.getElementById("analytics-compare-row");
        if (!el) return;
        var prevChecked = analyticsState.compare_vs_previous_period ? " checked" : "";
        var benchChecked = analyticsState.compare_vs_benchmark_cohort ? " checked" : "";
        var html = "<label><input type=\"checkbox\" id=\"analytics-compare-previous\" " + prevChecked + "> " + t("compareVsPreviousPeriod") + "</label>";
        html += " <label><input type=\"checkbox\" id=\"analytics-compare-benchmark\" " + benchChecked + "> " + t("compareVsBenchmarkCohort") + "</label>";
        if (analyticsState.compare_vs_benchmark_cohort) {
          html += " <span class=\"analytics-compare-note\" style=\"font-size:0.85rem;color:var(--color-text-muted);\">" + t("benchmarkCohortNote") + "</span>";
        }
        el.innerHTML = html;
        var prevCb = document.getElementById("analytics-compare-previous");
        var benchCb = document.getElementById("analytics-compare-benchmark");
        if (prevCb) {
          prevCb.addEventListener("change", function () {
            setAnalyticsState({ compare_vs_previous_period: prevCb.checked });
            if (prevCb.checked) loadAnalyticsByPeriod(); else { analyticsByPeriodData = null; renderBenchmarkingResultsPanel(); }
          });
        }
        if (benchCb) {
          benchCb.addEventListener("change", function () {
            setAnalyticsState({ compare_vs_benchmark_cohort: benchCb.checked });
            renderAnalyticsCompareRow();
          });
        }
      }

      async function loadAnalyticsByPeriod() {
        try {
          var res = await fetch(API_BASE + "/survey/analytics/by-period", { credentials: "include" });
          if (!res.ok) return;
          analyticsByPeriodData = await res.json();
          renderBenchmarkingResultsPanel();
        } catch (err) {
          analyticsByPeriodData = null;
          renderBenchmarkingResultsPanel();
        }
      }

      function renderBenchmarkingResultsPanel() {
        var el = document.getElementById("benchmarking-panel-results");
        if (!el) return;
        if (!analyticsData) { el.innerHTML = "<p>" + t("basedOnResponses", { count: 0 }) + "</p>"; return; }
        var filtered = filterAnalyticsByScope(analyticsData);
        if (!filtered) { el.innerHTML = "<p>No data for this scope.</p>"; return; }
        var scope = analyticsScope;
        var byLayer = filtered.byLayer || [];
        var totalResponses = analyticsData.totalResponses || 0;
        var overall = analyticsData.overallIndex != null ? Number(analyticsData.overallIndex) : 0;
        var html = "<p style=\"margin-bottom:16px;font-size:0.9rem;\">" + t("basedOnResponses", { count: totalResponses }) + "</p>";
        html += "<div class=\"analytics-overview-hero\"><div class=\"overview-index-label\">Overall index</div><div class=\"overview-index-value " + scoreClass(overall) + "\">" + scoreFmt(overall) + "</div><p style=\"margin:8px 0 0;font-size:0.9rem;opacity:0.9;\">0â€“100 scale</p></div>";
        html += "<h4 style=\"font-size:1rem;margin:0 0 12px;\">Layer summary</h4><div class=\"analytics-overview-layers\">";
        byLayer.forEach(function (row) {
          var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
          html += "<div class=\"analytics-overview-layer-card\"><div class=\"layer-score " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</div><div class=\"layer-label\">" + escapeHtml(label) + "</div></div>";
        });
        html += "</div>";
        if (analyticsState.compare_vs_previous_period && analyticsByPeriodData && analyticsByPeriodData.byPeriod && analyticsByPeriodData.byPeriod.length >= 2) {
          var periods = analyticsByPeriodData.byPeriod;
          var prev = periods[periods.length - 2];
          var curr = periods[periods.length - 1];
          var prevIdx = Number(prev.overallIndex) || 0;
          var currIdx = Number(curr.overallIndex) || 0;
          var delta = currIdx - prevIdx;
          var deltaStr = (delta >= 0 ? "+" : "") + scoreFmt(delta);
          var deltaClass = delta >= 0 ? "score-good" : "score-low";
          html += "<div class=\"analytics-compare-box\" style=\"margin-top:16px;\"><h5>" + t("compareVsPreviousTitle") + "</h5><p style=\"margin:0;\"><span>" + escapeHtml(prev.period) + ":</span> <span class=\"" + scoreClass(prevIdx) + "\">" + scoreFmt(prevIdx) + "</span> &rarr; <span>" + escapeHtml(curr.period) + ":</span> <span class=\"" + scoreClass(currIdx) + "\">" + scoreFmt(currIdx) + "</span> <span class=\"" + deltaClass + "\">(" + deltaStr + ")</span></p><p style=\"margin:6px 0 0;font-size:0.85rem;color:var(--color-text-muted);\">Responses: " + (prev.totalResponses || 0) + " &rarr; " + (curr.totalResponses || 0) + "</p></div>";
        }
        html += "<h4 style=\"font-size:1rem;margin:20px 0 8px;\">" + t("scoreByLayer") + "</h4><p style=\"font-size:0.9rem;margin-bottom:10px;\">Click a row to drill down, or use the tree.</p>";
        if (!scope.layer) {
          html += "<table class=\"dash-table\"><thead><tr><th>" + t("layer") + "</th><th class=\"score-cell\">" + t("score") + "</th><th>N</th><th>" + t("trendLabel") + "</th></tr></thead><tbody>";
          (filtered.byLayer || []).forEach(function (row) {
            var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
            var trendCell = row.trend ? "<span class=\"" + (row.trend.change >= 0 ? "score-good" : "score-low") + "\">" + (row.trend.change >= 0 ? "+" : "") + scoreFmt(row.trend.change) + "</span>" : "â€”";
            html += "<tr class=\"drill-row\" data-layer-label=\"" + escapeAttr(row.layerLabel || "") + "\" data-layer-title=\"" + escapeAttr(row.layerTitle || "") + "\"><td>" + escapeHtml(label) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td><td>" + (row.responseCount != null ? row.responseCount : "â€”") + "</td><td>" + trendCell + "</td></tr>";
          });
          html += "</tbody></table>";
        } else if (!scope.dimension) {
          html += "<table class=\"dash-table\"><thead><tr><th>" + t("dimension") + "</th><th class=\"score-cell\">" + t("score") + "</th><th>N</th><th>" + t("trendLabel") + "</th></tr></thead><tbody>";
          (filtered.byDimension || []).forEach(function (row) {
            var trendCell = row.trend ? "<span class=\"" + (row.trend.change >= 0 ? "score-good" : "score-low") + "\">" + (row.trend.change >= 0 ? "+" : "") + scoreFmt(row.trend.change) + "</span>" : "â€”";
            html += "<tr class=\"drill-row\" data-dimension-id=\"" + escapeAttr(row.dimensionId || "") + "\" data-dimension-name=\"" + escapeAttr(row.dimensionName || "") + "\" data-dimension-name-ar=\"" + escapeAttr(row.dimensionNameAr || "") + "\"><td>" + escapeHtml(trDimensionName(row.dimensionName, row.dimensionNameAr)) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td><td>" + (row.responseCount != null ? row.responseCount : "â€”") + "</td><td>" + trendCell + "</td></tr>";
          });
          html += "</tbody></table>";
        } else if (!scope.question) {
          html += "<p style=\"font-size:0.9rem;color:var(--color-text-muted);\">Use the question list to the right to open a question in the detail panel.</p>";
        } else {
          var q = scope.question;
          html += "<h4 style=\"font-size:1rem;margin:0 0 8px;\">Question detail</h4><div class=\"dash-card metrics-card\" style=\"text-align:left;max-width:600px;\">";
          html += "<p class=\"question-wording\" style=\"margin:0 0 12px;font-weight:600;\">" + escapeHtml(trQuestionLabel(q.label, q.labelAr)) + (q.isReversed ? " <span style=\"font-size:0.85rem;color:var(--color-text-muted);\">(R)</span>" : "") + "</p>";
          html += "<div class=\"metrics-row\" style=\"display:flex;flex-wrap:wrap;gap:16px 24px;margin-bottom:12px;\"><span>Mean: <span class=\"" + scoreClass(q.averageScore) + "\">" + scoreFmt(q.averageScore) + "</span> (0â€“100)</span>";
          if (q.medianScore != null) html += "<span>Median: <span class=\"" + scoreClass(q.medianScore) + "\">" + scoreFmt(q.medianScore) + "</span></span>";
          html += "<span>N: " + (q.responseCount || 0) + "</span>";
          if (q.benchmarkGap != null) html += "<span>" + t("benchmarkGapLabel") + ": " + (q.benchmarkGap >= 0 ? "+" : "") + scoreFmt(q.benchmarkGap) + "</span>";
          html += "</div>";
          if (q.distribution && (q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5] > 0)) {
            var total = q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5];
            html += "<p style=\"margin:0 0 4px;font-size:0.85rem;color:var(--color-text-muted);\">" + t("distributionLabel") + " (1â€“5)</p><div class=\"likert-bars\" style=\"display:flex;gap:4px;align-items:flex-end;height:32px;margin-bottom:10px;\">";
            for (var i = 1; i <= 5; i++) {
              var cnt = q.distribution[i] || 0;
              var pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
              html += "<div title=\"" + i + ": " + cnt + "\" style=\"flex:1;min-width:24px;background:var(--color-primary);opacity:" + (0.3 + (pct / 100) * 0.7) + ";height:" + Math.max(4, pct ? (pct / 100 * 28) : 0) + "px;border-radius:4px 4px 0 0;\"></div>";
            }
            html += "</div><p style=\"margin:0 0 8px;font-size:0.8rem;\">" + [1,2,3,4,5].map(function(i) { return i + ": " + (q.distribution[i] || 0); }).join(" &nbsp; ") + "</p>";
          }
          if (q.pctFavorable != null || q.pctNeutral != null || q.pctUnfavorable != null) html += "<p style=\"margin:0 0 4px;font-size:0.85rem;\"><span style=\"color:var(--score-good);\">" + t("pctFavorable") + ": " + (q.pctFavorable != null ? q.pctFavorable + "%" : "â€”") + "</span> &nbsp; <span style=\"color:var(--color-text-muted);\">" + t("pctNeutral") + ": " + (q.pctNeutral != null ? q.pctNeutral + "%" : "â€”") + "</span> &nbsp; <span style=\"color:var(--score-low);\">" + t("pctUnfavorable") + ": " + (q.pctUnfavorable != null ? q.pctUnfavorable + "%" : "â€”") + "</span></p>";
          if (q.trend) html += "<p style=\"margin:10px 0 0;font-size:0.9rem;padding:8px 12px;background:#f0f9ff;border-radius:8px;\"><strong>" + t("trendLabel") + ":</strong> " + escapeHtml(q.trend.previousPeriod) + " " + scoreFmt(q.trend.previousValue) + " â†’ " + escapeHtml(q.trend.currentPeriod) + " " + scoreFmt(q.trend.currentValue) + " <span class=\"" + (q.trend.change >= 0 ? "score-good" : "score-low") + "\">(" + (q.trend.change >= 0 ? "+" : "") + scoreFmt(q.trend.change) + ")</span></p>";
          html += "</div>";
        }
        el.innerHTML = html;
        el.querySelectorAll(".drill-row").forEach(function (row) {
          row.addEventListener("click", function () {
            if (row.getAttribute("data-layer-label") !== null) {
              var layerKey = (row.getAttribute("data-layer-label") || "") + "|" + (row.getAttribute("data-layer-title") || "");
              setAnalyticsState({ layer_id: layerKey, dimension_id: null, question_id: null });
            } else if (row.getAttribute("data-dimension-id")) {
              setAnalyticsState({ dimension_id: row.getAttribute("data-dimension-id"), question_id: null });
            } else if (row.getAttribute("data-question-id")) {
              setAnalyticsState({ question_id: row.getAttribute("data-question-id") });
            }
            setAnalyticsStateInUrl(analyticsState);
            loadUnifiedAnalytics();
          });
        });
      }

      function renderAnalyticsResultsPanel() {
        var el = document.getElementById("analytics-panel-results");
        if (!el || !analyticsData) return;
        var filtered = filterAnalyticsByScope(analyticsData);
        if (!filtered) return;
        var scope = analyticsScope;
        var html = "";
        if (analyticsData.totalResponses >= 0) html += "<p style=\"margin-bottom:12px;font-size:0.9rem;opacity:0.85;\">" + t("basedOnResponses", { count: analyticsData.totalResponses }) + "</p>";
        if (!scope.layer) {
          html += "<h4 style=\"font-size:1rem;margin:0 0 8px;\">" + t("scoreByLayer") + "</h4><p style=\"font-size:0.9rem;margin-bottom:10px;\">Click a layer to drill down.</p>";
          html += "<table class=\"dash-table\"><thead><tr><th>" + t("layer") + "</th><th class=\"score-cell\">" + t("score") + "</th><th>N</th><th>" + t("trendLabel") + "</th></tr></thead><tbody>";
          (filtered.byLayer || []).forEach(function (row) {
            var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
            var trendCell = row.trend ? "<span class=\"" + (row.trend.change >= 0 ? "score-good" : "score-low") + "\">" + (row.trend.change >= 0 ? "+" : "") + scoreFmt(row.trend.change) + "</span>" : "â€”";
            html += "<tr class=\"drill-row\" data-layer-label=\"" + escapeAttr(row.layerLabel || "") + "\" data-layer-title=\"" + escapeAttr(row.layerTitle || "") + "\"><td>" + escapeHtml(label) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td><td>" + (row.responseCount != null ? row.responseCount : "â€”") + "</td><td>" + trendCell + "</td></tr>";
          });
          html += "</tbody></table>";
        } else if (!scope.dimension) {
          html += "<h4 style=\"font-size:1rem;margin:0 0 8px;\">" + t("scoreByDimension") + "</h4><p style=\"font-size:0.9rem;margin-bottom:10px;\">Click a dimension to see questions.</p>";
          html += "<table class=\"dash-table\"><thead><tr><th>" + t("dimension") + "</th><th class=\"score-cell\">" + t("score") + "</th><th>N</th><th>" + t("trendLabel") + "</th></tr></thead><tbody>";
          (filtered.byDimension || []).forEach(function (row) {
            var trendCell = row.trend ? "<span class=\"" + (row.trend.change >= 0 ? "score-good" : "score-low") + "\">" + (row.trend.change >= 0 ? "+" : "") + scoreFmt(row.trend.change) + "</span>" : "â€”";
            html += "<tr class=\"drill-row\" data-dimension-id=\"" + escapeAttr(row.dimensionId || "") + "\" data-dimension-name=\"" + escapeAttr(row.dimensionName || "") + "\" data-dimension-name-ar=\"" + escapeAttr(row.dimensionNameAr || "") + "\"><td>" + escapeHtml(trDimensionName(row.dimensionName, row.dimensionNameAr)) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td><td>" + (row.responseCount != null ? row.responseCount : "â€”") + "</td><td>" + trendCell + "</td></tr>";
          });
          html += "</tbody></table>";
        } else if (!scope.question) {
          html += "<p style=\"font-size:0.9rem;color:var(--color-text-muted);\">Use the question list to the right to open a question in the detail panel.</p>";
        } else {
          var q = scope.question;
          html += "<h4 style=\"font-size:1rem;margin:0 0 8px;\">Question detail</h4>";
          html += "<div class=\"dash-card metrics-card\" style=\"text-align:left;max-width:600px;\">";
          html += "<p class=\"question-wording\" style=\"margin:0 0 12px;font-weight:600;\">" + escapeHtml(trQuestionLabel(q.label, q.labelAr)) + (q.isReversed ? " <span style=\"font-size:0.85rem;color:var(--color-text-muted);\">(R)</span>" : "") + "</p>";
          html += "<div class=\"metrics-row\" style=\"display:flex;flex-wrap:wrap;gap:16px 24px;margin-bottom:12px;\">";
          html += "<span>Mean: <span class=\"" + scoreClass(q.averageScore) + "\">" + scoreFmt(q.averageScore) + "</span> (0â€“100)</span>";
          if (q.medianScore != null) html += "<span>Median: <span class=\"" + scoreClass(q.medianScore) + "\">" + scoreFmt(q.medianScore) + "</span></span>";
          html += "<span>N: " + (q.responseCount || 0) + "</span>";
          if (q.benchmarkGap != null) html += "<span>" + t("benchmarkGapLabel") + ": " + (q.benchmarkGap >= 0 ? "+" : "") + scoreFmt(q.benchmarkGap) + "</span>";
          html += "</div>";
          if (q.distribution && (q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5] > 0)) {
            var total = q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5];
            html += "<p style=\"margin:0 0 4px;font-size:0.85rem;color:var(--color-text-muted);\">" + t("distributionLabel") + " (1â€“5)</p>";
            html += "<div class=\"likert-bars\" style=\"display:flex;gap:4px;align-items:flex-end;height:32px;margin-bottom:10px;\">";
            for (var i = 1; i <= 5; i++) {
              var cnt = q.distribution[i] || 0;
              var pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
              html += "<div title=\" " + i + ": " + cnt + "\" style=\"flex:1;min-width:24px;background:var(--color-primary);opacity:" + (0.3 + (pct / 100) * 0.7) + ";height:" + Math.max(4, pct ? (pct / 100 * 28) : 0) + "px;border-radius:4px 4px 0 0;\"></div>";
            }
            html += "</div>";
            html += "<p style=\"margin:0 0 8px;font-size:0.8rem;\">" + [1,2,3,4,5].map(function(i) { return i + ": " + (q.distribution[i] || 0); }).join(" &nbsp; ") + "</p>";
          }
          if (q.pctFavorable != null || q.pctNeutral != null || q.pctUnfavorable != null) {
            html += "<p style=\"margin:0 0 4px;font-size:0.85rem;\"><span style=\"color:var(--score-good);\">" + t("pctFavorable") + ": " + (q.pctFavorable != null ? q.pctFavorable + "%" : "â€”") + "</span> &nbsp; <span style=\"color:var(--color-text-muted);\">" + t("pctNeutral") + ": " + (q.pctNeutral != null ? q.pctNeutral + "%" : "â€”") + "</span> &nbsp; <span style=\"color:var(--score-low);\">" + t("pctUnfavorable") + ": " + (q.pctUnfavorable != null ? q.pctUnfavorable + "%" : "â€”") + "</span></p>";
          }
          if (q.trend) {
            html += "<p style=\"margin:10px 0 0;font-size:0.9rem;padding:8px 12px;background:#f0f9ff;border-radius:8px;\"><strong>" + t("trendLabel") + ":</strong> " + escapeHtml(q.trend.previousPeriod) + " " + scoreFmt(q.trend.previousValue) + " â†’ " + escapeHtml(q.trend.currentPeriod) + " " + scoreFmt(q.trend.currentValue) + " <span class=\"" + (q.trend.change >= 0 ? "score-good" : "score-low") + "\">(" + (q.trend.change >= 0 ? "+" : "") + scoreFmt(q.trend.change) + ")</span></p>";
          }
          html += "</div>";
        }
        el.innerHTML = html;
        el.querySelectorAll(".drill-row").forEach(function (row) {
          row.addEventListener("click", function () {
            if (row.getAttribute("data-layer-label") !== null) {
              var layerKey = (row.getAttribute("data-layer-label") || "") + "|" + (row.getAttribute("data-layer-title") || "");
              setAnalyticsState({ layer_id: layerKey, dimension_id: null, question_id: null });
            } else if (row.getAttribute("data-dimension-id")) {
              setAnalyticsState({ dimension_id: row.getAttribute("data-dimension-id"), question_id: null });
            } else if (row.getAttribute("data-question-id")) {
              setAnalyticsState({ question_id: row.getAttribute("data-question-id") });
            }
            setAnalyticsStateInUrl(analyticsState);
            loadUnifiedAnalytics();
          });
        });
      }

      function renderInsightContent(insight, el) {
        if (!insight) { el.innerHTML = "<p>No insights for this scope.</p>"; return; }
        var bullets = [];
        if (insight.headline) bullets.push(insight.headline);
        if (insight.what_we_see && insight.what_we_see.length) insight.what_we_see.forEach(function (b) { bullets.push(b); });
        if (insight.why_it_matters) bullets.push(insight.why_it_matters);
        if (insight.segments_to_watch && insight.segments_to_watch.length) insight.segments_to_watch.forEach(function (s) { bullets.push(s.segment + " (n=" + (s.n != null ? s.n : "—") + ")"); });
        var maxBullets = 6;
        bullets = bullets.slice(0, maxBullets);
        var html = "<div class=\"insight-summary\">";
        html += "<h4 class=\"insight-summary-title\">" + t("insightSummary") + "</h4>";
        if (bullets.length) {
          html += "<ul class=\"insight-summary-list\">";
          bullets.forEach(function (b) { html += "<li>" + escapeHtml(b) + "</li>"; });
          html += "</ul>";
        } else {
          html += "<p class=\"insight-summary-empty\">No insight bullets available.</p>";
        }
        if (insight.confidence) html += "<p class=\"insight-summary-confidence\">" + t("insightsConfidence") + ": " + escapeHtml(insight.confidence) + "</p>";
        html += "</div>";
        el.innerHTML = html;
      }

      function renderBenchmarkingInsightsFromStore() {
        var el = document.getElementById("benchmarking-panel-insights");
        if (!el) return;
        renderInsightContent(benchmarkingStore.insights, el);
      }

      async function renderAnalyticsInsightsPanel() {
        var el = document.getElementById("benchmarking-panel-insights");
        if (!el) return;
        if (benchmarkingStore.insights) { renderInsightContent(benchmarkingStore.insights, el); return; }
        el.innerHTML = "<p>Loading insightsâ€¦</p>";
        var demographicsPayload = (analyticsState && analyticsState.filters && analyticsState.filters.demographics) ? analyticsState.filters.demographics : {};
        var params = new URLSearchParams();
        if (Object.keys(demographicsPayload).length > 0) params.set("filters", JSON.stringify(demographicsPayload));
        var layerTitle = analyticsState.layer_id && analyticsState.layer_id.indexOf("|") >= 0 ? analyticsState.layer_id.split("|")[1] : (analyticsState.layer_id || "");
        if (layerTitle) params.set("layer_title", layerTitle);
        if (analyticsState.dimension_id) params.set("dimension_id", analyticsState.dimension_id);
        if (analyticsState.question_id) params.set("question_id", analyticsState.question_id);
        try {
          var res = await fetch(API_BASE + "/survey/insights?" + params.toString(), { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load insights. Check backend and login.</p>"; return; }
          var insight = await res.json();
          renderInsightContent(insight, el);
        } catch (err) {
          el.innerHTML = "<p>Could not load insights.</p>";
        }
      }

      function insightForScore(score) {
        if (score < 25) return "Priority focus: act now. Target quick wins and leadership visibility to build momentum.";
        if (score < 50) return "Room to grow: invest in clarity, skills, and processâ€”small steps will add up.";
        if (score < 75) return "Solid foundation: double down on what works and spread good practices across teams.";
        return "Strong spot: keep it up and document what's working so others can learn.";
      }

      function collectAllActions(data) {
        var list = [];
        var type = "";
        if (data.quick_wins && data.quick_wins.length) { type = t("recQuickWins"); data.quick_wins.forEach(function (a) { list.push({ action: a, type: type }); }); }
        if (data.strategic_initiatives && data.strategic_initiatives.length) { type = t("recStrategicInitiatives"); data.strategic_initiatives.forEach(function (a) { list.push({ action: a, type: type }); }); }
        if (data.recommended_actions && data.recommended_actions.length) { type = t("recRecommendedActions"); data.recommended_actions.forEach(function (a) { list.push({ action: a, type: type }); }); }
        return list;
      }

      function scopeLabelFromAction(a) {
        if (!a || !a.scope_link) return "";
        var parts = [];
        if (a.scope_link.layer_id) parts.push("Layer");
        if (a.scope_link.dimension_id) parts.push("Dimension");
        if (a.scope_link.question_id) parts.push("Question");
        return parts.length ? parts.join(" \u203a ") : "";
      }

      function renderRecommendationsContent(data, el) {
        if (!data) { el.innerHTML = "<p>No recommendations for this scope.</p>"; return; }
        var all = collectAllActions(data);
        if (all.length === 0) { el.innerHTML = "<p>No recommendations for this scope.</p>"; return; }
        var html = "<div class=\"action-plan\"><h4 class=\"action-plan-title\">" + t("actionPlan") + "</h4>";
        html += "<div class=\"action-plan-table-wrap\"><table class=\"action-plan-table\"><thead><tr>";
        html += "<th class=\"action-plan-th-action\">" + t("recAction") + "</th><th>" + t("recOwner") + "</th><th>" + t("recTimeframe") + "</th><th>" + t("recEffort") + "</th><th>" + t("recImpact") + "</th><th>" + t("recMetrics") + "</th><th class=\"action-plan-th-expand\"></th>";
        html += "</tr></thead><tbody>";
        all.forEach(function (row, idx) {
          var a = row.action;
          var title = (a.title || a.action || a.text || "").trim() || "\u2014";
          var owner = (a.owner_suggestion || "").trim() || "\u2014";
          var timeframe = (a.timeframe != null && a.timeframe !== "") ? (a.timeframe + (String(a.timeframe).match(/^\d+$/) ? " days" : "")) : "\u2014";
          var effort = (a.effort || "").trim() || "\u2014";
          var impact = (a.impact || "").trim() || "\u2014";
          var metrics = (a.success_metrics || "").trim() || "\u2014";
          var hasExpand = (a.rationale || a.success_metrics || scopeLabelFromAction(a));
          var rowId = "action-row-" + idx;
          var expandId = "action-expand-" + idx;
          html += "<tr class=\"action-plan-row\" data-row-id=\"" + rowId + "\" data-expand-id=\"" + expandId + "\"" + (hasExpand ? " role=\"button\" tabindex=\"0\"" : "") + ">";
          html += "<td class=\"action-plan-cell-action\"><span class=\"action-plan-type\">" + escapeHtml(row.type) + "</span> " + escapeHtml(title) + "</td>";
          html += "<td>" + escapeHtml(owner) + "</td><td>" + escapeHtml(timeframe) + "</td><td>" + escapeHtml(effort) + "</td><td>" + escapeHtml(impact) + "</td><td class=\"action-plan-cell-metrics\">" + escapeHtml(metrics) + "</td>";
          html += "<td class=\"action-plan-cell-expand\">" + (hasExpand ? "<button type=\"button\" class=\"action-plan-expand-btn\" id=\"" + expandId + "\" aria-expanded=\"false\" aria-controls=\"" + rowId + "-detail\">+</button>" : "") + "</td>";
          html += "</tr>";
          if (hasExpand) {
            html += "<tr id=\"" + rowId + "-detail\" class=\"action-plan-detail-row\" aria-hidden=\"true\" hidden><td colspan=\"7\" class=\"action-plan-detail-cell\">";
            if (a.rationale) html += "<p class=\"action-plan-detail-label\">" + t("recRationale") + "</p><p class=\"action-plan-detail-text\">" + escapeHtml(a.rationale) + "</p>";
            if (a.success_metrics && (a.success_metrics || "").trim()) html += "<p class=\"action-plan-detail-label\">" + t("recSuccessMetrics") + "</p><p class=\"action-plan-detail-text\">" + escapeHtml(a.success_metrics) + "</p>";
            var scopeL = scopeLabelFromAction(a);
            if (scopeL) html += "<p class=\"action-plan-detail-label\">" + t("recEvidence") + " / " + t("recScope") + "</p><p class=\"action-plan-detail-text\">" + escapeHtml(scopeL) + "</p>";
            html += "</td></tr>";
          }
        });
        html += "</tbody></table></div></div>";
        el.innerHTML = html;
        el.querySelectorAll(".action-plan-row[data-expand-id]").forEach(function (tr) {
          var expandId = tr.getAttribute("data-expand-id");
          var rowId = tr.getAttribute("data-row-id");
          var btn = document.getElementById(expandId);
          var detail = document.getElementById(rowId + "-detail");
          function toggle() {
            if (!detail) return;
            var open = detail.getAttribute("aria-hidden") !== "true";
            detail.setAttribute("aria-hidden", open ? "true" : "false");
            detail.hidden = open;
            if (btn) { btn.textContent = open ? "+" : "\u2212"; btn.setAttribute("aria-expanded", open ? "false" : "true"); }
          }
          tr.addEventListener("click", function (e) { if (!e.target.classList.contains("action-plan-expand-btn")) toggle(); });
          if (btn) btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
        });
      }

      function renderBenchmarkingRecommendationsFromStore() {
        var el = document.getElementById("benchmarking-panel-recommendations");
        if (!el) return;
        renderRecommendationsContent(benchmarkingStore.recommendations, el);
      }

      async function renderAnalyticsRecommendationsPanel() {
        var el = document.getElementById("benchmarking-panel-recommendations");
        if (!el) return;
        if (benchmarkingStore.recommendations) { renderRecommendationsContent(benchmarkingStore.recommendations, el); return; }
        el.innerHTML = "<p>Loading recommendationsâ€¦</p>";
        var demographicsPayload = (analyticsState && analyticsState.filters && analyticsState.filters.demographics) ? analyticsState.filters.demographics : {};
        var params = new URLSearchParams();
        if (Object.keys(demographicsPayload).length > 0) params.set("filters", JSON.stringify(demographicsPayload));
        var layerTitle = analyticsState.layer_id && analyticsState.layer_id.indexOf("|") >= 0 ? analyticsState.layer_id.split("|")[1] : (analyticsState.layer_id || "");
        if (layerTitle) params.set("layer_title", layerTitle);
        if (analyticsState.dimension_id) params.set("dimension_id", analyticsState.dimension_id);
        if (analyticsState.question_id) params.set("question_id", analyticsState.question_id);
        try {
          var res = await fetch(API_BASE + "/survey/recommendations?" + params.toString(), { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load recommendations. Check backend and login.</p>"; return; }
          var data = await res.json();
          renderRecommendationsContent(data, el);
        } catch (err) {
          el.innerHTML = "<p>Could not load recommendations.</p>";
        }
      }

      async function loadUnifiedAnalytics() {
        analyticsState = getAnalyticsStateFromUrl();
        var slicersEl = document.getElementById("analytics-slicers");
        if (slicersEl) slicersEl.classList.add("hidden");
        ["benchmarking-panel-results", "benchmarking-panel-insights", "benchmarking-panel-recommendations"].forEach(function (id) {
          var p = document.getElementById(id);
          if (p) p.innerHTML = "<p>Loadingâ€¦</p>";
        });
        var demographicsPayload = analyticsState.filters.demographics || {};
        var filtersStr = Object.keys(demographicsPayload).length > 0 ? JSON.stringify(demographicsPayload) : "";
        var layerTitle = (analyticsState.layer_id && analyticsState.layer_id.indexOf("|") >= 0) ? analyticsState.layer_id.split("|")[1] : (analyticsState.layer_id || "");
        var scope = { layerTitle: layerTitle || undefined, dimensionId: analyticsState.dimension_id || undefined, questionId: analyticsState.question_id || undefined };
        try {
          var resultsParams = new URLSearchParams();
          if (filtersStr) resultsParams.set("filters", filtersStr);
          if (scope.layerTitle) resultsParams.set("layer_title", scope.layerTitle);
          if (scope.dimensionId) resultsParams.set("dimension_id", scope.dimensionId);
          if (scope.questionId) resultsParams.set("question_id", scope.questionId);
          var resResults = await fetch(API_BASE + "/api/results?" + resultsParams.toString(), { credentials: "include" });
          if (!resResults.ok) {
            var mainArea = document.getElementById("benchmarking-main-area");
            if (mainArea) mainArea.innerHTML = "<p>Unable to load results. Check backend and login.</p>";
            return;
          }
          var resultsData = await resResults.json();
          analyticsData = resultsData;
          benchmarkingStore.results = resultsData;
          syncScopeFromState(analyticsData);
          var insufficientBanner = document.getElementById("analytics-insufficient-banner");
          if (analyticsData.insufficientSample) {
            if (insufficientBanner) { insufficientBanner.textContent = t("insufficientSample") + " â€” " + (analyticsData.totalResponses || 0) + " response(s). Results are hidden to protect anonymity."; insufficientBanner.classList.remove("hidden"); }
          } else {
            if (insufficientBanner) insufficientBanner.classList.add("hidden");
          }
          var demographics = analyticsData.demographics || [];
          var demographicsToShow = demographicFiltersToShow(demographics);
          if (slicersEl && demographicsToShow.length > 0) {
            var slicerHtml = "";
            demographicsToShow.forEach(function (d) {
              var currentVal = (analyticsState.filters.demographics || {})[d.questionId];
              var optionValues = (d.allOptions && d.allOptions.length) ? d.allOptions : (d.options || []).map(function (o) { return o.value; });
              optionValues = optionValues.filter(function (v) { return v !== "Other (insufficient sample)"; });
              if (optionValues.length === 0) optionValues = (d.options || []).map(function (o) { return o.value; });
              var seen = {};
              slicerHtml += "<div class=\"dash-slicer-item\"><label for=\"analytics-slicer-" + escapeAttr(d.questionId) + "\">" + escapeHtml(trQuestionLabel(d.label, d.labelAr)) + "</label><select id=\"analytics-slicer-" + escapeAttr(d.questionId) + "\" class=\"dash-slicer-select\" data-question-id=\"" + escapeAttr(d.questionId) + "\"><option value=\"\">All</option>";
              optionValues.forEach(function (val) {
                if (seen[val]) return;
                seen[val] = true;
                var isSelected = (currentVal === val);
                slicerHtml += "<option value=\"" + escapeAttr(val) + "\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption(val === "(blank)" ? "(blank)" : val)) + "</option>";
              });
              (d.options || []).forEach(function (opt) {
                if (opt.value === "(blank)" && !seen["(blank)"] && opt.count != null) { seen["(blank)"] = true; slicerHtml += "<option value=\"(blank)\"" + (currentVal === "(blank)" ? " selected" : "") + ">" + escapeHtml(trOption("(blank)")) + "</option>"; }
              });
              slicerHtml += "</select></div>";
            });
            slicersEl.innerHTML = slicerHtml;
            slicersEl.classList.remove("hidden");
            slicersEl.querySelectorAll(".dash-slicer-select").forEach(function (sel) {
              sel.addEventListener("change", function () {
                var qId = sel.getAttribute("data-question-id");
                var v = sel.value;
                var dem = Object.assign({}, analyticsState.filters.demographics);
                if (v) dem[qId] = v; else delete dem[qId];
                analyticsState.filters.demographics = dem;
                setAnalyticsStateInUrl(analyticsState);
                loadUnifiedAnalytics();
              });
            });
          }
          var insightsBody = { filters: demographicsPayload && Object.keys(demographicsPayload).length ? demographicsPayload : undefined, scope: scope };
          var resInsights = await fetch(API_BASE + "/api/insights", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(insightsBody) });
          if (resInsights.ok) {
            benchmarkingStore.insights = await resInsights.json();
          } else {
            benchmarkingStore.insights = null;
          }
          var recBody = { filters: demographicsPayload && Object.keys(demographicsPayload).length ? demographicsPayload : undefined, scope: scope, insights: benchmarkingStore.insights || undefined };
          var resRec = await fetch(API_BASE + "/api/recommendations", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recBody) });
          if (resRec.ok) {
            benchmarkingStore.recommendations = await resRec.json();
          } else {
            benchmarkingStore.recommendations = null;
          }
          renderAnalyticsBreadcrumb();
          renderScopeSummaryChips();
          renderBenchmarkingResultsPanel();
          renderBenchmarkingInsightsFromStore();
          renderBenchmarkingRecommendationsFromStore();
          renderAIPanel();
          var hasLayer = !!(analyticsState.layer_id);
          var hasDimension = !!(analyticsState.dimension_id);
          var hasQuestion = !!(analyticsState.question_id);
          /* URL scope: layer, dimension, question, view (results|insights|recommendations). Same scope for all 3 tabs.
           * question_id -> drawer only (dimension scope + questions table + open drawer).
           * dimension_id -> questions table. layer_id -> dimension heatmap. no selection -> layer cards + heatmap. */
          var scopeAll = document.getElementById("benchmarking-scope-all");
          var scopeLayer = document.getElementById("benchmarking-scope-layer");
          var scopeDimension = document.getElementById("benchmarking-scope-dimension");
          var mainContent = document.getElementById("benchmarking-main-content");
          function showScope(id) {
            [scopeAll, scopeLayer, scopeDimension, mainContent].forEach(function (el) {
              if (!el) return;
              var is = el.id === id;
              el.style.display = is ? "" : "none";
              el.classList.toggle("hidden", !is);
            });
          }
          var showResultsView = (analyticsActiveTab === "results");
          if (showResultsView) {
            if (hasQuestion) {
              showScope("benchmarking-scope-dimension");
              questionsPage = 1;
              renderBenchmarkingQuestionsTable(analyticsData);
              openQuestionDrawer(analyticsState.question_id);
            } else if (hasDimension) {
              showScope("benchmarking-scope-dimension");
              questionsPage = 1;
              renderBenchmarkingQuestionsTable(analyticsData);
              closeQuestionDrawer();
            } else if (hasLayer) {
              showScope("benchmarking-scope-layer");
              renderLayerScopeContent(analyticsData);
              closeQuestionDrawer();
            } else {
              showScope("benchmarking-scope-all");
              renderLayerCards(analyticsData);
              renderDimensionsHeatmapAll(analyticsData);
              closeQuestionDrawer();
            }
          } else {
            if (hasQuestion) {
              showScope("benchmarking-scope-dimension");
              questionsPage = 1;
              renderBenchmarkingQuestionsTable(analyticsData);
              openQuestionDrawer(analyticsState.question_id);
            } else {
              showScope("benchmarking-main-content");
              mainContent.style.display = "";
              mainContent.classList.remove("hidden");
            }
          }
          if (analyticsState.compare_vs_previous_period) loadAnalyticsByPeriod();
          document.querySelectorAll(".benchmarking-view-btn").forEach(function (btn) {
            btn.classList.toggle("active", (btn.getAttribute("data-view") || "") === analyticsActiveTab);
          });
          document.querySelectorAll(".benchmarking-panel").forEach(function (panel) {
            panel.classList.toggle("active", panel.id === "benchmarking-panel-" + analyticsActiveTab);
          });
          setAnalyticsStateInUrl(analyticsState);
        } catch (err) {
          var mainArea = document.getElementById("benchmarking-main-area");
          if (mainArea) mainArea.innerHTML = "<p>Could not load data.</p>";
        }
      }

      var questionsPage = 1;
      var questionsPageSize = 20;
      var questionsActiveFilters = { "low-score": false, "high-polarization": false, "negative-trend": false, "largest-gap": false };

      function questionPolarization(q) {
        var fav = q.pctFavorable != null ? q.pctFavorable : 0;
        var unf = q.pctUnfavorable != null ? q.pctUnfavorable : 0;
        if (fav <= 0 && unf <= 0) return null;
        return Math.min(fav, unf);
      }

      function questionFlags(q) {
        var flags = [];
        if (q.averageScore != null && q.averageScore < 50) flags.push({ c: "low", l: "Low" });
        var pol = questionPolarization(q);
        if (pol != null && pol >= 25) flags.push({ c: "polarized", l: "Polarized" });
        if (q.trend && q.trend.change < 0) flags.push({ c: "declining", l: "Declining" });
        if (q.benchmarkGap != null) flags.push({ c: "gap", l: "Gap" });
        return flags;
      }

      function renderBenchmarkingQuestionsTable(data) {
        if (!data || !data.byQuestion) return;
        var filtered = filterAnalyticsByScope(data);
        if (!filtered) return;
        var questions = filtered.byQuestion || [];
        var searchEl = document.getElementById("questions-search");
        var sortEl = document.getElementById("questions-sort");
        var titleEl = document.getElementById("questions-area-title");
        var tableWrap = document.getElementById("questions-table-wrap");
        var paginationEl = document.getElementById("questions-pagination");
        var chipsEl = document.getElementById("questions-filter-chips");
        if (!tableWrap) return;

        var dimName = analyticsScope.dimension ? trDimensionName(analyticsScope.dimension.dimensionName, analyticsScope.dimension.dimensionNameAr) : "";
        if (titleEl) titleEl.textContent = dimName ? "Questions in " + dimName : t("question");

        var term = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : "";
        var filteredQ = term ? questions.filter(function (q) { return (trQuestionLabel(q.label, q.labelAr)).toLowerCase().indexOf(term) >= 0; }) : questions;

        if (questionsActiveFilters["low-score"]) filteredQ = filteredQ.filter(function (q) { return (q.averageScore != null) && q.averageScore < 50; });
        if (questionsActiveFilters["high-polarization"]) filteredQ = filteredQ.filter(function (q) { var p = questionPolarization(q); return p != null && p >= 25; });
        if (questionsActiveFilters["negative-trend"]) filteredQ = filteredQ.filter(function (q) { return q.trend && q.trend.change < 0; });
        if (questionsActiveFilters["largest-gap"]) filteredQ = filteredQ.filter(function (q) { return q.benchmarkGap != null; });

        var sortVal = (sortEl && sortEl.value) || "score-desc";
        filteredQ = filteredQ.slice();
        if (sortVal === "score-desc") filteredQ.sort(function (a, b) { return (b.averageScore != null ? b.averageScore : 0) - (a.averageScore != null ? a.averageScore : 0); });
        else if (sortVal === "score-asc") filteredQ.sort(function (a, b) { return (a.averageScore != null ? a.averageScore : 0) - (b.averageScore != null ? b.averageScore : 0); });
        else if (sortVal === "trend-desc") filteredQ.sort(function (a, b) { var ca = a.trend && a.trend.change != null ? a.trend.change : -999; var cb = b.trend && b.trend.change != null ? b.trend.change : -999; return cb - ca; });
        else if (sortVal === "trend-asc") filteredQ.sort(function (a, b) { var ca = a.trend && a.trend.change != null ? a.trend.change : 999; var cb = b.trend && b.trend.change != null ? b.trend.change : 999; return ca - cb; });
        else if (sortVal === "gap-asc") filteredQ.sort(function (a, b) { var ga = a.benchmarkGap != null ? a.benchmarkGap : 999; var gb = b.benchmarkGap != null ? b.benchmarkGap : 999; return ga - gb; });
        else if (sortVal === "gap-desc") filteredQ.sort(function (a, b) { var ga = a.benchmarkGap != null ? a.benchmarkGap : -999; var gb = b.benchmarkGap != null ? b.benchmarkGap : -999; return gb - ga; });
        else if (sortVal === "polarization-desc") filteredQ.sort(function (a, b) { var pa = questionPolarization(a); var pb = questionPolarization(b); return (pb != null ? pb : 0) - (pa != null ? pa : 0); });
        else if (sortVal === "name-asc") filteredQ.sort(function (a, b) { return (trQuestionLabel(a.label, a.labelAr)).localeCompare(trQuestionLabel(b.label, b.labelAr)); });

        var total = filteredQ.length;
        var totalPages = Math.max(1, Math.ceil(total / questionsPageSize));
        if (questionsPage > totalPages) questionsPage = totalPages;
        var start = (questionsPage - 1) * questionsPageSize;
        var pageQuestions = filteredQ.slice(start, start + questionsPageSize);

        function openDrawerForQuestion(qId) {
          setAnalyticsState({ question_id: qId });
          setAnalyticsStateInUrl(analyticsState);
          loadUnifiedAnalytics();
        }

        tableWrap.classList.remove("hidden");
        tableWrap.style.display = "";
        var QUESTION_TRUNCATE = 48;
        var header = "<table class=\"questions-table\"><thead><tr>";
        header += "<th class=\"question-label\">" + t("question") + "</th>";
        header += "<th class=\"score-cell\">" + t("score") + "</th>";
        header += "<th class=\"num-cell\">" + t("pctFavorable") + "</th>";
        header += "<th class=\"num-cell\">" + t("trendLabel") + "</th>";
        header += "<th class=\"num-cell\">" + t("benchmarkGapLabel") + "</th>";
        header += "<th class=\"num-cell\">n</th>";
        header += "<th class=\"flags-cell\">Flags</th>";
        header += "</tr></thead><tbody>";
        var body = "";
        pageQuestions.forEach(function (q) {
          var label = trQuestionLabel(q.label, q.labelAr);
          var truncated = label.length > QUESTION_TRUNCATE ? label.slice(0, QUESTION_TRUNCATE) + "\u2026" : label;
          var favStr = q.pctFavorable != null ? (q.pctFavorable + "%") : "\u2014";
          var trendStr = (q.trend && q.trend.change != null) ? (q.trend.change >= 0 ? "+" : "") + scoreFmt(q.trend.change) : "\u2014";
          var gapStr = q.benchmarkGap != null ? (q.benchmarkGap >= 0 ? "+" : "") + scoreFmt(q.benchmarkGap) : "\u2014";
          var flags = questionFlags(q);
          var flagsHtml = flags.length ? flags.map(function (f) { return "<span class=\"flag-tag " + f.c + "\">" + escapeHtml(f.l) + "</span>"; }).join("") : "\u2014";
          body += "<tr class=\"question-row\" data-question-id=\"" + escapeAttr(q.questionId) + "\" role=\"button\" tabindex=\"0\">";
          body += "<td class=\"question-label\" title=\"" + escapeAttr(label) + "\"><span class=\"question-label-truncated\">" + escapeHtml(truncated) + "</span></td>";
          body += "<td class=\"score-cell " + scoreClass(q.averageScore) + "\">" + scoreFmt(q.averageScore) + "</td>";
          body += "<td class=\"num-cell\">" + escapeHtml(favStr) + "</td>";
          body += "<td class=\"num-cell\">" + escapeHtml(trendStr) + "</td>";
          body += "<td class=\"num-cell\">" + escapeHtml(gapStr) + "</td>";
          body += "<td class=\"num-cell\">" + (q.responseCount || 0) + "</td>";
          body += "<td class=\"flags-cell\">" + flagsHtml + "</td>";
          body += "</tr>";
        });
        tableWrap.innerHTML = header + body + "</tbody></table>";
        tableWrap.querySelectorAll(".question-row").forEach(function (row) {
          var qId = row.getAttribute("data-question-id");
          row.addEventListener("click", function () { openDrawerForQuestion(qId); });
          row.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawerForQuestion(qId); } });
        });

        if (paginationEl) {
          if (totalPages <= 1 && total <= questionsPageSize) {
            paginationEl.classList.add("hidden");
            paginationEl.style.display = "none";
          } else {
            paginationEl.classList.remove("hidden");
            paginationEl.style.display = "flex";
            var from = total === 0 ? 0 : start + 1;
            var to = Math.min(start + questionsPageSize, total);
            paginationEl.innerHTML = "<button type=\"button\" id=\"questions-prev\" " + (questionsPage <= 1 ? "disabled" : "") + ">Previous</button><span>" + from + "â€“" + to + " of " + total + "</span><button type=\"button\" id=\"questions-next\" " + (questionsPage >= totalPages ? "disabled" : "") + ">Next</button>";
            var prevBtn = document.getElementById("questions-prev");
            var nextBtn = document.getElementById("questions-next");
            if (prevBtn) prevBtn.addEventListener("click", function () { if (questionsPage > 1) { questionsPage--; renderBenchmarkingQuestionsTable(analyticsData); } });
            if (nextBtn) nextBtn.addEventListener("click", function () { if (questionsPage < totalPages) { questionsPage++; renderBenchmarkingQuestionsTable(analyticsData); } });
          }
        }

        if (chipsEl && !chipsEl._chipsBound) {
          chipsEl._chipsBound = true;
          chipsEl.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var key = btn.getAttribute("data-filter");
              if (key && questionsActiveFilters.hasOwnProperty(key)) {
                questionsActiveFilters[key] = !questionsActiveFilters[key];
                btn.setAttribute("aria-pressed", questionsActiveFilters[key] ? "true" : "false");
                questionsPage = 1;
                renderBenchmarkingQuestionsTable(analyticsData);
              }
            });
          });
        }
        if (chipsEl) {
          chipsEl.querySelectorAll(".filter-chip").forEach(function (btn) {
            var key = btn.getAttribute("data-filter");
            if (key) btn.setAttribute("aria-pressed", questionsActiveFilters[key] ? "true" : "false");
          });
        }

        if (searchEl && !searchEl._bound) {
          searchEl._bound = true;
          searchEl.addEventListener("input", function () { questionsPage = 1; renderBenchmarkingQuestionsTable(analyticsData); });
        }
        if (sortEl && !sortEl._bound) {
          sortEl._bound = true;
          sortEl.addEventListener("change", function () { questionsPage = 1; renderBenchmarkingQuestionsTable(analyticsData); });
        }
      }

      function renderQuestionDrawerContent(q, el) {
        if (!q || !el) return;
        var html = "<div class=\"drawer-question-overview\">";
        html += "<p class=\"drawer-question-text\">" + escapeHtml(trQuestionLabel(q.label, q.labelAr)) + (q.isReversed ? " <span class=\"drawer-question-reversed\">(R)</span>" : "") + "</p>";
        html += "<div class=\"drawer-metrics-row\">";
        html += "<span>n: <strong>" + (q.responseCount != null ? q.responseCount : "\u2014") + "</strong></span>";
        html += "<span>" + t("score") + ": <span class=\"" + scoreClass(q.averageScore) + "\"><strong>" + scoreFmt(q.averageScore) + "</strong></span></span>";
        html += "<span>" + t("pctFavorable") + ": " + (q.pctFavorable != null ? q.pctFavorable + "%" : "\u2014") + "</span>";
        if (q.trend && q.trend.change != null) html += "<span>" + t("trendLabel") + ": <span class=\"" + (q.trend.change >= 0 ? "score-good" : "score-low") + "\">" + (q.trend.change >= 0 ? "+" : "") + scoreFmt(q.trend.change) + "</span></span>";
        if (q.benchmarkGap != null) html += "<span>" + t("benchmarkGapLabel") + ": " + (q.benchmarkGap >= 0 ? "+" : "") + scoreFmt(q.benchmarkGap) + "</span>";
        html += "</div>";
        if (q.distribution && (q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5] > 0)) {
          var total = q.distribution[1] + q.distribution[2] + q.distribution[3] + q.distribution[4] + q.distribution[5];
          html += "<p class=\"drawer-distribution-label\">" + t("distributionLabel") + " (1\u20135)</p>";
          html += "<div class=\"drawer-likert-bars\">";
          for (var i = 1; i <= 5; i++) {
            var cnt = q.distribution[i] || 0;
            var pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            html += "<div class=\"drawer-likert-bar\" title=\"" + i + ": " + cnt + "\" style=\"height:" + Math.max(4, pct ? (pct / 100 * 36) : 0) + "px;opacity:" + (0.35 + (pct / 100) * 0.65) + ";\"></div>";
          }
          html += "</div>";
          html += "<p class=\"drawer-likert-legend\">" + [1, 2, 3, 4, 5].map(function (i) { return i + ": " + (q.distribution[i] || 0); }).join(" \u00b7 ") + "</p>";
        }
        var whyMatters = (benchmarkingStore.insights && benchmarkingStore.insights.why_it_matters) ? benchmarkingStore.insights.why_it_matters : "";
        html += "<div class=\"drawer-why-matters\" id=\"drawer-why-matters-block\">";
        html += "<p class=\"drawer-why-matters-label\">" + t("insightsWhyItMatters") + "</p>";
        html += "<p class=\"drawer-why-matters-text\">" + (whyMatters ? escapeHtml(whyMatters) : "<span class=\"drawer-placeholder\">" + t("drawerWhyMattersPlaceholder") + "</span>") + "</p>";
        html += "</div>";
        html += "<div class=\"drawer-actions\">";
        html += "<button type=\"button\" class=\"drawer-action-btn\" id=\"drawer-btn-generate-insights\">" + t("drawerGenerateInsights") + "</button>";
        html += "<button type=\"button\" class=\"drawer-action-btn\" id=\"drawer-btn-generate-rec\">" + t("drawerGenerateRecommendations") + "</button>";
        html += "</div>";
        html += "</div>";
        el.innerHTML = html;
      }

      function openQuestionDrawer(questionId) {
        var overlay = document.getElementById("drawer-overlay");
        var scope = analyticsScope;
        var q = scope && scope.question ? scope.question : (analyticsData && analyticsData.byQuestion ? analyticsData.byQuestion.find(function (x) { return x.questionId === questionId; }) : null);
        if (overlay) {
          overlay.classList.add("open");
          overlay.setAttribute("aria-hidden", "false");
        }
        var titleEl = document.getElementById("drawer-title");
        if (titleEl && q) titleEl.textContent = trQuestionLabel(q.label, q.labelAr);
        var dResults = document.getElementById("drawer-panel-results");
        var dInsights = document.getElementById("drawer-panel-insights");
        var dRec = document.getElementById("drawer-panel-recommendations");
        if (q && dResults) {
          renderQuestionDrawerContent(q, dResults);
          var btnInsights = document.getElementById("drawer-btn-generate-insights");
          var btnRec = document.getElementById("drawer-btn-generate-rec");
          if (btnInsights) {
            btnInsights.addEventListener("click", function () { generateDrawerInsightsAndUpdate(questionId); });
          }
          if (btnRec) {
            btnRec.addEventListener("click", function () { generateDrawerRecommendationsAndUpdate(questionId); });
          }
        }
        var insightsEl = document.getElementById("benchmarking-panel-insights");
        var recEl = document.getElementById("benchmarking-panel-recommendations");
        if (insightsEl && dInsights) dInsights.innerHTML = insightsEl.innerHTML;
        if (recEl && dRec) dRec.innerHTML = recEl.innerHTML;
        document.querySelectorAll(".drawer-view-btn").forEach(function (btn) {
          btn.classList.toggle("active", (btn.getAttribute("data-drawer-view") || "") === analyticsActiveTab);
        });
        ["results", "insights", "recommendations"].forEach(function (v) {
          var el = document.getElementById("drawer-panel-" + v);
          if (el) el.classList.toggle("active", v === analyticsActiveTab);
        });
      }

      async function generateDrawerInsightsAndUpdate(questionId) {
        var btn = document.getElementById("drawer-btn-generate-insights");
        if (btn) { btn.disabled = true; btn.textContent = "Generating…"; }
        var demographicsPayload = (analyticsState && analyticsState.filters && analyticsState.filters.demographics) ? analyticsState.filters.demographics : {};
        var layerTitle = (analyticsState.layer_id && analyticsState.layer_id.indexOf("|") >= 0) ? analyticsState.layer_id.split("|")[1] : (analyticsState.layer_id || "");
        var scope = { layerTitle: layerTitle || undefined, dimensionId: analyticsState.dimension_id || undefined, questionId: questionId || analyticsState.question_id || undefined };
        try {
          var res = await fetch(API_BASE + "/api/insights", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters: demographicsPayload, scope: scope }) });
          if (res.ok) benchmarkingStore.insights = await res.json();
          else benchmarkingStore.insights = null;
        } catch (e) { benchmarkingStore.insights = null; }
        var whyBlock = document.getElementById("drawer-why-matters-block");
        if (whyBlock) {
          var textEl = whyBlock.querySelector(".drawer-why-matters-text");
          if (textEl) textEl.innerHTML = (benchmarkingStore.insights && benchmarkingStore.insights.why_it_matters) ? escapeHtml(benchmarkingStore.insights.why_it_matters) : "<span class=\"drawer-placeholder\">" + t("drawerWhyMattersPlaceholder") + "</span>";
        }
        var dInsights = document.getElementById("drawer-panel-insights");
        if (dInsights && benchmarkingStore.insights) renderInsightContent(benchmarkingStore.insights, dInsights);
        else if (dInsights) dInsights.innerHTML = "<p>No insights for this question.</p>";
        if (btn) { btn.disabled = false; btn.textContent = t("drawerGenerateInsights"); }
      }

      async function generateDrawerRecommendationsAndUpdate(questionId) {
        var btn = document.getElementById("drawer-btn-generate-rec");
        if (btn) { btn.disabled = true; btn.textContent = "Generating…"; }
        var demographicsPayload = (analyticsState && analyticsState.filters && analyticsState.filters.demographics) ? analyticsState.filters.demographics : {};
        var layerTitle = (analyticsState.layer_id && analyticsState.layer_id.indexOf("|") >= 0) ? analyticsState.layer_id.split("|")[1] : (analyticsState.layer_id || "");
        var scope = { layerTitle: layerTitle || undefined, dimensionId: analyticsState.dimension_id || undefined, questionId: questionId || analyticsState.question_id || undefined };
        try {
          var resInsights = await fetch(API_BASE + "/api/insights", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters: demographicsPayload, scope: scope }) });
          if (resInsights.ok) benchmarkingStore.insights = await resInsights.json();
          else benchmarkingStore.insights = null;
          var resRec = await fetch(API_BASE + "/api/recommendations", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters: demographicsPayload, scope: scope, insights: benchmarkingStore.insights || undefined }) });
          if (resRec.ok) benchmarkingStore.recommendations = await resRec.json();
          else benchmarkingStore.recommendations = null;
        } catch (e) { benchmarkingStore.recommendations = null; }
        var dRec = document.getElementById("drawer-panel-recommendations");
        if (dRec && benchmarkingStore.recommendations) renderRecommendationsContent(benchmarkingStore.recommendations, dRec);
        else if (dRec) dRec.innerHTML = "<p>No recommendations for this question.</p>";
        if (btn) { btn.disabled = false; btn.textContent = t("drawerGenerateRecommendations"); }
      }

      function closeQuestionDrawer() {
        var overlay = document.getElementById("drawer-overlay");
        if (overlay) {
          overlay.classList.remove("open");
          overlay.setAttribute("aria-hidden", "true");
        }
      }

      document.getElementById("drawer-close").addEventListener("click", function () {
        setAnalyticsState({ question_id: null });
        setAnalyticsStateInUrl(analyticsState);
        closeQuestionDrawer();
        if (analyticsData) {
          var hasDimension = !!(analyticsState.dimension_id);
          if (hasDimension) {
            var questionsArea = document.getElementById("benchmarking-questions-area");
            if (questionsArea) { questionsArea.style.display = "block"; questionsArea.classList.remove("hidden"); }
            renderBenchmarkingQuestionsTable(analyticsData);
          } else {
            renderBenchmarkingResultsPanel();
            renderBenchmarkingInsightsFromStore();
            renderBenchmarkingRecommendationsFromStore();
          }
        }
      });

      document.getElementById("drawer-overlay").addEventListener("click", function (e) {
        if (e.target === e.currentTarget) document.getElementById("drawer-close").click();
      });

      document.querySelectorAll(".drawer-view-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var view = btn.getAttribute("data-drawer-view");
          if (!view) return;
          analyticsActiveTab = view;
          setAnalyticsStateInUrl(analyticsState);
          document.querySelectorAll(".drawer-view-btn").forEach(function (b) { b.classList.toggle("active", (b.getAttribute("data-drawer-view") === view)); });
          document.querySelectorAll(".drawer-panel-content").forEach(function (p) {
            p.classList.toggle("active", p.id === "drawer-panel-" + view);
          });
        });
      });

      document.querySelectorAll(".benchmarking-view-btn").forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener("click", function () {
          analyticsActiveTab = btn.getAttribute("data-view") || "results";
          setAnalyticsStateInUrl(analyticsState);
          document.querySelectorAll(".benchmarking-view-btn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === analyticsActiveTab); });
          document.querySelectorAll(".benchmarking-panel").forEach(function (panel) {
            panel.classList.toggle("active", panel.id === "benchmarking-panel-" + analyticsActiveTab);
          });
          var scopeAll = document.getElementById("benchmarking-scope-all");
          var scopeLayer = document.getElementById("benchmarking-scope-layer");
          var scopeDimension = document.getElementById("benchmarking-scope-dimension");
          var mainContent = document.getElementById("benchmarking-main-content");
          var showResults = (analyticsActiveTab === "results");
          var hasL = !!(analyticsState.layer_id);
          var hasD = !!(analyticsState.dimension_id);
          var hasQ = !!(analyticsState.question_id);
          var whichScope = showResults ? (hasD || hasQ ? "benchmarking-scope-dimension" : hasL ? "benchmarking-scope-layer" : "benchmarking-scope-all") : (hasQ ? "benchmarking-scope-dimension" : "");
          [scopeAll, scopeLayer, scopeDimension].forEach(function (el) {
            if (!el) return;
            var show = (el.id === whichScope);
            el.style.display = show ? "" : "none";
            el.classList.toggle("hidden", !show);
          });
          if (mainContent) {
            mainContent.style.display = (showResults || hasQ) ? "none" : "";
            mainContent.classList.toggle("hidden", showResults || hasQ);
          }
          if (hasQ) {
            questionsPage = 1;
            renderBenchmarkingQuestionsTable(analyticsData);
            openQuestionDrawer(analyticsState.question_id);
          }
        });
      });
      var aiPanel = document.getElementById("ai-panel");
      var aiPanelToggle = document.getElementById("ai-panel-toggle");
      if (aiPanel && aiPanelToggle) {
        aiPanelToggle.addEventListener("click", function () {
          aiPanel.classList.toggle("collapsed");
          aiPanelToggle.textContent = aiPanel.classList.contains("collapsed") ? "+" : "−";
        });
      }

      async function loadDashboardResponses() {
        var el = document.getElementById("dashboard-responses");
        var slicersEl = document.getElementById("dashboard-slicers");
        var sidebarEl = document.getElementById("dashboard-sidebar");
        if (!el) return;
        el.innerHTML = "<p>Loadingâ€¦</p>";
        if (slicersEl) slicersEl.classList.add("hidden");
        if (sidebarEl) sidebarEl.classList.add("hidden");
        var filtersParam = Object.keys(dashboardDemographicFilters).length > 0
          ? "?filters=" + encodeURIComponent(JSON.stringify(dashboardDemographicFilters))
          : "";
        try {
          var res = await fetch(API_BASE + "/survey/analytics" + filtersParam, { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load analytics. Check that the backend is running at " + API_BASE + " and you are logged in as Admin.</p>"; return; }
          var data = await res.json();
          var totalResponses = data.totalResponses != null ? data.totalResponses : 0;
          var demographics = data.demographics || [];
          var dashBanner = document.getElementById("dashboard-insufficient-banner");
          if (data.insufficientSample) {
            if (dashBanner) { dashBanner.textContent = t("insufficientSample") + " (" + totalResponses + " response(s)). Results hidden to protect anonymity. Change filters or wait for more responses."; dashBanner.classList.remove("hidden"); }
          } else {
            if (dashBanner) dashBanner.classList.add("hidden");
          }
          var demographicsToShow = demographicFiltersToShow(demographics);
          if (slicersEl && demographicsToShow.length > 0) {
            var slicerHtml = "";
            demographicsToShow.forEach(function (d) {
              var currentVal = dashboardDemographicFilters[d.questionId];
              var optionValues = (d.allOptions && d.allOptions.length) ? d.allOptions : (d.options || []).map(function (o) { return o.value; });
              optionValues = optionValues.filter(function (v) { return v !== "Other (insufficient sample)"; });
              if (optionValues.length === 0) optionValues = (d.options || []).map(function (o) { return o.value; });
              var seen = {};
              slicerHtml += "<div class=\"dash-slicer-item\"><label for=\"slicer-" + escapeAttr(d.questionId) + "\">" + escapeHtml(trQuestionLabel(d.label, d.labelAr)) + "</label>";
              slicerHtml += "<select id=\"slicer-" + escapeAttr(d.questionId) + "\" class=\"dash-slicer-select\" data-question-id=\"" + escapeAttr(d.questionId) + "\">";
              slicerHtml += "<option value=\"\">All</option>";
              optionValues.forEach(function (val) {
                if (seen[val]) return;
                seen[val] = true;
                var isSelected = (currentVal === val);
                var displayVal = (val === "(blank)" ? "(blank)" : val);
                slicerHtml += "<option value=\"" + escapeAttr(val) + "\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption(displayVal)) + "</option>";
              });
              (d.options || []).forEach(function (opt) {
                if (opt.value === "(blank)" && !seen["(blank)"] && opt.count != null) {
                  seen["(blank)"] = true;
                  var isSelected = (currentVal === "(blank)");
                  slicerHtml += "<option value=\"(blank)\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption("(blank)")) + "</option>";
                }
              });
              slicerHtml += "</select></div>";
            });
            slicersEl.innerHTML = slicerHtml;
            slicersEl.classList.remove("hidden");
            var viewDashboard = document.getElementById("view-dashboard");
            if (viewDashboard) {
              var dashLayout = viewDashboard.querySelector(".dash-layout");
              if (dashLayout && slicersEl.parentNode && slicersEl.parentNode !== viewDashboard) {
                viewDashboard.insertBefore(slicersEl, dashLayout);
              }
            }
            slicersEl.querySelectorAll(".dash-slicer-select").forEach(function (sel) {
              sel.addEventListener("change", function () {
                var qId = sel.getAttribute("data-question-id");
                var v = sel.value;
                if (v) dashboardDemographicFilters[qId] = v; else delete dashboardDemographicFilters[qId];
                loadDashboardResponses();
              });
            });
          }

          if (sidebarEl && demographics.length > 0) {
            var sideHtml = "<h3>" + t("demographicBreakdown") + "</h3>";
            if (totalResponses === 0) {
              sideHtml += "<p class=\"dash-demographic-row\">" + (Object.keys(dashboardDemographicFilters).length ? t("noResponsesMatch") : t("noResponses")) + "</p>";
            } else {
              demographics.forEach(function (d) {
                sideHtml += "<div class=\"dash-demographic-block\"><div class=\"dash-demographic-label\">" + escapeHtml(trQuestionLabel(d.label, d.labelAr)) + "</div>";
                (d.options || []).forEach(function (opt) {
                  var isInsufficient = opt.count == null || opt.value === "Other (insufficient sample)";
                  var disp = isInsufficient ? t("insufficientSample") : (opt.value === "(blank)" ? "(blank)" : opt.value);
                  var pctStr = isInsufficient ? "â€”" : (totalResponses > 0 && opt.count != null ? Math.round((opt.count / totalResponses) * 1000) / 10 + "%" : "0%");
                  sideHtml += "<div class=\"dash-demographic-row\"><span>" + escapeHtml(disp) + "</span><span class=\"dash-demographic-pct\">" + pctStr + "</span></div>";
                });
                sideHtml += "</div>";
              });
            }
            sidebarEl.innerHTML = sideHtml;
            sidebarEl.classList.remove("hidden");
          }

          var html = "";
          if (Object.keys(dashboardDemographicFilters).length > 0) {
            var filterParts = [];
            demographics.forEach(function (d) {
              var val = dashboardDemographicFilters[d.questionId];
              if (val) filterParts.push(escapeHtml(trQuestionLabel(d.label, d.labelAr)) + " = " + escapeHtml(val === "(blank)" ? trOption("(blank)") : trOption(val)));
            });
            html += "<div class=\"dash-filters-summary\" id=\"dashboard-filters-summary\">" + t("showing") + ": " + filterParts.join("; ") + " <a href=\"#\" class=\"clear-filters\" id=\"dashboard-clear-filters\">" + t("clearAll") + "</a></div>";
          }
          var byDim = data.byDimension || [];
          var lowestDim = byDim.length ? byDim.reduce(function (a, b) { return a.averageScore <= b.averageScore ? a : b; }) : null;
          var highestDim = byDim.length ? byDim.reduce(function (a, b) { return a.averageScore >= b.averageScore ? a : b; }) : null;
          html += "<div class=\"dash-top-grid\">";
          html += "<div class=\"dash-card\"><div class=\"dash-card-label\">" + t("responseRate") + "</div><div class=\"dash-card-value\">75%</div></div>";
          if (lowestDim) html += "<div class=\"dash-card\"><div class=\"dash-card-label\">Lowest dimension</div><div class=\"dash-card-value score-low\">" + scoreFmt(lowestDim.averageScore) + "</div><div class=\"dash-card-sublabel\">" + escapeHtml(trDimensionName(lowestDim.dimensionName, lowestDim.dimensionNameAr)) + "</div></div>";
          else html += "<div class=\"dash-card\"></div>";
          if (highestDim) html += "<div class=\"dash-card\"><div class=\"dash-card-label\">Highest dimension</div><div class=\"dash-card-value score-high\">" + scoreFmt(highestDim.averageScore) + "</div><div class=\"dash-card-sublabel\">" + escapeHtml(trDimensionName(highestDim.dimensionName, highestDim.dimensionNameAr)) + "</div></div>";
          else html += "<div class=\"dash-card\"></div>";
          var act = data.responseActivity;
          if (act && (act.totalAllTime > 0 || (act.byWeek && act.byWeek.length > 0))) {
            html += "<div class=\"dash-activity-wrap\"><div class=\"dash-activity\"><h4>Response activity</h4>";
            html += "<div class=\"dash-activity-line\">Total responses (all time): <strong>" + (act.totalAllTime || 0) + "</strong></div>";
            if (act.lastResponseAt) {
              var lastDate = new Date(act.lastResponseAt);
              var daysAgo = Math.floor((Date.now() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
              var lastText = daysAgo === 0 ? "Today" : (daysAgo === 1 ? "Yesterday" : daysAgo + " days ago");
              html += "<div class=\"dash-activity-line\">Last response: " + lastText + "</div>";
            }
            if (act.byWeek && act.byWeek.length > 0) {
              var maxW = Math.max.apply(null, act.byWeek.map(function (w) { return w.count; }));
              act.byWeek.slice(-10).forEach(function (w) {
                var pct = maxW > 0 ? (w.count / maxW) * 100 : 0;
                html += "<div class=\"dash-activity-week\"><span class=\"week-label\">" + escapeHtml(w.week) + "</span><span class=\"week-bar\" style=\"width:" + (pct * 1.5) + "px\"></span> <span>" + w.count + "</span></div>";
              });
            }
            html += "</div></div>";
          } else {
            html += "<div class=\"dash-activity-wrap\"></div>";
          }
          html += "<div class=\"dash-osr-wrap\"><div class=\"dash-osr " + scoreClass(data.overallIndex) + "\"><div class=\"dash-osr-label\">Index</div><div class=\"dash-osr-value\">" + scoreFmt(data.overallIndex) + "</div></div></div>";
          html += "</div>";
          if (totalResponses >= 0) html += "<p style=\"margin-top:-8px;margin-bottom:16px;font-size:0.9rem;opacity:0.85;\">" + t("basedOnResponses", { count: totalResponses }) + "</p>";
          var layerRows = (data.byLayer || []).filter(function (row) {
            if (!DASHBOARD_LAYER_FILTER || DASHBOARD_LAYER_FILTER.length === 0) return true;
            var label = (row.layerLabel || "").trim();
            var title = (row.layerTitle || "").trim();
            return DASHBOARD_LAYER_FILTER.some(function (f) {
              var s = String(f).trim();
              return s && (s === label || s === title);
            });
          });
          html += "<div class=\"dash-section\"><div class=\"dash-section-header\"><h3>" + t("scoreByLayer") + "</h3><div class=\"dash-export\"><button type=\"button\" class=\"dash-export-btn\" id=\"dashboard-export-scores\" title=\"" + t("exportScores") + "\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg></button></div></div><table class=\"dash-table\"><thead><tr><th>" + t("layer") + "</th><th class=\"score-cell\">" + t("score") + "</th></tr></thead><tbody>";
          layerRows.forEach(function (row) {
            var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
            html += "<tr><td>" + escapeHtml(label) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td></tr>";
          });
          html += "</tbody></table></div>";
          var byDimension = data.byDimension || [];
          var layerOrder = layerRows.map(function (r) { return r.layerLabel ? r.layerLabel + " â€“ " + r.layerTitle : r.layerTitle; });
          var dimsByLayer = {};
          byDimension.forEach(function (row) {
            var layerKey = (row.layerLabel && row.sectionTitle) ? (row.layerLabel + " â€“ " + row.sectionTitle) : (row.layerLabel || row.sectionTitle || "Other");
            if (!dimsByLayer[layerKey]) dimsByLayer[layerKey] = [];
            dimsByLayer[layerKey].push(row);
          });
          html += "<div class=\"dash-section\"><h3>" + t("scoreByDimension") + "</h3><table class=\"dash-table\"><thead><tr><th>" + t("dimension") + "</th><th class=\"score-cell\">" + t("score") + "</th></tr></thead><tbody>";
          layerOrder.forEach(function (layerLabel) {
            var dims = dimsByLayer[layerLabel];
            if (!dims || dims.length === 0) return;
            html += "<tr class=\"dash-dim-layer-row\"><td colspan=\"2\">" + escapeHtml(layerLabel) + "</td></tr>";
            dims.forEach(function (row) {
              html += "<tr class=\"dash-dim-dim-row\"><td class=\"dash-dim-sub\">" + escapeHtml(trDimensionName(row.dimensionName, row.dimensionNameAr)) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td></tr>";
            });
          });
          Object.keys(dimsByLayer).forEach(function (layerKey) {
            if (layerOrder.indexOf(layerKey) >= 0) return;
            var dims = dimsByLayer[layerKey];
            html += "<tr class=\"dash-dim-layer-row\"><td colspan=\"2\">" + escapeHtml(layerKey) + "</td></tr>";
            dims.forEach(function (row) {
              html += "<tr class=\"dash-dim-dim-row\"><td class=\"dash-dim-sub\">" + escapeHtml(trDimensionName(row.dimensionName, row.dimensionNameAr)) + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td></tr>";
            });
          });
          html += "</tbody></table></div>";
          html += "<div class=\"dash-section\"><h3>" + t("scoreByQuestion") + "</h3><table class=\"dash-table\"><thead><tr><th>" + t("question") + "</th><th class=\"score-cell\">" + t("score") + "</th></tr></thead><tbody>";
          (data.byQuestion || []).forEach(function (row) {
            var label = escapeHtml(trQuestionLabel(row.label, row.labelAr));
            html += "<tr><td>" + label + "</td><td class=\"score-cell " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</td></tr>";
          });
          html += "</tbody></table></div>";
          el.innerHTML = html;

          var clearBtn = document.getElementById("dashboard-clear-filters");
          if (clearBtn) {
            clearBtn.addEventListener("click", function (e) { e.preventDefault(); dashboardDemographicFilters = {}; loadDashboardResponses(); });
          }
          var exportBtn = document.getElementById("dashboard-export-scores");
          if (exportBtn) {
            exportBtn.addEventListener("click", function () {
              var layerRows = (data.byLayer || []).filter(function (row) {
                if (!DASHBOARD_LAYER_FILTER || DASHBOARD_LAYER_FILTER.length === 0) return true;
                var label = (row.layerLabel || "").trim();
                var title = (row.layerTitle || "").trim();
                return DASHBOARD_LAYER_FILTER.some(function (f) { var s = String(f).trim(); return s && (s === label || s === title); });
              });
              var csv = "Layer,Score\n";
              layerRows.forEach(function (r) {
                var label = (r.layerLabel ? r.layerLabel + " â€“ " + r.layerTitle : r.layerTitle).replace(/"/g, '""');
                csv += '"' + label + '",' + scoreFmt(r.averageScore) + "\n";
              });
              csv += "\nDimension,Layer,Score\n";
              (data.byDimension || []).forEach(function (r) {
                var layerDisplay = (r.layerLabel && r.sectionTitle) ? (r.layerLabel + " â€“ " + r.sectionTitle) : (r.layerLabel || r.sectionTitle || "");
                csv += '"' + (r.dimensionName || "").replace(/"/g, '""') + '","' + String(layerDisplay).replace(/"/g, '""') + '",' + scoreFmt(r.averageScore) + "\n";
              });
              csv += "\nQuestion,Score\n";
              (data.byQuestion || []).forEach(function (r) {
                csv += '"' + (r.label || "").replace(/"/g, '""') + '",' + scoreFmt(r.averageScore) + "\n";
              });
              var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "survey-scores-" + (new Date().toISOString().slice(0, 10)) + ".csv";
              a.click();
              URL.revokeObjectURL(url);
            });
          }
        } catch (err) {
          el.innerHTML = "<p>Could not load analytics. Ensure the backend is running at " + API_BASE + " and try again.</p>";
        }
      }

      async function loadCorrelationsPage() {
        var el = document.getElementById("correlations-content");
        var slicersEl = document.getElementById("correlations-slicers");
        if (!el) return;
        el.innerHTML = "<p>Loadingâ€¦</p>";
        if (slicersEl) slicersEl.classList.add("hidden");
        var filtersParam = Object.keys(dashboardDemographicFilters).length > 0
          ? "?filters=" + encodeURIComponent(JSON.stringify(dashboardDemographicFilters))
          : "";
        try {
          var res = await fetch(API_BASE + "/survey/analytics" + filtersParam, { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load analytics. Check that the backend is running and you are logged in as Admin.</p>"; return; }
          var data = await res.json();
          var totalResponses = data.totalResponses != null ? data.totalResponses : 0;
          var demographics = data.demographics || [];
          var correlations = data.correlations || [];
          var byQuestion = data.byQuestion || [];
          var demographicsToShow = demographicFiltersToShow(demographics);
          if (slicersEl && demographicsToShow.length > 0) {
            var slicerHtml = "";
            demographicsToShow.forEach(function (d) {
              var currentVal = dashboardDemographicFilters[d.questionId];
              var optionValues = (d.allOptions && d.allOptions.length) ? d.allOptions : (d.options || []).map(function (o) { return o.value; });
              var seen = {};
              slicerHtml += "<div class=\"dash-slicer-item\"><label for=\"corr-slicer-" + escapeAttr(d.questionId) + "\">" + escapeHtml(d.label) + "</label>";
              slicerHtml += "<select id=\"corr-slicer-" + escapeAttr(d.questionId) + "\" class=\"dash-slicer-select\" data-question-id=\"" + escapeAttr(d.questionId) + "\">";
              slicerHtml += "<option value=\"\">All</option>";
              optionValues.forEach(function (val) {
                if (seen[val]) return;
                seen[val] = true;
                var isSelected = (currentVal === val);
                var displayVal = (val === "(blank)" ? "(blank)" : val);
                slicerHtml += "<option value=\"" + escapeAttr(val) + "\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption(displayVal)) + "</option>";
              });
              (d.options || []).forEach(function (opt) {
                if (opt.value === "(blank)" && !seen["(blank)"]) {
                  seen["(blank)"] = true;
                  var isSelected = (currentVal === "(blank)");
                  slicerHtml += "<option value=\"(blank)\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption("(blank)")) + "</option>";
                }
              });
              slicerHtml += "</select></div>";
            });
            slicersEl.innerHTML = slicerHtml;
            slicersEl.classList.remove("hidden");
            slicersEl.querySelectorAll(".dash-slicer-select").forEach(function (sel) {
              sel.addEventListener("change", function () {
                var qId = sel.getAttribute("data-question-id");
                var v = sel.value;
                if (v) dashboardDemographicFilters[qId] = v; else delete dashboardDemographicFilters[qId];
                loadCorrelationsPage();
              });
            });
          }

          if (correlations.length === 0 || byQuestion.length === 0) {
            el.innerHTML = "<p>No insight data. Ensure you have at least two scale questions and enough responses.</p>";
            return;
          }

          var firstQId = byQuestion[0].questionId;
          var html = "";
          if (Object.keys(dashboardDemographicFilters).length > 0) {
            var filterParts = [];
            demographics.forEach(function (d) {
              var val = dashboardDemographicFilters[d.questionId];
              if (val) filterParts.push(escapeHtml(trQuestionLabel(d.label, d.labelAr)) + " = " + escapeHtml(val === "(blank)" ? trOption("(blank)") : trOption(val)));
            });
            html += "<div class=\"dash-filters-summary\" id=\"corr-filters-summary\">" + t("showing") + ": " + filterParts.join("; ") + " <a href=\"#\" class=\"clear-filters\" id=\"corr-clear-filters\">" + t("clearAll") + "</a></div>";
          }
          var hasSmallN = correlations.some(function (p) { return (p.n != null) && p.n < 10; });
          if (hasSmallN) {
            html += "<p class=\"corr-small-n-warning\">Some correlations are based on fewer than 10 responses. Interpret these with caution, as they can be unstable.</p>";
          }
          html += "<p class=\"corr-interpretation\">Correlation ranges from -1 to 1. Positive values mean when one questionâ€™s score goes up, the other tends to go up; negative means one goes up when the other tends to go down. Values closer to 0 mean little linear relationship.</p>";
          html += "<p style=\"margin-bottom:14px;font-size:0.9rem;opacity:0.9;\">Based on <strong>" + totalResponses + "</strong> response(s) with current filters.</p>";
          html += "<div class=\"corr-corr-with-row\"><p style=\"margin:0 12px 12px 0;\"><label for=\"dash-corr-with\">Correlate with: </label><select id=\"dash-corr-with\" class=\"dash-slicer-select\" style=\"min-width:220px;\">";
          byQuestion.forEach(function (q) {
            html += "<option value=\"" + escapeAttr(q.questionId) + "\"" + (q.questionId === firstQId ? " selected" : "") + ">" + escapeHtml(trQuestionLabel(q.label, q.labelAr)) + "</option>";
          });
          html += "</select></p><div class=\"dash-export\"><button type=\"button\" class=\"dash-export-btn\" id=\"corr-export-csv\" title=\"Export insights (CSV)\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg></button></div></div>";
          html += "<div id=\"dash-corr-with-table-wrap\"></div>";
          html += "<h4 style=\"font-size:1rem;margin:16px 0 8px;\">Top correlated pairs (by strength)</h4>";
          var topPairs = correlations.slice().sort(function (x, y) { return Math.abs(y.correlation) - Math.abs(x.correlation); }).slice(0, 15);
          html += "<table class=\"dash-table dash-correlation-table\"><thead><tr><th>Question A</th><th>Question B</th><th class=\"corr-cell\">Correlation</th></tr></thead><tbody>";
          topPairs.forEach(function (p) {
            html += "<tr><td>" + escapeHtml(trQuestionLabel(p.labelA, p.labelArA)) + "</td><td>" + escapeHtml(trQuestionLabel(p.labelB, p.labelArB)) + "</td><td class=\"corr-cell " + corrClass(p.correlation) + "\">" + corrFmt(p.correlation) + "</td></tr>";
          });
          html += "</tbody></table>";
          el.innerHTML = html;

          var wrap = document.getElementById("dash-corr-with-table-wrap");
          var sel = document.getElementById("dash-corr-with");
          if (wrap && sel) {
            function renderCorrWith(overrideQId) {
              var qId = String(overrideQId !== undefined && overrideQId != null ? overrideQId : (sel.value || ""));
              if (!qId) return;
              var rows = [];
              correlations.forEach(function (p) {
                var a = String(p.questionIdA || "");
                var b = String(p.questionIdB || "");
                var otherId = a === qId ? p.questionIdB : (b === qId ? p.questionIdA : null);
                if (otherId) rows.push({ label: a === qId ? trQuestionLabel(p.labelB, p.labelArB) : trQuestionLabel(p.labelA, p.labelArA), correlation: p.correlation });
              });
              rows.sort(function (a, b) { return Math.abs(b.correlation) - Math.abs(a.correlation); });
              var tbl = "<table class=\"dash-table dash-correlation-table\"><thead><tr><th>Question</th><th class=\"corr-cell\">Correlation</th></tr></thead><tbody>";
              rows.forEach(function (r) {
                tbl += "<tr><td>" + escapeHtml(r.label) + "</td><td class=\"corr-cell " + corrClass(r.correlation) + "\">" + corrFmt(r.correlation) + "</td></tr>";
              });
              tbl += "</tbody></table>";
              wrap.innerHTML = tbl;
            }
            renderCorrWith(firstQId);
            sel.addEventListener("change", function () { renderCorrWith(); });
          }

          var corrClearBtn = document.getElementById("corr-clear-filters");
          if (corrClearBtn) {
            corrClearBtn.addEventListener("click", function (e) { e.preventDefault(); dashboardDemographicFilters = {}; loadCorrelationsPage(); });
          }
          var corrExportBtn = document.getElementById("corr-export-csv");
          if (corrExportBtn) {
            corrExportBtn.addEventListener("click", function () {
              var csv = "Question A,Question B,Correlation\n";
              correlations.forEach(function (p) {
                csv += '"' + (p.labelA || "").replace(/"/g, '""') + '","' + (p.labelB || "").replace(/"/g, '""') + '",' + p.correlation + "\n";
              });
              var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "insights-" + (new Date().toISOString().slice(0, 10)) + ".csv";
              a.click();
              URL.revokeObjectURL(url);
            });
          }
        } catch (err) {
          el.innerHTML = "<p>Could not load insights. Ensure the backend is running at " + API_BASE + " and try again.</p>";
        }
      }

      async function loadRecommendationsPage() {
        var el = document.getElementById("recommendations-content");
        var slicersEl = document.getElementById("recommendations-slicers");
        if (!el) return;
        el.innerHTML = "<p>Loadingâ€¦</p>";
        if (slicersEl) slicersEl.classList.add("hidden");
        var filtersParam = Object.keys(dashboardDemographicFilters).length > 0
          ? "?filters=" + encodeURIComponent(JSON.stringify(dashboardDemographicFilters))
          : "";
        try {
          var res = await fetch(API_BASE + "/survey/analytics" + filtersParam, { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load analytics. Check that the backend is running and you are logged in as Admin.</p>"; return; }
          var data = await res.json();
          var totalResponses = data.totalResponses != null ? data.totalResponses : 0;
          var demographics = data.demographics || [];
          var byLayer = data.byLayer || [];
          var byDimension = data.byDimension || [];
          var byQuestion = data.byQuestion || [];
          var overall = data.overallIndex != null ? Number(data.overallIndex) : 0;
          var demographicsToShow = demographicFiltersToShow(demographics);
          if (slicersEl && demographicsToShow.length > 0) {
            var slicerHtml = "";
            demographicsToShow.forEach(function (d) {
              var currentVal = dashboardDemographicFilters[d.questionId];
              var optionValues = (d.allOptions && d.allOptions.length) ? d.allOptions : (d.options || []).map(function (o) { return o.value; });
              var seen = {};
              slicerHtml += "<div class=\"dash-slicer-item\"><label for=\"rec-slicer-" + escapeAttr(d.questionId) + "\">" + escapeHtml(d.label) + "</label>";
              slicerHtml += "<select id=\"rec-slicer-" + escapeAttr(d.questionId) + "\" class=\"dash-slicer-select\" data-question-id=\"" + escapeAttr(d.questionId) + "\">";
              slicerHtml += "<option value=\"\">All</option>";
              optionValues.forEach(function (val) {
                if (seen[val]) return;
                seen[val] = true;
                var isSelected = (currentVal === val);
                var displayVal = (val === "(blank)" ? "(blank)" : val);
                slicerHtml += "<option value=\"" + escapeAttr(val) + "\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption(displayVal)) + "</option>";
              });
              (d.options || []).forEach(function (opt) {
                if (opt.value === "(blank)" && !seen["(blank)"]) {
                  seen["(blank)"] = true;
                  var isSelected = (currentVal === "(blank)");
                  slicerHtml += "<option value=\"(blank)\"" + (isSelected ? " selected" : "") + ">" + escapeHtml(trOption("(blank)")) + "</option>";
                }
              });
              slicerHtml += "</select></div>";
            });
            slicersEl.innerHTML = slicerHtml;
            slicersEl.classList.remove("hidden");
            slicersEl.querySelectorAll(".dash-slicer-select").forEach(function (sel) {
              sel.addEventListener("change", function () {
                var qId = sel.getAttribute("data-question-id");
                var v = sel.value;
                if (v) dashboardDemographicFilters[qId] = v; else delete dashboardDemographicFilters[qId];
                loadRecommendationsPage();
              });
            });
          }

          function insightForScore(score) {
            if (score < 25) return "Priority focus: act now. Target quick wins and leadership visibility to build momentum.";
            if (score < 50) return "Room to grow: invest in clarity, skills, and processâ€”small steps will add up.";
            if (score < 75) return "Solid foundation: double down on what works and spread good practices across teams.";
            return "Strong spot: keep it up and document whatâ€™s working so others can learn.";
          }

          var html = "";
          if (Object.keys(dashboardDemographicFilters).length > 0) {
            var filterParts = [];
            demographics.forEach(function (d) {
              var val = dashboardDemographicFilters[d.questionId];
              if (val) filterParts.push(escapeHtml(trQuestionLabel(d.label, d.labelAr)) + " = " + escapeHtml(val === "(blank)" ? trOption("(blank)") : trOption(val)));
            });
            html += "<div class=\"dash-filters-summary\" id=\"rec-filters-summary\">" + t("showing") + ": " + filterParts.join("; ") + " <a href=\"#\" class=\"clear-filters\" id=\"rec-clear-filters\">" + t("clearAll") + "</a></div>";
          }
          html += "<p style=\"margin-bottom:20px;font-size:0.9rem;opacity:0.85;\">Based on <strong>" + totalResponses + "</strong> response(s). Scores are 0â€“100.</p>";

          if (totalResponses === 0) {
            html += "<div class=\"rec-empty-state\">" + t("noResponsesYet") + "</div>";
          } else {
            html += "<div class=\"rec-hero\"><h3>Your OSR at a glance</h3>";
            html += "<div class=\"rec-hero-score " + scoreClass(overall) + "\">" + scoreFmt(overall) + "</div>";
            html += "<p class=\"rec-hero-copy\">" + insightForScore(overall) + "</p></div>";

            var lowLayers = byLayer.filter(function (r) { return r.averageScore < 60 && (r.layerTitle || "").toLowerCase() !== "demographic"; });
            if (lowLayers.length > 0) {
              html += "<div class=\"rec-card\"><h3><span class=\"rec-card-emoji\">ðŸŽ¯</span> Focus by layer</h3>";
              html += "<p class=\"rec-card-lead\">These layers could use extra attention:</p><ul class=\"rec-list\">";
              lowLayers.forEach(function (row) {
                var label = row.layerLabel ? row.layerLabel + " â€“ " + row.layerTitle : row.layerTitle;
                html += "<li><span class=\"rec-badge " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</span><strong>" + escapeHtml(label) + "</strong> â€” " + insightForScore(row.averageScore) + "</li>";
              });
              html += "</ul></div>";
            }

            var lowDims = byDimension.filter(function (r) { return r.averageScore < 60; });
            if (lowDims.length > 0) {
              html += "<div class=\"rec-card\"><h3><span class=\"rec-card-emoji\">ðŸ“</span> Focus by dimension</h3>";
              html += "<p class=\"rec-card-lead\">Where to act next:</p><ul class=\"rec-list\">";
              lowDims.forEach(function (row) {
                html += "<li><span class=\"rec-badge " + scoreClass(row.averageScore) + "\">" + scoreFmt(row.averageScore) + "</span><strong>" + escapeHtml(trDimensionName(row.dimensionName, row.dimensionNameAr)) + "</strong> â€” " + insightForScore(row.averageScore) + "</li>";
              });
              html += "</ul></div>";
            }

            var scaleQuestions = byQuestion.filter(function (q) { return q.responseCount > 0; });
            var lowestQuestions = scaleQuestions.slice().sort(function (a, b) { return a.averageScore - b.averageScore; }).slice(0, 5);
            if (lowestQuestions.length > 0) {
              html += "<div class=\"rec-card\"><h3><span class=\"rec-card-emoji\">ðŸ’¡</span> Quick wins</h3>";
              html += "<p class=\"rec-card-lead\">Lowest-scoring items tackle these for fast impact:</p><ul class=\"rec-list\">";
              lowestQuestions.forEach(function (q) {
                html += "<li><span class=\"rec-badge " + scoreClass(q.averageScore) + "\">" + scoreFmt(q.averageScore) + "</span><strong>" + escapeHtml(trQuestionLabel(q.label, q.labelAr)) + "</strong> â€” " + insightForScore(q.averageScore) + "</li>";
              });
              html += "</ul></div>";
            }
          }

          el.innerHTML = html;

          var clearBtn = document.getElementById("rec-clear-filters");
          if (clearBtn) {
            clearBtn.addEventListener("click", function (e) { e.preventDefault(); dashboardDemographicFilters = {}; loadRecommendationsPage(); });
          }
        } catch (err) {
          el.innerHTML = "<p>Could not load recommendations. Ensure the backend is running at " + API_BASE + " and try again.</p>";
        }
      }

      var chartOverTimeInstance = null;
      var chartByGroupInstance = null;
      var chartByLayerInstance = null;
      var chartJointInstance = null;
      var chartsDemographics = [];

      async function loadChartsPage() {
        var errEl = document.getElementById("charts-error");
        var selectEl = document.getElementById("charts-demographic-select");
        if (errEl) { errEl.classList.add("hidden"); errEl.textContent = ""; }
        if (selectEl) selectEl.innerHTML = "<option value=\"\">â€” Select demographic â€”</option>";
        if (typeof Chart === "undefined") {
          if (errEl) { errEl.textContent = "Chart.js failed to load."; errEl.classList.remove("hidden"); }
          return;
        }
        try {
          var analyticsRes = await fetch(API_BASE + "/survey/analytics", { credentials: "include" });
          var periodRes = await fetch(API_BASE + "/survey/analytics/by-period", { credentials: "include" });
          if (!analyticsRes.ok || !periodRes.ok) {
            if (errEl) { errEl.textContent = "Unable to load chart data. Ensure backend is running and you are logged in as Admin."; errEl.classList.remove("hidden"); }
            return;
          }
          var analytics = await analyticsRes.json();
          var periodData = await periodRes.json();
          chartsDemographics = analytics.demographics || [];
          if (selectEl && chartsDemographics.length > 0) {
            chartsDemographics.forEach(function (d) {
              var opt = document.createElement("option");
              opt.value = d.questionId;
              opt.textContent = d.label || d.questionId;
              selectEl.appendChild(opt);
            });
            selectEl.addEventListener("change", function () {
              var qId = selectEl.value;
              if (qId) loadChartsByDemographic(qId); else clearGroupCharts();
            });
          }
          var jointA = document.getElementById("charts-joint-a");
          var jointB = document.getElementById("charts-joint-b");
          if (jointA && jointB) {
            jointA.innerHTML = "<option value=\"\">â€” Select â€”</option>";
            jointB.innerHTML = "<option value=\"\">â€” Select â€”</option>";
            clearChartsJoint();
          }
          if (jointA && jointB && chartsDemographics.length > 0) {
            chartsDemographics.forEach(function (d) {
              var optA = document.createElement("option");
              optA.value = d.questionId;
              optA.textContent = d.label || d.questionId;
              jointA.appendChild(optA);
              var optB = document.createElement("option");
              optB.value = d.questionId;
              optB.textContent = d.label || d.questionId;
              jointB.appendChild(optB);
            });
            function onJointChange() {
              var a = jointA.value;
              var b = jointB.value;
              if (a && b && a !== b) loadChartsJoint(a, b); else clearChartsJoint();
            }
            jointA.addEventListener("change", onJointChange);
            jointB.addEventListener("change", onJointChange);
          }

          var byPeriod = periodData.byPeriod || [];
          var ctxOverTime = document.getElementById("chart-over-time");
          if (ctxOverTime) {
            if (chartOverTimeInstance) { chartOverTimeInstance.destroy(); chartOverTimeInstance = null; }
            if (byPeriod.length > 0) {
              chartOverTimeInstance = new Chart(ctxOverTime, {
                type: "bar",
                data: {
                  labels: byPeriod.map(function (p) { return p.period; }),
                  datasets: [{
                    label: "Overall index",
                    data: byPeriod.map(function (p) { return p.overallIndex; }),
                    backgroundColor: "rgba(29, 78, 216, 0.7)",
                    borderColor: "rgba(29, 78, 216, 1)",
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { min: 0, max: 100, title: { display: true, text: "Score (0â€“100)" } },
                    x: { title: { display: true, text: "Period (month)" } }
                  }
                }
              });
            }
          }
          if (selectEl && selectEl.value) loadChartsByDemographic(selectEl.value);
        } catch (err) {
          if (errEl) { errEl.textContent = "Could not load charts. " + (err.message || ""); errEl.classList.remove("hidden"); }
        }
      }

      function clearGroupCharts() {
        if (chartByGroupInstance) { chartByGroupInstance.destroy(); chartByGroupInstance = null; }
        if (chartByLayerInstance) { chartByLayerInstance.destroy(); chartByLayerInstance = null; }
        var ctxGroup = document.getElementById("chart-by-group");
        var ctxLayer = document.getElementById("chart-by-layer");
        if (ctxGroup && typeof Chart !== "undefined") {
          chartByGroupInstance = new Chart(ctxGroup, { type: "bar", data: { labels: [], datasets: [] }, options: { responsive: true, maintainAspectRatio: false } });
        }
        if (ctxLayer && typeof Chart !== "undefined") {
          chartByLayerInstance = new Chart(ctxLayer, { type: "bar", data: { labels: [], datasets: [] }, options: { responsive: true, maintainAspectRatio: false } });
        }
      }

      async function loadChartsByDemographic(questionId) {
        var errEl = document.getElementById("charts-error");
        if (errEl) errEl.classList.add("hidden");
        try {
          var res = await fetch(API_BASE + "/survey/analytics/by-demographic?questionId=" + encodeURIComponent(questionId), { credentials: "include" });
          if (!res.ok) { if (errEl) { errEl.textContent = "Failed to load comparison data."; errEl.classList.remove("hidden"); } return; }
          var data = await res.json();
          var groups = data.groups || [];
          if (groups.length === 0) { clearGroupCharts(); return; }

          var ctxGroup = document.getElementById("chart-by-group");
          if (ctxGroup && typeof Chart !== "undefined") {
            if (chartByGroupInstance) { chartByGroupInstance.destroy(); chartByGroupInstance = null; }
            chartByGroupInstance = new Chart(ctxGroup, {
              type: "bar",
              data: {
                labels: groups.map(function (g) { return g.label; }),
                datasets: [{
                  label: "Overall index",
                  data: groups.map(function (g) { return g.overallIndex; }),
                  backgroundColor: "rgba(29, 78, 216, 0.7)",
                  borderColor: "rgba(29, 78, 216, 1)",
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, title: { display: true, text: "Score (0â€“100)" } }
                }
              }
            });
          }

          var ctxLayer = document.getElementById("chart-by-layer");
          if (ctxLayer && typeof Chart !== "undefined" && groups.length > 0) {
            var layerTitles = [];
            groups[0].byLayer.forEach(function (l) { layerTitles.push(l.layerTitle || l.layerLabel || ""); });
            var colors = ["rgba(29, 78, 216, 0.75)", "rgba(59, 130, 246, 0.75)", "rgba(100, 116, 139, 0.75)", "rgba(51, 65, 85, 0.75)", "rgba(71, 85, 105, 0.75)"];
            var datasets = layerTitles.map(function (layerTitle, idx) {
              return {
                label: layerTitle,
                data: groups.map(function (g) {
                  var layer = (g.byLayer || []).find(function (l) { return (l.layerTitle || l.layerLabel) === layerTitle; });
                  return layer ? layer.averageScore : 0;
                }),
                backgroundColor: colors[idx % colors.length],
                borderWidth: 1
              };
            });
            if (chartByLayerInstance) { chartByLayerInstance.destroy(); chartByLayerInstance = null; }
            chartByLayerInstance = new Chart(ctxLayer, {
              type: "bar",
              data: { labels: groups.map(function (g) { return g.label; }), datasets: datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" } },
                scales: {
                  y: { min: 0, max: 100, stacked: false, title: { display: true, text: "Score (0â€“100)" } },
                  x: { stacked: false }
                }
              }
            });
          }
        } catch (err) {
          if (errEl) { errEl.textContent = "Could not load comparison. " + (err.message || ""); errEl.classList.remove("hidden"); }
        }
      }

      function clearChartsJoint() {
        var wrap = document.getElementById("charts-joint-table-wrap");
        if (wrap) wrap.innerHTML = "";
        if (chartJointInstance) { chartJointInstance.destroy(); chartJointInstance = null; }
      }

      async function loadChartsJoint(questionIdA, questionIdB) {
        var errEl = document.getElementById("charts-error");
        var wrap = document.getElementById("charts-joint-table-wrap");
        if (errEl) errEl.classList.add("hidden");
        if (!wrap) return;
        wrap.innerHTML = "<p>Loadingâ€¦</p>";
        try {
          var res = await fetch(API_BASE + "/survey/analytics/joint?questionIdA=" + encodeURIComponent(questionIdA) + "&questionIdB=" + encodeURIComponent(questionIdB), { credentials: "include" });
          if (!res.ok) { wrap.innerHTML = ""; if (errEl) { errEl.textContent = "Failed to load joint analysis."; errEl.classList.remove("hidden"); } return; }
          var data = await res.json();
          var rowLabels = data.rowLabels || [];
          var colLabels = data.colLabels || [];
          var cells = data.cells || [];
          var cellByKey = {};
          cells.forEach(function (c) { cellByKey[c.valueA + "\t" + c.valueB] = c; });

          var labelA = (data.questionLabelA || "Rows").replace(/"/g, "&quot;");
          var labelB = (data.questionLabelB || "Columns").replace(/"/g, "&quot;");
          var scoreLabel = (typeof t === "function" && t("score")) ? t("score") : "Score";
          var countLabel = (typeof t === "function" && t("chartsJointCount")) ? t("chartsJointCount") : "N";

          var table = "<table class=\"charts-joint-table\"><thead><tr><th class=\"charts-joint-row-label\">" + labelA + " \\ " + labelB + "</th>";
          colLabels.forEach(function (col) {
            var displayCol = col === "(blank)" ? "(No answer)" : col;
            table += "<th>" + (typeof escapeHtml === "function" ? escapeHtml(displayCol) : displayCol.replace(/</g, "&lt;").replace(/>/g, "&gt;")) + "</th>";
          });
          table += "</tr></thead><tbody>";
          rowLabels.forEach(function (row) {
            var displayRow = row === "(blank)" ? "(No answer)" : row;
            table += "<tr><td class=\"charts-joint-row-label\">" + (typeof escapeHtml === "function" ? escapeHtml(displayRow) : displayRow.replace(/</g, "&lt;").replace(/>/g, "&gt;")) + "</td>";
            colLabels.forEach(function (col) {
              var c = cellByKey[row + "\t" + col];
              if (c) {
                table += "<td><span class=\"charts-joint-cell-score\">" + (c.overallIndex != null ? c.overallIndex : "â€”") + "</span><br><span class=\"charts-joint-cell-count\">" + countLabel + " " + (c.count || 0) + "</span></td>";
              } else {
                table += "<td><span class=\"charts-joint-cell-score\">â€”</span><br><span class=\"charts-joint-cell-count\">0</span></td>";
              }
            });
            table += "</tr>";
          });
          table += "</tbody></table>";
          wrap.innerHTML = table;

          var ctx = document.getElementById("chart-joint");
          if (ctx && typeof Chart !== "undefined" && rowLabels.length > 0 && colLabels.length > 0) {
            if (chartJointInstance) { chartJointInstance.destroy(); chartJointInstance = null; }
            var colors = ["rgba(29, 78, 216, 0.75)", "rgba(59, 130, 246, 0.75)", "rgba(100, 116, 139, 0.75)", "rgba(51, 65, 85, 0.75)", "rgba(71, 85, 105, 0.75)"];
            var datasets = colLabels.map(function (col, idx) {
              return {
                label: col === "(blank)" ? "(No answer)" : col,
                data: rowLabels.map(function (row) {
                  var c = cellByKey[row + "\t" + col];
                  return c && c.count > 0 ? c.overallIndex : null;
                }),
                backgroundColor: colors[idx % colors.length],
                borderWidth: 1
              };
            });
            chartJointInstance = new Chart(ctx, {
              type: "bar",
              data: {
                labels: rowLabels.map(function (r) { return r === "(blank)" ? "(No answer)" : r; }),
                datasets: datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" } },
                scales: {
                  y: { min: 0, max: 100, title: { display: true, text: scoreLabel + " (0â€“100)" } },
                  x: { stacked: false }
                }
              }
            });
          }
        } catch (err) {
          wrap.innerHTML = "";
          if (errEl) { errEl.textContent = "Could not load joint analysis. " + (err.message || ""); errEl.classList.remove("hidden"); }
        }
      }

      async function loadUsersList() {
        var el = document.getElementById("users-list");
        if (!el) return;
        el.innerHTML = "<p>Loadingâ€¦</p>";
        try {
          var res = await fetch(API_BASE + "/users", { credentials: "include" });
          if (!res.ok) { el.innerHTML = "<p>Unable to load users.</p>"; return; }
          var users = await res.json();
          var html = "<table class=\"users-table\"><thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>";
          users.forEach(function (u) {
            var roleOpts = "<option value=\"VIEWER\"" + (u.role === "VIEWER" ? " selected" : "") + ">Viewer</option>" +
              "<option value=\"ANALYST\"" + (u.role === "ANALYST" ? " selected" : "") + ">Editor</option>" +
              "<option value=\"ADMIN\"" + (u.role === "ADMIN" ? " selected" : "") + ">Admin</option>";
            var statusOpts = "<option value=\"true\"" + (u.isActive ? " selected" : "") + ">Active</option>" +
              "<option value=\"false\"" + (!u.isActive ? " selected" : "") + ">Inactive</option>";
            html += "<tr data-user-id=\"" + escapeAttr(u.id) + "\"><td>" + escapeHtml(u.email) + "</td>" +
              "<td><select class=\"user-role-select\">" + roleOpts + "</select></td>" +
              "<td><select class=\"user-status-select\">" + statusOpts + "</select></td></tr>";
          });
          html += "</tbody></table>";
          el.innerHTML = users.length === 0 ? "<p>No users yet.</p>" : html;
        } catch (err) {
          el.innerHTML = "<p>Could not load users.</p>";
        }
      }

      function setupUsersListListeners() {
        var wrap = document.getElementById("users-list-wrap");
        if (!wrap) return;
        wrap.addEventListener("change", async function (e) {
          var target = e.target;
          var row = target.closest("tr[data-user-id]");
          if (!row) return;
          var userId = row.getAttribute("data-user-id");
          if (!userId) return;
          var payload = {};
          if (target.classList.contains("user-role-select")) {
            payload.role = target.value;
          } else if (target.classList.contains("user-status-select")) {
            payload.isActive = target.value === "true";
          } else return;
          try {
            var res = await fetch(API_BASE + "/users/" + encodeURIComponent(userId), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              var data = await res.json().catch(function () { return {}; });
              alert(data.message || "Failed to update user");
            }
          } catch (err) {
            alert("Network error");
          }
        });
      }

      async function fetchMe() {
        try {
          const res = await fetch(API_BASE + "/auth/me", { credentials: "include" });
          if (res.ok) {
            currentUser = await res.json();
            return currentUser;
          }
        } catch (_) {}
        currentUser = null;
        return null;
      }

      function renderRoute() {
        const p = path();

        if (currentUser) {
          document.querySelectorAll(".navbar .nav-link").forEach(function (a) { a.classList.remove("active"); });
          document.querySelectorAll(".navbar .nav-link[href=\"" + p + "\"]").forEach(function (a) { a.classList.add("active"); });
        }
        if (currentUser) {
          if (p === "/dashboard" || p === "/insights" || p === "/recommendations") {
            var qs = (window.location.search || "") || (window.location.hash && window.location.hash.indexOf("?") >= 0 ? window.location.hash.slice(window.location.hash.indexOf("?")) : "");
            setPath("/dashboard/benchmarking" + (qs || "?view=results"));
            return;
          }
          if (p === "/dashboard/benchmarking") {
            navbar.classList.remove("hidden");
            if (navAnalytics) navAnalytics.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navCharts) navCharts.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navUsers) navUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (userMenuUsers) userMenuUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (currentUser.role !== "ADMIN") {
              showView("403");
              return;
            }
            showView("analytics");
            if (typeof loadUnifiedAnalytics === "function") loadUnifiedAnalytics();
            return;
          }
          if (p === "/charts") {
            navbar.classList.remove("hidden");
            if (navAnalytics) navAnalytics.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navCharts) navCharts.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navUsers) navUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (userMenuUsers) userMenuUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (currentUser.role !== "ADMIN") {
              showView("403");
              return;
            }
            showView("charts");
            if (typeof loadChartsPage === "function") loadChartsPage();
            return;
          }
          if (p === "/users") {
            navbar.classList.remove("hidden");
            if (navAnalytics) navAnalytics.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navCharts) navCharts.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navUsers) navUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (userMenuUsers) userMenuUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (currentUser.role !== "ADMIN") {
              showView("403");
              return;
            }
            showView("users");
            loadUsersList();
            return;
          }
          if (p === "/survey") {
            navbar.classList.remove("hidden");
            if (navAnalytics) navAnalytics.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navCharts) navCharts.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (navUsers) navUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            if (userMenuUsers) userMenuUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
            showView("survey");
            renderSurveyEmbed();
            return;
          }
          if (p === "/login") {
            navbar.classList.add("hidden");
            showView("login");
            return;
          }
          if (p === "/" || p === "") {
            if (window.location.protocol === "file:") {
              var defaultPath = currentUser.role === "ADMIN" ? "/dashboard/benchmarking?view=results" : "/survey";
              setPath(defaultPath);
              if (currentUser.role === "ADMIN") { showView("analytics"); if (typeof loadUnifiedAnalytics === "function") loadUnifiedAnalytics(); }
              else { showView("survey"); renderSurveyEmbed(); }
              navbar.classList.remove("hidden");
              if (navAnalytics) navAnalytics.style.display = currentUser.role === "ADMIN" ? "" : "none";
              if (navCharts) navCharts.style.display = currentUser.role === "ADMIN" ? "" : "none";
              if (navUsers) navUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
              if (userMenuUsers) userMenuUsers.style.display = currentUser.role === "ADMIN" ? "" : "none";
              return;
            }
            var defaultPath = (currentUser && currentUser.role === "ADMIN") ? "/dashboard/benchmarking?view=results" : "/survey";
            window.location.href = defaultPath;
            return;
          }
          window.location.href = "/";
          return;
        }

        if (p === "/invite") {
          navbar.classList.add("hidden");
          showView("invite");
          return;
        }

        navbar.classList.add("hidden");
        if (p === "/login" || p === "/" || window.location.protocol === "file:") {
          showView("login");
          return;
        }
        window.location.href = "/login";
      }

      async function init() {
        setupUsersListListeners();
        currentUser = await fetchMe();
        renderRoute();
      }

      var showPwdCheckbox = document.getElementById("show-password");
      if (showPwdCheckbox && passwordInput) {
        showPwdCheckbox.addEventListener("change", function () {
          passwordInput.type = showPwdCheckbox.checked ? "text" : "password";
        });
      }
      var forgotPwdLink = document.getElementById("forgot-pwd-link");
      if (forgotPwdLink) {
        forgotPwdLink.addEventListener("click", function (e) {
          e.preventDefault();
          setStatus("Contact your administrator to reset your password.", "");
        });
      }
      toggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (mode === "login") {
          mode = "signup";
          loginTitle.textContent = t("titleSignUp");
          submitBtn.textContent = t("btnCreateAccount");
          toggleText.textContent = t("toggleHaveAccount");
          toggleLink.textContent = t("linkLogIn");
        } else {
          mode = "login";
          loginTitle.textContent = t("titleLogin");
          submitBtn.textContent = t("btnSignIn");
          toggleText.textContent = t("toggleNotUser");
          toggleLink.textContent = t("linkSignUp");
        }
        setStatus("", "");
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        submitBtn.disabled = true;
        setStatus(mode === "login" ? "Signing in..." : "Creating account...");

        try {
          const res = await fetch(
            API_BASE + (mode === "login" ? "/auth/login" : "/auth/signup"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, password }),
            }
          );
          const data = await res.json();

          if (!res.ok) {
            setStatus(data.message || "Request failed", "error");
          } else {
            setStatus("Success! Taking you in…", "success");
            currentUser = data;
            var redirectTo = "/dashboard/benchmarking?view=results";
            setPath(redirectTo);
            setTimeout(function () { renderRoute(); }, 400);
          }
        } catch (err) {
          setStatus("Network error", "error");
        } finally {
          submitBtn.disabled = false;
        }
      });

      navLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await fetch(API_BASE + "/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (_) {}
        currentUser = null;
        window.location.href = "/login";
      });

      var formInvite = document.getElementById("form-invite");
      var inviteLinkWrap = document.getElementById("invite-link-wrap");
      var inviteLinkInput = document.getElementById("invite-link");
      var inviteEmailStatus = document.getElementById("invite-email-status");
      if (formInvite) {
        formInvite.addEventListener("submit", async function (e) {
          e.preventDefault();
          var email = document.getElementById("invite-email").value.trim();
          var role = document.getElementById("invite-role").value;
          var sendEmail = document.getElementById("invite-send-email") && document.getElementById("invite-send-email").checked;
          var btn = formInvite.querySelector('button[type="submit"]');
          if (btn) btn.disabled = true;
          if (inviteLinkWrap) inviteLinkWrap.classList.add("hidden");
          if (inviteEmailStatus) { inviteEmailStatus.classList.add("hidden"); inviteEmailStatus.textContent = ""; }
          try {
            var res = await fetch(API_BASE + "/users/invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, role, sendEmail }),
            });
            var data = await res.json();
            if (!res.ok) { alert(data.message || "Failed to send invite"); }
            else {
              var base = window.location.origin || "";
              var link = (data.inviteLink && data.inviteLink.length > 0) ? data.inviteLink : (base + "/invite?token=" + (data.token || ""));
              if (inviteLinkInput) { inviteLinkInput.value = link; inviteLinkInput.select(); }
              if (inviteLinkWrap) inviteLinkWrap.classList.remove("hidden");
              if (sendEmail && inviteEmailStatus) {
                inviteEmailStatus.classList.remove("hidden");
                if (data.emailSent) { inviteEmailStatus.textContent = "Invite link was sent to " + email; inviteEmailStatus.className = "status success"; }
                else { inviteEmailStatus.textContent = data.emailError || "Email could not be sent. Copy the link above to share."; inviteEmailStatus.className = "status error"; }
              }
              loadUsersList();
            }
          } catch (err) { alert("Network error"); }
          if (btn) btn.disabled = false;
        });
      }

      var formAcceptInvite = document.getElementById("form-accept-invite");
      if (formAcceptInvite) {
        formAcceptInvite.addEventListener("submit", async function (e) {
          e.preventDefault();
          var params = new URLSearchParams(window.location.search);
          var token = params.get("token");
          var pwd = document.getElementById("invite-password").value;
          var pwd2 = document.getElementById("invite-password-confirm").value;
          var statusEl = document.getElementById("invite-status");
          var btn = document.getElementById("invite-submit-btn");
          if (!token) { if (statusEl) statusEl.textContent = "Missing invite token."; statusEl.className = "status error"; return; }
          if (pwd !== pwd2) { if (statusEl) statusEl.textContent = "Passwords do not match."; statusEl.className = "status error"; return; }
          if (btn) btn.disabled = true;
          if (statusEl) statusEl.textContent = "Activatingâ€¦";
          try {
            var res = await fetch(API_BASE + "/auth/accept-invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token, password: pwd }),
            });
            var data = await res.json();
            if (!res.ok) { if (statusEl) statusEl.textContent = data.message || "Invalid or expired link."; statusEl.className = "status error"; }
            else { if (statusEl) statusEl.textContent = "Account activated. Redirectingâ€¦"; statusEl.className = "status success"; setTimeout(function () { window.location.href = "/survey"; }, 800); }
          } catch (err) { if (statusEl) statusEl.textContent = "Network error."; statusEl.className = "status error"; }
          if (btn) btn.disabled = false;
        });
      }

      document.querySelectorAll(".navbar a[href^='/']").forEach(function (a) {
        if (a.closest(".user-menu-dropdown")) return;
        var href = a.getAttribute("href");
        if (href && href !== "#" && href !== "/login") {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            setPath(href);
            renderRoute();
          });
        }
      });
      window.addEventListener("popstate", renderRoute);
      window.addEventListener("hashchange", renderRoute);
      function runInit() {
        try {
          init();
        } catch (err) {
          console.error("Init error:", err);
          var main = document.querySelector(".main");
          if (main) main.innerHTML = "<p style='padding:20px;color:#b91c1c;'>Something went wrong. Try refreshing the page. If it keeps failing, clear your browser cache.</p>";
        }
      }
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(function () { runInit(); }, { timeout: 2000 });
      } else {
        setTimeout(runInit, 0);
      }
