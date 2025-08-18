export class UserManagementPage {
  admin_menu_item = ".oxd-main-menu-item--name";
  admin_add_btn = ".orangehrm-header-container > .oxd-button";
  user_role_txt = ".oxd-input-group__label-wrapper .oxd-label";
  user_role_dropdown =
    ":nth-child(1) > .oxd-input-group > :nth-child(2) > .oxd-select-wrapper > .oxd-select-text > .oxd-select-text--after > .oxd-icon";
  user_role_status_dropdown =
    ":nth-child(3) > .oxd-input-group > :nth-child(2) > .oxd-select-wrapper > .oxd-select-text > .oxd-select-text--after > .oxd-icon";
  user_role_arrowBtn = ".oxd-select-text--after .oxd-icon";
  user_role = ".oxd-select-text";
  user_container = ".orangehrm-card-container";
  user_dropdown_options = ".oxd-select-option";
  user_dropdown_option_selected = ".oxd-select-text--active";
  user_employee = ".oxd-autocomplete-text-input > input";
  user_employee_option = ".oxd-autocomplete-option";
  user_username =
    ":nth-child(4) > .oxd-input-group > :nth-child(2) > .oxd-input";
  user_new_password =
    ".user-password-cell > .oxd-input-group > :nth-child(2) > .oxd-input";
  user_reenter_new_password =
    ":nth-child(2) > .oxd-input-group > :nth-child(2) > .oxd-input";
  user_confirm_btn = ".oxd-button--secondary";
  user_search_username = ":nth-child(2) > .oxd-input";
  user_search_btn = ".oxd-form-actions > .oxd-button--secondary";
  user_record_found = "oxd-table-cell oxd-padding-cell";
  user_actions_edit = "oxd-icon bi-pencil-fill";
  user_edit_status = "oxd-select-text--after";
  user_edit_save_btn =
    "oxd-button oxd-button--medium oxd-button--secondary orangehrm-left-space";
  user_edit_selected_status = "oxd-select-text-input";

  navigateToUserManagement() {
    cy.get(this.admin_menu_item).should("be.visible").click();
  }
  clickAddBtn() {
    cy.get(this.admin_add_btn).click();
    cy.get(this.user_container).contains("Add User");
  }
  selectUserRole({ user: user }) {
    cy.get(this.user_role_dropdown).click();
    cy.get(this.user_dropdown_options).contains(user).click();
    cy.get(this.user_dropdown_option_selected).should("contain", user);
  }

  selectUserStatus({ status: status }) {
    cy.get(this.user_role_status_dropdown).click();
    cy.get(this.user_dropdown_options).contains(status).click();
    cy.get(this.user_dropdown_option_selected).should("contain", status);
  }

  enterEmployeeName({ employee: employee }) {
    cy.get(this.user_employee).type(employee);
    cy.wait(3000);
    cy.get(this.user_employee_option).click();
  }

  enterUserName({ username: username }) {
    cy.get(this.user_username).type(username);
  }

  enterNewPassword({ password: password }) {
    cy.get(this.user_new_password).type(password);
    cy.get(this.user_reenter_new_password).type(password);
  }

  clickConfirm() {
    cy.get(this.user_confirm_btn).click();
  }

  enterSearchUsername({ username: username }) {
    cy.get(this.user_search_username).type(username);
  }

  clickSearchBtn() {
    cy.get(this.user_search_btn).click();
  }

  assertUserSearch({ username: username }) {
    cy.get(this.user_record_found).should("contain", username);
  }

  editStatus({ status: status }) {
    cy.get(this.user_actions_edit).click();
    cy.get(this.user_edit_status).contains(status).click();
    cy.get(this.user_edit_selected_status).should("contain", status);
  }

  editClickSave() {
    cy.get(this.user_edit_save_btn).click();
  }
}
