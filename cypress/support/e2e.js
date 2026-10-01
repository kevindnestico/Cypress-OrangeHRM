import "allure-cypress";
import { register as registerGrep } from "@cypress/grep";
import * as allure from "allure-js-commons";

import { cleanup } from "./api/cleanup";
import "./commands/a11y";
import "./commands/auth";
import "./commands/locale";

registerGrep();

// The shared demo's language can be changed by anyone: check (and restore) it before each spec.
before(() => {
  cy.ensureDemoLanguage();
});

beforeEach(() => {
  // CI runs the suite on several browsers and merges the results into one Allure report.
  allure.parameter("browser", `${Cypress.browser.name} ${Cypress.browser.majorVersion}`);
});

// Delete everything the test created through the API, even when the test failed.
afterEach(() => {
  cleanup.run();
});
