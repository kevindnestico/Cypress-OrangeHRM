/** The `.oxd-table` used by every list page (System Users, Employee List, ...). */
export class Table {
  rows() {
    return cy.get(".oxd-table-body .oxd-table-card");
  }

  row(text) {
    return cy.contains(".oxd-table-body .oxd-table-card", text);
  }

  /** Cell values of a row, in column order (the checkbox and actions columns are empty strings). */
  rowValues(text) {
    return this.row(text)
      .find("[role=cell]")
      .then(($cells) => [...$cells].map((cell) => cell.innerText.trim()));
  }

  recordCount() {
    return cy
      .contains(".orangehrm-horizontal-padding span", /Records? Found/)
      .invoke("text")
      .then((text) => (text.includes("No Records") ? 0 : Number(text.match(/\((\d+)\)/)[1])));
  }

  shouldBeEmpty() {
    cy.contains(".orangehrm-horizontal-padding span", "No Records Found").should("be.visible");
    this.rows().should("not.exist");
  }

  edit(text) {
    this.row(text).find(".bi-pencil-fill").click();
  }

  delete(text) {
    this.row(text).find(".bi-trash").click();
  }
}
