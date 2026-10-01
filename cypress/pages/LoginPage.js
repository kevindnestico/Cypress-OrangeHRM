import { ROUTES } from "../support/routes";
import { BasePage } from "./BasePage";
import { Form } from "./components/Form";

class LoginPage extends BasePage {
  constructor() {
    super({ path: ROUTES.login });
    this.form = new Form(".orangehrm-login-form form");
  }

  shouldBeLoaded() {
    cy.location("pathname").should("eq", this.path);
    cy.get(".orangehrm-login-title").should("have.text", "Login");
    return this;
  }

  usernameInput() {
    return cy.get("input[name=username]");
  }

  passwordInput() {
    return cy.get("input[name=password]");
  }

  submitButton() {
    return this.form.get().find("button[type=submit]");
  }

  login(username, password) {
    this.form.fill("Username", username).fill("Password", password, { sensitive: true });
    this.submitButton().click();
  }

  alert() {
    return cy.get(".oxd-alert-content-text");
  }

  shouldShowAlert(message) {
    this.alert().should("be.visible").and("have.text", message);
    return this.shouldBeLoaded();
  }

  shouldShowRequiredError(field, message) {
    this.form.errorFor(field).should("be.visible").and("have.text", message);
    return this.shouldBeLoaded();
  }

  forgotPassword() {
    cy.contains(".orangehrm-login-forgot-header", "Forgot your password?").click();
  }
}

export default new LoginPage();
