import { SideMenu } from "./components/SideMenu";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";

/**
 * Every authenticated page shares the layout (side menu, top bar, toasts).
 * `shouldBeLoaded()` waits for the URL *and* the rendered module header, because OrangeHRM is a
 * Vue SPA and the URL can change before the view is ready.
 */
export class BasePage {
  constructor({ path, module } = {}) {
    this.path = path;
    this.module = module;
    this.sideMenu = new SideMenu();
    this.topBar = new TopBar();
    this.toast = new Toast();
  }

  visit() {
    cy.visit(this.path);
    return this.shouldBeLoaded();
  }

  shouldBeLoaded() {
    cy.location("pathname").should("eq", this.path);
    if (this.module) this.topBar.module().should("have.text", this.module);
    cy.get(".oxd-form-loader, .oxd-loading-spinner").should("not.exist");
    return this;
  }
}
