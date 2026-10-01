import { API, ROUTES } from "../../support/routes";
import { BasePage } from "../BasePage";
import { Form } from "../components/Form";

class AddEmployeePage extends BasePage {
  constructor() {
    super({ path: ROUTES.addEmployee, module: "PIM" });
    this.form = new Form();
  }

  firstName() {
    return cy.get("input[name=firstName]");
  }

  middleName() {
    return cy.get("input[name=middleName]");
  }

  lastName() {
    return cy.get("input[name=lastName]");
  }

  fill({ firstName, middleName, lastName, employeeId }) {
    const type = (getInput, value) => {
      getInput().clear();
      if (value) getInput().type(value);
    };
    type(() => this.firstName(), firstName);
    type(() => this.middleName(), middleName);
    type(() => this.lastName(), lastName);
    // Employee Id is pre-filled with the next free number: always overwrite it.
    if (employeeId !== undefined) this.form.fill("Employee Id", employeeId);
    return this;
  }

  /** Saves and yields the POST /pim/employees call. */
  save() {
    cy.intercept("POST", `${API}/pim/employees`).as("createEmployee");
    this.form.submit();
    return cy.wait("@createEmployee");
  }

  /** The name inputs share one label ("Employee Full Name"), so their errors are found by input. */
  nameError(name) {
    return cy
      .get(`input[name=${name}]`)
      .closest(".oxd-input-group")
      .find(".oxd-input-field-error-message");
  }
}

export default new AddEmployeePage();
