import * as allure from "allure-js-commons";

/**
 * With AI_ANALYSIS=true, every test that fails on its last attempt is sent to Claude (Node side,
 * `analyzeFailure` task in cypress.config.js). The context is captured here, right after the
 * failure and before the cleanup hook clears the page. The diagnosis is attached to Allure (in the
 * test's teardown, since it runs in an afterEach hook) and appended to ai-analysis.md.
 */

/** The page's DOM without noise (icons, styles, scripts, Vue scope attributes). */
const cleanDom = (doc) => {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll("svg, script, style, noscript, canvas").forEach((node) => node.remove());
  return body.outerHTML
    .replace(/ data-v-[0-9a-f]+=""/g, "")
    .replace(/src="data:[^"]*"/g, 'src="data:..."')
    .replace(/<!---->/g, "")
    .replace(/>\s+</g, "><");
};

const errorText = (error) =>
  [error.message, error.codeFrame?.frame, error.stack].filter(Boolean).join("\n\n");

const attachAnalysis = ({ analysis, markdown, unavailable }) => {
  if (unavailable) {
    allure.attachment("ai-analysis-unavailable", unavailable, "text/plain");
    return;
  }
  allure.attachment("ai-analysis.md", markdown, "text/markdown");
  allure.attachment("ai-analysis.json", JSON.stringify(analysis, null, 2), "application/json");
  Cypress.log({ name: "ai", message: `[${analysis.category}] ${analysis.summary}` });
};

export const registerFailureAnalysis = () => {
  afterEach(function () {
    const test = this.currentTest;
    if (!Cypress.expose("aiAnalysis") || test.state !== "failed") return;
    // Only the final attempt: a test that passes on retry is not analyzed.
    if (test.currentRetry() < test.retries()) return;

    let screenshotPath;
    // The page is captured as the failure left it: there is nothing to assert first.
    // eslint-disable-next-line cypress/assertion-before-screenshot
    cy.screenshot("ai-analysis", {
      capture: "viewport",
      log: false,
      onAfterScreenshot: (_$el, props) => {
        screenshotPath = props.path;
      },
    });
    cy.document({ log: false }).then((doc) => {
      const context = {
        testTitle: test.titlePath().join(" › "),
        specPath: Cypress.spec.relative,
        error: errorText(test.err),
        url: doc.location.href,
        dom: cleanDom(doc),
        screenshotPath,
      };
      // Claude can take a while on hard failures: generous timeout for this task only.
      cy.task("analyzeFailure", context, { timeout: 300000, log: false }).then((result) => {
        if (result) attachAnalysis(result);
      });
    });
  });
};
