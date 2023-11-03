import { LoginPage } from "../support/pageObjects/LoginPage"
import { DashboardPage } from "../support/pageObjects/DashboardPage";
import { UserManagementPage } from "../support/pageObjects/UserManagementPage";

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();
const userManagementPage = new UserManagementPage();

describe('Add User', () => {
    
    beforeEach(() => {
    loginPage.visitHomePage()
    loginPage.loginClearInputBox()
    loginPage.enterUserName('Admin')
    loginPage.enterPassword('admin123')
    loginPage.clickLogin()
    dashboardPage.shouldLogin()
    });

    it('Add New User', () => {
    dashboardPage.navigateToUserManagement()
    userManagementPage.clickAddBtn()
    userManagementPage.assertsUserRole()
    userManagementPage.selectUserRole()
    })
})
