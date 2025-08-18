import { LoginPage } from "../support/pageObjects/LoginPage";
import { DashboardPage } from "../support/pageObjects/DashboardPage";
import { UserManagementPage } from "../support/pageObjects/UserManagementPage";
const Chance = require("chance");

const chance = new Chance();
const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();
const userManagementPage = new UserManagementPage();
const baseUrl = Cypress.env("baseUrl");
const username = Cypress.env("username");
const password = Cypress.env("password");
const employeeName = "Orange";
const randomData = chance.string({
  length: 4,
  pool: "abcdefghijklmnopqrstuvwxyz0123456789",
});

const newUser = {
  username: "kevinUser" + randomData,
  password: "kevinPass" + randomData,
};

describe("User Management Tests", () => {
  beforeEach(() => {
    loginPage.visitHomePage(baseUrl);
    loginPage.login(username, password);
    dashboardPage.shouldLogin();
    dashboardPage.navigateToUserManagement();
  });

  it("Adds New User Successfully", () => {
    userManagementPage.clickAddBtn();
    userManagementPage.selectUserRole({ user: "Admin" });
    userManagementPage.selectUserStatus({ status: "Enabled" });
    userManagementPage.enterEmployeeName({ employee: employeeName });
    userManagementPage.enterUserName({ username: newUser.username });
    userManagementPage.enterNewPassword({ password: newUser.password });
    userManagementPage.clickConfirm();
  });
});
