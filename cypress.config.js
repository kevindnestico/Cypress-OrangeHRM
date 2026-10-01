const fs = require("node:fs");
const os = require("node:os");
const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");
const { plugin: grepPlugin } = require("@cypress/grep/plugin");
const { FailureAnalyzer, toMarkdown } = require("./ai/failureAnalyzer");

require("dotenv").config({ quiet: true });

const baseUrl = process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com";
// Claude root-cause analysis of failed tests: opt-in, see ai/failureAnalyzer.js
const aiAnalysis = process.env.AI_ANALYSIS === "true";

module.exports = defineConfig({
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.js",
    viewportWidth: 1366,
    viewportHeight: 768,
    // The public demo is shared and sometimes slow: generous timeouts, one retry in CI.
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 15000,
    retries: { runMode: 1, openMode: 0 },
    video: false,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: true,

    // Secrets: read in tests with cy.env(), never bundled into the spec files.
    env: {
      adminUsername: process.env.ADMIN_USERNAME || "Admin",
      adminPassword: process.env.ADMIN_PASSWORD || "admin123",
    },

    setupNodeEvents(on, config) {
      grepPlugin(config);

      config.expose = { ...config.expose, aiAnalysis };
      const analyzer = aiAnalysis ? new FailureAnalyzer() : null;
      if (aiAnalysis) fs.rmSync("ai-analysis.md", { force: true });

      allureCypress(on, config, {
        resultsDir: "allure-results",
        environmentInfo: {
          "Base URL": baseUrl,
          Node: process.version,
          OS: `${os.platform()} ${os.release()}`,
        },
      });

      on("task", {
        // axe-core is injected into the app under test from Node, see support/commands/a11y.js
        axeSource: () => fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"),
        log(message) {
          console.log(message);
          return null;
        },
        table(rows) {
          console.table(rows);
          return null;
        },
        async analyzeFailure(context) {
          if (!analyzer) return null;
          const analysis = await analyzer.analyze(context);
          if (!analysis) {
            return { unavailable: analyzer.disabledReason ?? "No analysis returned (see logs)" };
          }
          const markdown = toMarkdown(analysis);
          console.log(`\n[ai] ${context.testTitle}\n${markdown}\n`);
          // One file for the whole run; CI publishes it in the GitHub Actions job summary.
          fs.appendFileSync("ai-analysis.md", `# ${context.testTitle}\n\n${markdown}\n\n`);
          return { analysis, markdown };
        },
      });

      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium" && browser.isHeadless) {
          launchOptions.args.push("--window-size=1366,768");
        }
        return launchOptions;
      });

      return config;
    },
  },
});
