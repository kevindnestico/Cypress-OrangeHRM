export class LoginPage {

// Locators

username_textbox = ':nth-child(2) > .oxd-input-group > :nth-child(2) > .oxd-input'
password_textbox = ':nth-child(3) > .oxd-input-group > :nth-child(2) > .oxd-input'
login_btn = '.oxd-button'
required_txt = '.oxd-input-group > .oxd-text'
invalid_cred_icon = '.oxd-alert-content > .oxd-icon'
invalid_cred_txt = '.oxd-alert-content > .oxd-text'

// Steps

    visitHomePage(){
    cy
        .visit('https://opensource-demo.orangehrmlive.com')
    }

    enterUserName(username){
    cy
        .get(this.username_textbox).type(username)
    }

    enterPassword(password){
    cy
        .get(this.password_textbox).type(password) 
    }
    
    clickLogin(){
    cy
        .get(this.login_btn).click()
    }

// Assertions

    shouldNotLogin(){
    cy
        .get(this.required_txt).should('be.visible')
    }

    invalidCredentials(){
    cy
        .get(this.invalid_cred_icon).should('be.visible')
        .get(this.invalid_cred_txt).should('be.visible')
    }

    loginClearInputBox() {
    cy
        .get(this.username_textbox).clear()
        .get(this.password_textbox).clear()
    }
}