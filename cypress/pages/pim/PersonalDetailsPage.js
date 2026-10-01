import { ROUTES } from "../../support/routes";
import { BasePage } from "../BasePage";
import { Form } from "../components/Form";

class PersonalDetailsPage extends BasePage {
  constructor() {
    super({ path: ROUTES.personalDetails, module: "PIM" });
    this.form = new Form(".orangehrm-edit-employee-content form");
  }

  shouldBeLoadedFor(empNumber) {
    cy.location("pathname").should("eq", `${this.path}/${empNumber}`);
    cy.get(".oxd-form-loader").should("not.exist");
    return this;
  }

  employeeName() {
    return cy.get(".orangehrm-edit-employee-name h6");
  }
}

export default new PersonalDetailsPage();
