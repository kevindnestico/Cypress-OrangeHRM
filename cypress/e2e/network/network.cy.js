import messages from "../../fixtures/messages.json";
import { dashboardPage, systemUsersPage } from "../../pages";
import { API } from "../../support/routes";

describe("Network behavior", { tags: "@network" }, () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("loads the dashboard without failed API calls", () => {
    cy.intercept(`${API}/**`).as("api");

    dashboardPage.visit();

    cy.get("@api.all").then((calls) => {
      expect(calls, "API calls made by the dashboard").to.have.length.greaterThan(0);
      const failed = calls
        .filter(({ response }) => response && response.statusCode >= 400)
        .map(({ request, response }) => `${response.statusCode} ${request.url}`);
      expect(failed, "failed API calls").to.be.empty;
    });
  });

  it("sends the search filters as query parameters", () => {
    systemUsersPage.visit();
    systemUsersPage.filters.select("User Role", "Admin").select("Status", "Enabled");
    systemUsersPage.searchByUsername("Admin").then(({ request, response }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get("username")).to.eq("Admin");
      expect(params.get("userRoleId")).to.eq("1");
      expect(params.get("status")).to.eq("1");
      expect(response.statusCode).to.eq(200);
    });
  });

  it("shows 'No Records Found' when the API returns an empty list (stubbed)", () => {
    cy.intercept("GET", `${API}/admin/users?*`, { fixture: "users-list-empty.json" }).as(
      "listUsers",
    );

    cy.visit(systemUsersPage.path);
    cy.wait("@listUsers");

    systemUsersPage.table.shouldBeEmpty();
    systemUsersPage.toast.shouldShow(messages.toast.noRecords);
  });

  it("shows a loader while the user list is slow to respond", () => {
    cy.intercept("GET", `${API}/admin/users?*`, (request) => {
      request.on("response", (response) => response.setDelay(2000));
    }).as("slowUsers");

    cy.visit(systemUsersPage.path);

    cy.get(".oxd-table-loader, .oxd-loading-spinner").should("be.visible");
    cy.wait("@slowUsers");
    cy.get(".oxd-table-loader, .oxd-loading-spinner").should("not.exist");
    systemUsersPage.table.rows().should("have.length.at.least", 1);
  });

  it("does not break the page when the API fails (stubbed 500)", () => {
    cy.intercept("GET", `${API}/admin/users?*`, {
      statusCode: 500,
      body: { error: { status: "500", message: "Unexpected Error Occurred" } },
    }).as("failingUsers");

    cy.visit(systemUsersPage.path);
    cy.wait("@failingUsers");

    systemUsersPage.toast.get().should("be.visible").and("contain.text", "Error");
    systemUsersPage.sideMenu.items().should("have.length.at.least", 1);
    systemUsersPage.filters.get().should("be.visible");
  });
});
