import { API } from "../routes";

/**
 * Registry of records created during a test. A global afterEach hook (support/e2e.js) deletes
 * them through the API, so the shared demo instance is left as it was found, even when the test
 * fails halfway. Users are deleted before employees because a user belongs to an employee.
 */
// Support file and spec files are bundled separately, so a plain module-level variable would
// exist twice. The registry lives on the global Cypress object, shared by both bundles.
Cypress.createdTestData ??= { users: new Set(), employees: new Set() };
const created = Cypress.createdTestData;

const deleteAll = (path, ids) =>
  cy.request({
    method: "DELETE",
    url: `${API}${path}`,
    body: { ids: [...ids] },
    failOnStatusCode: false,
  });

export const cleanup = {
  trackUser: (id) => created.users.add(id),
  trackEmployee: (empNumber) => created.employees.add(empNumber),

  pending: () => created.users.size + created.employees.size > 0,

  run() {
    if (!cleanup.pending()) return;
    // The test may have logged out: restore the admin session before calling the API.
    cy.loginAsAdmin();
    if (created.users.size) deleteAll("/admin/users", created.users);
    if (created.employees.size) deleteAll("/pim/employees", created.employees);
    cy.then(() => {
      created.users.clear();
      created.employees.clear();
    });
  },
};
