export class UserManagementPage{

// Locators
    admin_menu_item = '.oxd-text oxd-text--span oxd-main-menu-item--name'
    admin_add_btn = '.orangehrm-header-container > .oxd-button'
    user_role_txt = '.:nth-child(1) > .oxd-grid-2 > :nth-child(1) > .oxd-input-group > .oxd-input-group__label-wrapper > .oxd-label'
    user_role_dropMenu = '.oxd-select-text-input'
    user_role_arrowBtn = '.:nth-child(1) > .oxd-input-group > :nth-child(2) > .oxd-select-wrapper > .oxd-select-text > .oxd-select-text--after > .oxd-icon'
    user_role = '.:nth-child(1) > .oxd-input-group > :nth-child(2) > .oxd-select-wrapper > .oxd-select-text'
// Steps

    navigateToUserManagement(){
        cy.get(this.admin_menu_item).click()
    }
    clickAddBtn(){
        cy.get(this.admin_add_btn).click()
    }
    assertsUserRole(){
        cy.get(this.user_role_txt).should('exist')
    }
    selectUserRole(){
        cy.get(this.user_role).select('Admin')
    }
}