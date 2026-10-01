import { defineConfig } from "allure";

export default defineConfig({
  name: "OrangeHRM E2E — Cypress",
  output: "./allure-report",
  // Trend history across runs (CI restores it from GitHub Pages before generating the report).
  historyPath: "./history/history.jsonl",
  plugins: {
    awesome: {
      options: {
        reportName: "OrangeHRM E2E — Cypress",
        reportLanguage: "en",
        groupBy: ["parentSuite", "suite", "subSuite"],
      },
    },
  },
});
