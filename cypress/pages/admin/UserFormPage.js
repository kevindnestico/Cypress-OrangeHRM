import { API, ROUTES } from "../../support/routes";
import { BasePage } from "../BasePage";
import { Form } from "../components/Form";

/** Add User and Edit User share the same form. */
class UserFormPage extends BasePage {
  constructor() {
    super({ path: ROUTES.addSystemUser, module: "Admin" });
    this.form = new Form();
  }

  title() {
    return cy.get(".orangehrm-card-container .orangehrm-main-title");
  }

  shouldBeLoaded(title = "Add User") {
    cy.location("pathname").should("include", this.path);
    this.title().should("have.text", title);
    cy.get(".oxd-form-loader").should("not.exist");
    return this;
  }

  /** Fills only the fields that are given, so validation tests can leave fields empty. */
  fill({ role, employee, status, username, password, confirmPassword = password }) {
    if (role) this.form.select("User Role", role);
    if (employee) this.form.autocomplete("Employee Name", employee.searchText, employee.fullName);
    if (status) this.form.select("Status", status);
    if (username !== undefined) this.fillUsername(username);
    if (password !== undefined) this.form.fill("Password", password, { sensitive: true });
    if (confirmPassword !== undefined) {
      this.form.fill("Confirm Password", confirmPassword, { sensitive: true });
    }
    return this;
  }

  /**
   * The username is checked for uniqueness by an async API call. Waiting for it keeps the
   * "Already exists" error deterministic, and leaving the page while it is in flight makes
   * OrangeHRM throw an unhandled rejection (seen on Firefox).
   */
  fillUsername(username) {
    cy.intercept("GET", `${API}/admin/validation/user-name?*`).as("validateUsername");
    this.form.fill("Username", username);
    if (username) cy.wait("@validateUsername");
    return this;
  }

  /** Saves the form; yields the intercepted API call (POST /users to add, PUT /users/:id to edit). */
  save(method = "POST") {
    const url = method === "POST" ? `${API}/admin/users` : `${API}/admin/users/*`;
    cy.intercept(method, url).as("saveUser");
    this.form.submit();
    return cy.wait("@saveUser");
  }
}

export default new UserFormPage();
