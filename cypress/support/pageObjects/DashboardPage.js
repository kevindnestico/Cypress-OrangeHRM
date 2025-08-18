export class DashboardPage {
  dashboard_txt = ":nth-child(8) > .oxd-main-menu-item";
  SideMenu_Admin = ":nth-child(1) > .oxd-main-menu-item > .oxd-text";

  shouldLogin() {
    cy.get(this.dashboard_txt).should("have.text", "Dashboard");
  }
  navigateToUserManagement() {
    cy.get(this.SideMenu_Admin).click();
  }
}
