import { API } from "../routes";
import { cleanup } from "./cleanup";

/**
 * Thin client for OrangeHRM's REST API (v2). It reuses the browser session cookie set by
 * cy.login(), so it is used for fast, UI-independent preconditions and for cleanup.
 */
const ROLE_IDS = { Admin: 1, ESS: 2 };

const request = (method, path, options = {}) =>
  cy.request({ method, url: `${API}${path}`, ...options });

export const employeesApi = {
  /** Creates an employee and registers it for automatic cleanup. Yields the API record. */
  create(employee) {
    return request("POST", "/pim/employees", { body: employee })
      .its("body.data")
      .then((created) => {
        cleanup.trackEmployee(created.empNumber);
        return created;
      });
  },

  search(nameOrId) {
    return request("GET", "/pim/employees", { qs: { nameOrId, limit: 50 } }).its("body.data");
  },
};

export const usersApi = {
  /** Creates a system user and registers it for automatic cleanup. Yields the API record. */
  create({ username, password, role = "ESS", status = "Enabled", empNumber }) {
    return request("POST", "/admin/users", {
      body: {
        username,
        password,
        status: status === "Enabled",
        userRoleId: ROLE_IDS[role],
        empNumber,
      },
    })
      .its("body.data")
      .then((created) => {
        cleanup.trackUser(created.id);
        return created;
      });
  },

  findByUsername(username) {
    return request("GET", "/admin/users", { qs: { username, limit: 50 } }).its("body.data");
  },
};
