import js from "@eslint/js";
import pluginCypress from "eslint-plugin-cypress";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "allure-results/",
      "allure-report/",
      "cypress/screenshots/",
      "cypress/videos/",
    ],
  },
  js.configs.recommended,
  {
    files: ["*.js", "*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["cypress/**/*.js"],
    ...pluginCypress.configs.recommended,
    rules: {
      ...pluginCypress.configs.recommended.rules,
      "cypress/no-unnecessary-waiting": "error",
      "cypress/no-force": "warn",
      "cypress/assertion-before-screenshot": "warn",
      "cypress/no-pause": "error",
      "cypress/no-debug": "error",
    },
  },
  prettier,
];
