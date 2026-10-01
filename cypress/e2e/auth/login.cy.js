import cases from "../../fixtures/login-cases.json";
import messages from "../../fixtures/messages.json";
import { dashboardPage, loginPage } from "../../pages";
import { ROUTES } from "../../support/routes";
import { resolveTemplate } from "../../support/utils/template";

describe("Login", { tags: "@auth" }, () => {
  let admin;

  before(() => {
    cy.adminCredentials().then((credentials) => {
      admin = credentials;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", ROUTES.validateCredentials).as("validateCredentials");
    loginPage.visit();
  });

  const resolve = (template) =>
    resolveTemplate(template, { adminUsername: admin.username, adminPassword: admin.password });

  it("logs in with valid credentials and lands on the dashboard", { tags: "@smoke" }, () => {
    loginPage.login(admin.username, admin.password);

    dashboardPage.shouldBeLoaded();
    dashboardPage.topBar.userName().should("not.be.empty");
  });

  it("submits the form with the Enter key", () => {
    loginPage.usernameInput().type(admin.username);
    loginPage.passwordInput().type(`${admin.password}{enter}`, { log: false });

    dashboardPage.shouldBeLoaded();
  });

  it("masks the password field", () => {
    loginPage.passwordInput().should("have.attr", "type", "password");
  });

  context("usernames are case-insensitive", () => {
    cases.validUsernameVariants.forEach(({ title, transform }) => {
      it(`logs in with a ${title}`, () => {
        const username =
          transform === "uppercase" ? admin.username.toUpperCase() : admin.username.toLowerCase();
        loginPage.login(username, admin.password);

        dashboardPage.shouldBeLoaded();
      });
    });
  });

  context("rejects invalid credentials", () => {
    cases.invalidCredentials.forEach(({ title, username, password }) => {
      it(`shows an error for ${title}`, () => {
        loginPage.login(resolve(username), resolve(password));

        cy.wait("@validateCredentials");
        loginPage.shouldShowAlert(messages.login.invalidCredentials);
      });
    });
  });

  context("validates required fields on the client", () => {
    cases.missingFields.forEach(({ title, username, password, required }) => {
      it(`flags ${title} without calling the server`, () => {
        loginPage.login(resolve(username), resolve(password));

        required.forEach((field) =>
          loginPage.shouldShowRequiredError(field, messages.login.required),
        );
        cy.get("@validateCredentials.all").should("have.length", 0);
      });
    });
  });

  it("opens the reset password page from 'Forgot your password?'", () => {
    loginPage.forgotPassword();

    cy.location("pathname").should("eq", ROUTES.resetPassword);
    cy.contains("h6", "Reset Password").should("be.visible");
  });
});
