import navigation from "../../fixtures/navigation.json";
import messages from "../../fixtures/messages.json";
import { dashboardPage, loginPage } from "../../pages";
import { buildEmployee, buildUser } from "../../support/factories";
import { employeesApi, usersApi } from "../../support/api/orangehrmApi";

describe("Session and access control", { tags: "@auth" }, () => {
  context("without a session", () => {
    navigation.protectedRoutes.forEach((route) => {
      it(`redirects ${route} to the login page`, () => {
        cy.visit(route);

        loginPage.shouldBeLoaded();
      });
    });
  });

  context("with a session", () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      dashboardPage.visit();
    });

    it("sets an HttpOnly session cookie", () => {
      cy.getCookie("orangehrm").should("include", { httpOnly: true });
    });

    it("keeps the user logged in after a reload", () => {
      cy.reload();

      dashboardPage.shouldBeLoaded();
    });

    it("logs out and protects the app afterwards", { tags: "@smoke" }, () => {
      dashboardPage.topBar.logout();
      loginPage.shouldBeLoaded();

      // Known OrangeHRM defect: going back renders the dashboard for a moment, its widget
      // requests get 401 and the app throws before redirecting. Ignore only that error.
      cy.on("uncaught:exception", (error) => !error.message.includes("reading 'response'"));
      cy.go("back");
      loginPage.shouldBeLoaded();

      cy.visit(dashboardPage.path);
      loginPage.shouldBeLoaded();
    });
  });

  context("disabled accounts", () => {
    it("cannot log in", () => {
      const user = buildUser({ status: "Disabled" });

      cy.loginAsAdmin();
      employeesApi
        .create(buildEmployee())
        .then(({ empNumber }) => usersApi.create({ ...user, empNumber }));

      cy.clearAllCookies();
      loginPage.visit();
      loginPage.login(user.username, user.password);

      loginPage.shouldShowAlert(messages.login.accountDisabled);
    });
  });
});
