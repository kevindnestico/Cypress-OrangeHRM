import { localizationApi } from "../api/orangehrmApi";

const REQUIRED_LANGUAGE = "en_US";

/**
 * The public demo is shared, and its language is a global setting that anyone can change from
 * Admin › Localization (it was switched to Chinese in the middle of a CI run once). The suite
 * asserts English texts, so before each spec the language is checked and, if needed, restored to
 * English. The date format is kept as it is. Every restore is logged in the Cypress command log
 * and in the terminal (CI log). If the language cannot be restored, the run stops with a clear
 * message instead of dozens of unrelated text assertion failures.
 */
Cypress.Commands.add("ensureDemoLanguage", () => {
  cy.loginAsAdmin();
  localizationApi.get().then(({ language, dateFormat }) => {
    if (language === REQUIRED_LANGUAGE) return;

    const message =
      `Demo language was "${language}" (changed by another demo user). ` +
      `Restoring "${REQUIRED_LANGUAGE}" before running ${Cypress.spec.relative}.`;
    Cypress.log({ name: "locale", message });
    cy.task("log", `[locale] ${message}`, { log: false });

    localizationApi.update({ language: REQUIRED_LANGUAGE, dateFormat });
    localizationApi.get().then((restored) => {
      expect(
        restored.language,
        `Demo language must be ${REQUIRED_LANGUAGE}: the suite asserts English texts`,
      ).to.eq(REQUIRED_LANGUAGE);
      cy.task("log", `[locale] Restored "${REQUIRED_LANGUAGE}".`, { log: false });
    });
  });

  // Test isolation clears the browser before `before` hooks run, not after: leave it clean so the
  // first test of the spec does not start logged in (the cy.session cache is kept).
  cy.clearAllCookies({ log: false });
  cy.clearAllLocalStorage({ log: false });
  cy.clearAllSessionStorage({ log: false });
});
