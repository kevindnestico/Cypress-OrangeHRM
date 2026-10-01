/**
 * Unit tests for the failure analyzer, with a fake Anthropic client (no API calls).
 * Run with `npm run test:unit`.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { describe, it } = require("node:test");
const Anthropic = require("@anthropic-ai/sdk");

const { FailureAnalyzer, buildContent, toMarkdown } = require("./failureAnalyzer");
const { SYSTEM_PROMPT } = require("./prompts");

const analysis = {
  category: "locator_changed",
  summary: "The Username label was renamed",
  root_cause: "Form.field('Username') finds no label; the DOM shows 'User Name'.",
  evidence: ["Expected to find content: '/^\\s*Username\\s*$/'", "<label>User Name</label>"],
  suggested_fix: "Update the label used by UserFormPage.fill().",
  confidence: "high",
};

const context = {
  testTitle: "Admin › User Management › creates a user from the UI",
  specPath: "cypress/e2e/admin/user-management.cy.js",
  error: "AssertionError: Timed out retrying after 10000ms",
  url: "https://opensource-demo.orangehrmlive.com/web/index.php/admin/saveSystemUser",
  dom: "<body><label>User Name</label></body>",
};

const silentLogger = { log() {}, warn() {} };

const fakeClient = (respond) => {
  const calls = [];
  return {
    calls,
    beta: {
      messages: {
        parse: async (params) => {
          calls.push(params);
          return respond(params);
        },
      },
    },
  };
};

const okResponse = () => ({
  stop_reason: "end_turn",
  parsed_output: analysis,
  usage: { input_tokens: 1200, cache_read_input_tokens: 900, output_tokens: 300 },
});

const analyzerWith = (client, options = {}) =>
  new FailureAnalyzer({ client, maxAnalyses: 10, logger: silentLogger, ...options });

describe("FailureAnalyzer", () => {
  it("sends a cached system prompt, effort, fallbacks and the failure context", async () => {
    const client = fakeClient(okResponse);
    const result = await analyzerWith(client, { model: "claude-opus-5-5", effort: "high" }).analyze(
      context,
    );

    assert.deepEqual(result, analysis);
    const [params] = client.calls;
    assert.equal(params.model, "claude-opus-5-5");
    assert.equal(params.system, SYSTEM_PROMPT);
    assert.deepEqual(params.cache_control, { type: "ephemeral" });
    assert.equal(params.output_config.effort, "high");
    assert.ok(params.output_config.format, "structured output format");
    assert.equal(params.fallbacks, "default");
    assert.deepEqual(params.betas, ["server-side-fallback-2026-07-01"]);
    const text = params.messages[0].content.at(-1).text;
    assert.match(text, /<test_title>\nAdmin › User Management/);
    assert.match(text, /<dom_snapshot>\n<body><label>User Name<\/label><\/body>/);
    assert.match(text, /describe\("Admin › User Management"/, "includes the spec source");
  });

  it("keeps the system prompt free of per-run data so it can be cached", () => {
    assert.doesNotMatch(SYSTEM_PROMPT, /\d{4}-\d{2}-\d{2}T/);
    assert.match(SYSTEM_PROMPT, /timing_flakiness/);
    assert.match(SYSTEM_PROMPT, /color-contrast/, "includes the a11y known issues");
  });

  it("stops after the per-run budget", async () => {
    const client = fakeClient(okResponse);
    const analyzer = analyzerWith(client, { maxAnalyses: 2 });

    await analyzer.analyze(context);
    await analyzer.analyze(context);
    const third = await analyzer.analyze(context);

    assert.equal(third, null);
    assert.equal(client.calls.length, 2);
  });

  it("returns null when Claude declines", async () => {
    const client = fakeClient(() => ({ ...okResponse(), stop_reason: "refusal" }));

    assert.equal(await analyzerWith(client).analyze(context), null);
  });

  it("disables itself on invalid credentials", async () => {
    const client = fakeClient(() => {
      throw new Anthropic.AuthenticationError(401, {}, "invalid x-api-key", new Headers());
    });
    const analyzer = analyzerWith(client);

    assert.equal(await analyzer.analyze(context), null);
    assert.match(analyzer.disabledReason, /ANTHROPIC_API_KEY/);
    assert.equal(analyzer.canAnalyze(), false);
  });

  it("stays enabled after a rate limit", async () => {
    const client = fakeClient(() => {
      throw new Anthropic.RateLimitError(429, {}, "rate limited", new Headers());
    });
    const analyzer = analyzerWith(client);

    assert.equal(await analyzer.analyze(context), null);
    assert.equal(analyzer.disabledReason, null);
    assert.equal(analyzer.canAnalyze(), true);
  });

  it("never throws, whatever the client does", async () => {
    const client = fakeClient(() => {
      throw new TypeError("boom");
    });
    const analyzer = analyzerWith(client);

    assert.equal(await analyzer.analyze(context), null);
    assert.match(analyzer.disabledReason, /TypeError: boom/);
  });
});

describe("buildContent", () => {
  it("adds the screenshot as an image before the text", () => {
    const screenshotPath = path.join(os.tmpdir(), `ai-analysis-${process.pid}.png`);
    fs.writeFileSync(screenshotPath, Buffer.from("fake-png"));
    try {
      const [image, text] = buildContent({ ...context, screenshotPath });
      assert.equal(image.type, "image");
      assert.equal(image.source.media_type, "image/png");
      assert.equal(image.source.data, Buffer.from("fake-png").toString("base64"));
      assert.equal(text.type, "text");
    } finally {
      fs.rmSync(screenshotPath);
    }
  });

  it("works without screenshot, spec file or DOM", () => {
    const content = buildContent({ testTitle: "t", specPath: "missing.cy.js", error: "e" });

    assert.equal(content.length, 1);
    assert.match(content[0].text, /<spec_source>\n\(not available\)/);
    assert.match(content[0].text, /<page_url>\n\(no page\)/);
  });
});

describe("toMarkdown", () => {
  it("renders every field", () => {
    const markdown = toMarkdown(analysis);

    assert.match(markdown, /^## locator_changed \(high confidence\)/);
    assert.match(markdown, /- <label>User Name<\/label>/);
    assert.match(markdown, /### Suggested fix\nUpdate the label/);
  });
});
