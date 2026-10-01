import navigation from "../../fixtures/navigation.json";
import { dashboardPage } from "../../pages";
import { employeesApi, usersApi } from "../../support/api/orangehrmApi";
import { buildEmployee, buildUser } from "../../support/factories";
import { API, ROUTES } from "../../support/routes";

describe("Dashboard and navigation", { tags: "@navigation" }, () => {
  context("as an admin", () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      dashboardPage.visit();
    });

    it("shows every dashboard widget", { tags: "@smoke" }, () => {
      dashboardPage.widgetTitles().should("deep.equal", navigation.dashboardWidgets);
    });

    it("shows the full side menu", () => {
      dashboardPage.sideMenu.itemNames().should(
        "deep.equal",
        navigation.adminMenu.map(({ item }) => item),
      );
    });

    navigation.adminMenu.forEach(({ item, path, module, reauthentication }) => {
      it(`opens ${item} from the side menu`, () => {
        dashboardPage.sideMenu.navigateTo(item);

        cy.location("pathname").should("include", path);
        if (reauthentication) {
          // Critical admin functions ask for the password again before opening.
          cy.contains("h6", reauthentication).should("be.visible");
          cy.get("input[name=password]").should("have.value", "");
          return;
        }
        dashboardPage.topBar.module().should("have.text", module);
        dashboardPage.sideMenu.activeItem().should("contain.text", item);
      });
    });

    it("filters the side menu with the search box", () => {
      dashboardPage.sideMenu.search("ad");

      dashboardPage.sideMenu.itemNames().should("deep.equal", ["Admin"]);
    });
  });

  context("as an ESS (non-admin) user", () => {
    beforeEach(() => {
      const user = buildUser({ role: "ESS" });

      cy.loginAsAdmin();
      employeesApi
        .create(buildEmployee())
        .then(({ empNumber }) => usersApi.create({ ...user, empNumber }));

      cy.login(user);
      dashboardPage.visit();
    });

    it("only sees the self-service modules", () => {
      dashboardPage.sideMenu.itemNames().should("deep.equal", navigation.essMenu);
    });

    navigation.adminOnlyRoutes.forEach((route) => {
      it(`cannot open ${route} by URL`, () => {
        cy.visit(route, { failOnStatusCode: false });

        cy.contains(
          ".orangehrm-error-message, .oxd-alert-content-text, h6",
          /Credential Required/i,
        ).should("be.visible");
        cy.location("pathname").should("not.eq", ROUTES.login);
      });
    });

    it("cannot call admin-only API endpoints", () => {
      cy.request({ url: `${API}/admin/users`, failOnStatusCode: false })
        .its("status")
        .should("be.oneOf", [401, 403]);
    });
  });
});
