import messages from "../../fixtures/messages.json";
import { loginPage, systemUsersPage, userFormPage } from "../../pages";
import { cleanup } from "../../support/api/cleanup";
import { employeesApi, usersApi } from "../../support/api/orangehrmApi";
import { buildEmployee, buildUser, fullName } from "../../support/factories";

describe("Admin › User Management", { tags: "@admin" }, () => {
  let employee;

  beforeEach(() => {
    cy.loginAsAdmin();
    // Every user belongs to an employee: create one through the API, not the UI.
    const data = buildEmployee();
    employeesApi.create(data).then(({ empNumber }) => {
      employee = { ...data, empNumber, searchText: data.middleName, fullName: fullName(data) };
    });
  });

  /** Creates a user through the API and yields it together with its employee. */
  const givenExistingUser = (overrides = {}) => {
    const user = buildUser(overrides);
    return usersApi
      .create({ ...user, empNumber: employee.empNumber })
      .then(({ id }) => ({ ...user, id }));
  };

  it("creates a user from the UI", { tags: "@smoke" }, () => {
    const user = buildUser({ role: "Admin" });

    systemUsersPage.visit().clickAdd();
    userFormPage.shouldBeLoaded();
    userFormPage.fill({ ...user, employee });
    userFormPage.save().then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      cleanup.trackUser(response.body.data.id);
    });

    systemUsersPage.toast.shouldShow(messages.toast.saved);
    systemUsersPage.shouldBeLoaded();
    systemUsersPage.searchByUsername(user.username);
    systemUsersPage.table
      .rowValues(user.username)
      .should("include.members", [
        user.username,
        "Admin",
        `${employee.firstName} ${employee.lastName}`,
        "Enabled",
      ]);

    // The new account works: log in with it through the UI.
    cy.clearAllCookies();
    loginPage.visit().login(user.username, user.password);
    cy.location("pathname").should("include", "/dashboard");
  });

  it("validates the required fields", () => {
    systemUsersPage.visit().clickAdd();
    userFormPage.shouldBeLoaded();
    userFormPage.form.submit();

    ["User Role", "Employee Name", "Status", "Username", "Password"].forEach((field) => {
      userFormPage.form.errorFor(field).should("have.text", messages.validation.required);
    });
  });

  it("rejects a password confirmation that does not match", () => {
    const user = buildUser();

    cy.visit(userFormPage.path);
    userFormPage.shouldBeLoaded();
    userFormPage.fill({ ...user, confirmPassword: `${user.password}x` });

    userFormPage.form
      .errorFor("Confirm Password")
      .should("have.text", messages.validation.passwordsDoNotMatch);
  });

  it("rejects a username that already exists", () => {
    givenExistingUser().then((existing) => {
      cy.visit(userFormPage.path);
      userFormPage.shouldBeLoaded();
      userFormPage.fill({ username: existing.username });

      userFormPage.form.errorFor("Username").should("have.text", messages.validation.alreadyExists);
    });
  });

  it("disables a user from the edit form", () => {
    givenExistingUser({ status: "Enabled" }).then((existing) => {
      systemUsersPage.visit();
      systemUsersPage.searchByUsername(existing.username);
      systemUsersPage.editUser(existing.username);

      userFormPage.shouldBeLoaded("Edit User");
      userFormPage.form.input("Username").should("have.value", existing.username);
      userFormPage.fill({ status: "Disabled" });
      userFormPage.save("PUT");

      systemUsersPage.toast.shouldShow(messages.toast.updated);
      systemUsersPage.searchByUsername(existing.username);
      systemUsersPage.table.rowValues(existing.username).should("include", "Disabled");
    });
  });

  it("deletes a user after confirmation", () => {
    givenExistingUser().then((existing) => {
      systemUsersPage.visit();
      systemUsersPage.searchByUsername(existing.username);
      systemUsersPage.deleteUser(existing.username).its("response.statusCode").should("eq", 200);

      systemUsersPage.toast.shouldShow(messages.toast.deleted);
      systemUsersPage.searchByUsername(existing.username);
      systemUsersPage.table.shouldBeEmpty();
      usersApi.findByUsername(existing.username).should("be.empty");
    });
  });

  it("keeps the user when the deletion is cancelled", () => {
    givenExistingUser().then((existing) => {
      systemUsersPage.visit();
      systemUsersPage.searchByUsername(existing.username);
      systemUsersPage.table.delete(existing.username);
      systemUsersPage.dialog.cancel();

      systemUsersPage.table.row(existing.username).should("be.visible");
      usersApi.findByUsername(existing.username).should("have.length", 1);
    });
  });
});
