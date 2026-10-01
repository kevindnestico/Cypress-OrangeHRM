export class Toast {
  get() {
    return cy.get(".oxd-toast");
  }

  shouldShow(message) {
    cy.contains(".oxd-toast", message).should("be.visible");
  }
}
