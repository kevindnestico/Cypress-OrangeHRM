export class ConfirmDialog {
  get() {
    return cy.get(".orangehrm-dialog-popup").should("be.visible");
  }

  confirm() {
    this.get().contains("button", "Yes, Delete").click();
  }

  cancel() {
    this.get().contains("button", "No, Cancel").click();
  }
}
