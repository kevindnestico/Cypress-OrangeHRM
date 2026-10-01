import messages from "../../fixtures/messages.json";
import { addEmployeePage, employeeListPage, personalDetailsPage } from "../../pages";
import { cleanup } from "../../support/api/cleanup";
import { employeesApi } from "../../support/api/orangehrmApi";
import { buildEmployee, fullName } from "../../support/factories";

describe("PIM › Employees", { tags: "@pim" }, () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("adds an employee from the UI", { tags: "@smoke" }, () => {
    const employee = buildEmployee();

    addEmployeePage.visit().fill(employee);
    addEmployeePage.save().then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body.data).to.include({
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
      });
      const { empNumber } = response.body.data;
      cleanup.trackEmployee(empNumber);

      addEmployeePage.toast.shouldShow(messages.toast.saved);
      personalDetailsPage.shouldBeLoadedFor(empNumber);
      personalDetailsPage
        .employeeName()
        .should("have.text", `${employee.firstName} ${employee.lastName}`);
    });

    employeeListPage.visit().searchById(employee.employeeId);
    employeeListPage.table
      .rowValues(employee.employeeId)
      .should("include.members", [
        employee.employeeId,
        `${employee.firstName} ${employee.middleName}`,
        employee.lastName,
      ]);
  });

  it("requires first and last name", () => {
    const { employeeId } = buildEmployee();
    addEmployeePage.visit().fill({ firstName: "", middleName: "", lastName: "", employeeId });
    addEmployeePage.form.submit();

    addEmployeePage.nameError("firstName").should("have.text", messages.validation.required);
    addEmployeePage.nameError("lastName").should("have.text", messages.validation.required);
    addEmployeePage.nameError("middleName").should("not.exist");
    addEmployeePage.shouldBeLoaded();
  });

  it("rejects an Employee Id that is already in use", () => {
    const existing = buildEmployee();
    employeesApi.create(existing);

    addEmployeePage.visit().fill(buildEmployee({ employeeId: existing.employeeId }));

    addEmployeePage.form
      .errorFor("Employee Id")
      .should("have.text", messages.validation.employeeIdExists);
  });

  it("finds an employee by name and by id", () => {
    const employee = buildEmployee();
    employeesApi.create(employee);

    employeeListPage.visit();
    employeeListPage.filters.autocomplete("Employee Name", employee.middleName, fullName(employee));
    employeeListPage.filters.submit();
    employeeListPage.table.rows().should("have.length", 1);
    employeeListPage.table.row(employee.employeeId).should("be.visible");

    employeeListPage.filters.get().contains("button", "Reset").click();
    employeeListPage.searchById(employee.employeeId);
    employeeListPage.table.recordCount().should("eq", 1);
  });

  it("deletes an employee after confirmation", () => {
    const employee = buildEmployee();
    employeesApi.create(employee);

    employeeListPage.visit().searchById(employee.employeeId);
    employeeListPage
      .deleteEmployee(employee.employeeId)
      .its("response.statusCode")
      .should("eq", 200);

    employeeListPage.toast.shouldShow(messages.toast.deleted);
    employeesApi.search(employee.employeeId).should("be.empty");
  });
});
