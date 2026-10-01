const WEB = "/web/index.php";

export const API = `${WEB}/api/v2`;

export const ROUTES = {
  login: `${WEB}/auth/login`,
  validateCredentials: `${WEB}/auth/validate`,
  resetPassword: `${WEB}/auth/requestPasswordResetCode`,
  dashboard: `${WEB}/dashboard/index`,
  systemUsers: `${WEB}/admin/viewSystemUsers`,
  addSystemUser: `${WEB}/admin/saveSystemUser`,
  employeeList: `${WEB}/pim/viewEmployeeList`,
  addEmployee: `${WEB}/pim/addEmployee`,
  personalDetails: `${WEB}/pim/viewPersonalDetails/empNumber`,
};

/** Escapes a string so it can be matched literally (and completely) with cy.contains. */
export const exactly = (text) =>
  new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);
