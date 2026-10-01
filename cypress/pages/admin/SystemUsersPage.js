import { API, ROUTES } from "../../support/routes";
import { BasePage } from "../BasePage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Form } from "../components/Form";
import { Table } from "../components/Table";

class SystemUsersPage extends BasePage {
  constructor() {
    super({ path: ROUTES.systemUsers, module: "Admin" });
    this.filters = new Form(".oxd-table-filter form");
    this.table = new Table();
    this.dialog = new ConfirmDialog();
  }

  /** Visits the page and waits for the user list request, so the table is ready to read. */
  visit() {
    cy.intercept("GET", `${API}/admin/users?*`).as("listUsers");
    super.visit();
    cy.wait("@listUsers");
    return this;
  }

  searchByUsername(username) {
    cy.intercept("GET", `${API}/admin/users?*`).as("searchUsers");
    this.filters.fill("Username", username).submit();
    return cy.wait("@searchUsers");
  }

  clickAdd() {
    cy.get(".orangehrm-header-container").contains("button", "Add").click();
  }

  editUser(username) {
    this.table.edit(username);
  }

  deleteUser(username) {
    cy.intercept("DELETE", `${API}/admin/users`).as("deleteUsers");
    this.table.delete(username);
    this.dialog.confirm();
    return cy.wait("@deleteUsers");
  }
}

export default new SystemUsersPage();
