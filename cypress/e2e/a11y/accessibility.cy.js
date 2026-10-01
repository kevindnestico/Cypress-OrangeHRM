import knownIssues from "../../fixtures/a11y-known-issues.json";
import {
  dashboardPage,
  employeeListPage,
  loginPage,
  systemUsersPage,
  userFormPage,
} from "../../pages";

/**
 * axe-core scans of the main pages. The build fails on critical and serious violations, except for
 * the rules documented in fixtures/a11y-known-issues.json (current OrangeHRM defects). The full
 * axe output is attached to every test in the Allure report.
 */
const pages = [
  { name: "login", open: () => loginPage.visit(), authenticated: false },
  { name: "dashboard", open: () => dashboardPage.visit() },
  { name: "systemUsers", open: () => systemUsersPage.visit() },
  {
    name: "addUser",
    open: () => {
      cy.visit(userFormPage.path);
      userFormPage.shouldBeLoaded();
    },
  },
  { name: "employeeList", open: () => employeeListPage.visit() },
];

describe("Accessibility (axe-core)", { tags: "@a11y" }, () => {
  pages.forEach(({ name, open, authenticated = true }) => {
    it(`${name} page has no new critical or serious violations`, () => {
      if (authenticated) cy.loginAsAdmin();
      open();

      cy.axeViolations({ knownIssues: knownIssues[name] }).then((violations) => {
        const summary = violations.map(({ id, impact, help }) => `[${impact}] ${id}: ${help}`);
        expect(summary, "new accessibility violations").to.be.empty;
      });
    });
  });
});
