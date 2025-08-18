const { defineConfig } = require("cypress");
require("dotenv").config({ path: __dirname + "/.env" });

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    reportPageTitle: "OrangeHRM Test Report",
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // Register the cypress-mochawesome-reporter plugin
      require("cypress-mochawesome-reporter/plugin")(on);

      // Map environment variables from .env to Cypress config
      config.env = {
        ...config.env,
        baseUrl: process.env.BASE_URL,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      };

      return config;
    },
  },
});
