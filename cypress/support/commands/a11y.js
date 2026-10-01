import * as allure from "allure-js-commons";

/**
 * Accessibility checks with axe-core, without a wrapper plugin: the axe source is read in Node
 * (cy.task) and evaluated in the application window.
 */
Cypress.Commands.add("injectAxe", () => {
  cy.task("axeSource", null, { log: false }).then((source) => {
    cy.window({ log: false }).then((win) => {
      if (!win.axe) win.eval(source);
    });
  });
});

/**
 * Runs axe on the page and yields the violations with the given impacts, minus the rules that
 * are documented as known issues. Every violation is logged and attached to the Allure report.
 */
Cypress.Commands.add(
  "axeViolations",
  ({ context = "body", impacts = ["critical", "serious"], knownIssues = [] } = {}) => {
    cy.injectAxe();
    return cy
      .window({ log: false })
      .then((win) =>
        win.axe.run(win.document.querySelector(context), { resultTypes: ["violations"] }),
      )
      .then(({ violations }) => {
        const relevant = violations.filter((violation) => impacts.includes(violation.impact));
        allure.attachment(
          "axe violations",
          JSON.stringify(violations, null, 2),
          "application/json",
        );

        relevant.forEach((violation) => {
          Cypress.log({
            name: "a11y",
            message: `[${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`,
            consoleProps: () => violation,
          });
        });
        cy.task(
          "table",
          relevant.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
          { log: false },
        );

        const fixedKnownIssues = knownIssues.filter((id) => !relevant.some((v) => v.id === id));
        if (fixedKnownIssues.length) {
          Cypress.log({
            name: "a11y",
            message: `known issues not found anymore: ${fixedKnownIssues.join(", ")}`,
          });
        }

        return cy.wrap(
          relevant.filter((violation) => !knownIssues.includes(violation.id)),
          { log: false },
        );
      });
  },
);
