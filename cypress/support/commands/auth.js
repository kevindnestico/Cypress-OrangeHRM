import { API, ROUTES } from "../routes";

/**
 * Programmatic login: reads the CSRF token from the login page and posts the same form the UI
 * submits. It is ~10x faster than typing into the form and is used as the precondition of every
 * test that is not about the login screen itself.
 */
Cypress.Commands.add("loginByApi", (username, password) => {
  cy.request(ROUTES.login)
    .its("body")
    .then((html) => {
      const token = html.match(/:token="&quot;(.+?)&quot;"/)?.[1];
      expect(token, "CSRF token in the login page").to.be.a("string");

      cy.request({
        method: "POST",
        url: ROUTES.validateCredentials,
        form: true,
        body: { _token: token, username, password },
        followRedirect: false,
        log: false,
      }).then(({ status, redirectedToUrl }) => {
        expect(status, "login response").to.eq(302);
        expect(redirectedToUrl, "redirect after login").to.include(ROUTES.dashboard);
      });
    });
});

/**
 * Logs in once and caches the session (cookies) with cy.session: later calls restore it instead
 * of logging in again, across tests and spec files. The session is validated with a cheap API
 * call and recreated automatically when the server has expired it.
 */
Cypress.Commands.add("login", ({ username, password }) => {
  cy.session(
    ["user", username],
    () => {
      cy.loginByApi(username, password);
    },
    {
      validate() {
        cy.request({ url: `${API}/pim/employees?limit=1`, log: false })
          .its("status")
          .should("eq", 200);
      },
      cacheAcrossSpecs: true,
    },
  );
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.env(["adminUsername", "adminPassword"], { log: false }).then(
    ({ adminUsername, adminPassword }) => {
      cy.login({ username: adminUsername, password: adminPassword });
    },
  );
});

/** Yields the admin credentials, for the tests that drive the login form. */
Cypress.Commands.add("adminCredentials", () =>
  cy
    .env(["adminUsername", "adminPassword"], { log: false })
    .then(({ adminUsername, adminPassword }) => ({
      username: adminUsername,
      password: adminPassword,
    })),
);
