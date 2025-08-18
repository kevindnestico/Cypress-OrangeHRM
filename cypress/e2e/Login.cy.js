import { LoginPage } from "../support/pageObjects/LoginPage";
import { DashboardPage } from "../support/pageObjects/DashboardPage";

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();
const baseUrl = Cypress.env("baseUrl");
const username = Cypress.env("username");
const password = Cypress.env("password");

describe("Login Tests", () => {
  beforeEach(() => {
    loginPage.visitHomePage(baseUrl);
  });

  it("Successful Login", () => {
    loginPage.login(username, password);
    dashboardPage.shouldLogin();
  });

  it("Unsuccessful Login - Empty Username", () => {
    loginPage.login("", password);
    loginPage.shouldNotLogin();
  });

  it("Unsuccessful Login - Empty Password", () => {
    loginPage.login(username, "");
    loginPage.shouldNotLogin();
  });

  it("Unsuccessful Login - Empty Username And Password", () => {
    loginPage.login("", "");
    loginPage.shouldNotLogin();
  });

  it("Unsuccessful Login - Invalid Username", () => {
    loginPage.login("invalidUsername123", password);
    loginPage.invalidCredentials();
  });

  it("Unsuccessful Login - Invalid Password", () => {
    loginPage.login(username, "invalidPassword123");
    loginPage.invalidCredentials();
  });

  it("Unsuccessful Login - Invalid Username And Password", () => {
    loginPage.login("invalidUsername123", "invalidPassword123");
    loginPage.invalidCredentials();
  });
});
