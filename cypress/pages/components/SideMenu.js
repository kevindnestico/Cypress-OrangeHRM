import { exactly } from "../../support/routes";

export class SideMenu {
  items() {
    return cy.get("aside .oxd-main-menu-item--name");
  }

  itemNames() {
    return this.items().then(($items) => [...$items].map((item) => item.innerText.trim()));
  }

  navigateTo(name) {
    cy.contains("aside .oxd-main-menu-item", exactly(name)).click();
  }

  search(text) {
    cy.get("aside .oxd-main-menu-search input").clear();
    cy.get("aside .oxd-main-menu-search input").type(text);
  }

  activeItem() {
    return cy.get("aside .oxd-main-menu-item.active");
  }
}
