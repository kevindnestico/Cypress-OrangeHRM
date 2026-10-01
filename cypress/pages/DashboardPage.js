import { ROUTES } from "../support/routes";
import { BasePage } from "./BasePage";

class DashboardPage extends BasePage {
  constructor() {
    super({ path: ROUTES.dashboard, module: "Dashboard" });
  }

  /**
   * Waits for every widget to finish loading. Leaving the page (e.g. logging out) while widget
   * requests are in flight makes OrangeHRM throw an uncaught TypeError when they come back 401.
   */
  shouldBeLoaded() {
    super.shouldBeLoaded();
    cy.get(".orangehrm-dashboard-widget").should("have.length.at.least", 1);
    cy.get(".orangehrm-dashboard-widget .oxd-loading-spinner").should("not.exist");
    return this;
  }

  widgetTitles() {
    return cy
      .get(".orangehrm-dashboard-widget-name p")
      .then(($titles) => [...$titles].map((title) => title.innerText.trim()));
  }
}

export default new DashboardPage();
