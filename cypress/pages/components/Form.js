import { exactly } from "../../support/routes";

/**
 * OrangeHRM forms have no ids or test attributes, but every field is an `.oxd-input-group`
 * with a visible label. Fields are located by that label, like getByLabel() in Playwright.
 */
export class Form {
  constructor(root = ".oxd-layout-context form") {
    this.root = root;
  }

  get() {
    return cy.get(this.root);
  }

  field(label) {
    return this.get()
      .contains(".oxd-input-group__label-wrapper label", exactly(label))
      .closest(".oxd-input-group");
  }

  input(label) {
    return this.field(label).find("input");
  }

  fill(label, value, { sensitive = false } = {}) {
    this.input(label).clear();
    if (value) this.input(label).type(value, { log: !sensitive });
    return this;
  }

  select(label, option) {
    this.field(label).find(".oxd-select-text").click();
    cy.contains(".oxd-select-dropdown .oxd-select-option", exactly(option)).click();
    this.field(label).find(".oxd-select-text-input").should("have.text", option);
    return this;
  }

  /** Types into an autocomplete and picks the suggestion (waits for the API, no fixed sleeps). */
  autocomplete(label, text, suggestion = text) {
    this.input(label).clear();
    this.input(label).type(text);
    cy.contains(".oxd-autocomplete-dropdown .oxd-autocomplete-option", suggestion).click();
    return this;
  }

  errorFor(label) {
    return this.field(label).find(".oxd-input-field-error-message");
  }

  submit() {
    this.get().find("button[type=submit]").click();
    return this;
  }

  cancel() {
    this.get().contains("button", "Cancel").click();
    return this;
  }
}
