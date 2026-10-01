export class TopBar {
  module() {
    return cy.get(".oxd-topbar-header-breadcrumb-module");
  }

  userName() {
    return cy.get(".oxd-userdropdown-name");
  }

  openUserMenu() {
    cy.get(".oxd-userdropdown-tab").click();
    return cy.get(".oxd-dropdown-menu").should("be.visible");
  }

  logout() {
    this.openUserMenu().contains("a", "Logout").click();
  }
}
