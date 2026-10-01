import { API, ROUTES } from "../../support/routes";
import { BasePage } from "../BasePage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Form } from "../components/Form";
import { Table } from "../components/Table";

class EmployeeListPage extends BasePage {
  constructor() {
    super({ path: ROUTES.employeeList, module: "PIM" });
    this.filters = new Form(".oxd-table-filter form");
    this.table = new Table();
    this.dialog = new ConfirmDialog();
  }

  visit() {
    cy.intercept("GET", `${API}/pim/employees?*`).as("listEmployees");
    super.visit();
    cy.wait("@listEmployees");
    return this;
  }

  searchById(employeeId) {
    cy.intercept("GET", `${API}/pim/employees?*`).as("searchEmployees");
    this.filters.fill("Employee Id", employeeId).submit();
    return cy.wait("@searchEmployees");
  }

  deleteEmployee(employeeId) {
    cy.intercept("DELETE", `${API}/pim/employees`).as("deleteEmployees");
    this.table.delete(employeeId);
    this.dialog.confirm();
    return cy.wait("@deleteEmployees");
  }
}

export default new EmployeeListPage();
