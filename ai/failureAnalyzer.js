/**
 * Root-cause analysis of failed tests with Claude.
 *
 * Enabled with AI_ANALYSIS=true (and Anthropic credentials). For each failed test the support file
 * captures a FailureContext right after the failure and sends it to the `analyzeFailure` task; this
 * module asks Claude for a structured FailureAnalysis that is attached to the Allure report.
 */
const fs = require("node:fs");
const Anthropic = require("@anthropic-ai/sdk");
const { betaZodOutputFormat } = require("@anthropic-ai/sdk/helpers/beta/zod");
const { z } = require("zod");

const { SYSTEM_PROMPT } = require("./prompts");

const DEFAULT_MODEL = "claude-opus-5-5";

const FailureAnalysis = z.object({
  category: z.enum([
    "product_bug",
    "test_bug",
    "locator_changed",
    "timing_flakiness",
    "environment",
    "unknown",
  ]),
  summary: z.string().describe("One sentence a reviewer can read in the report list"),
  root_cause: z.string().describe("What went wrong and why, grounded in the evidence"),
  evidence: z
    .array(z.string())
    .describe("Quotes from the error, DOM snapshot or spec source that support the diagnosis"),
  suggested_fix: z
    .string()
    .describe("Concrete change to make (file, page object method, locator, assertion or wait)"),
  confidence: z.enum(["low", "medium", "high"]),
});

const toMarkdown = (analysis) =>
  [
    `## ${analysis.category} (${analysis.confidence} confidence)`,
    `**Summary:** ${analysis.summary}`,
    `### Root cause\n${analysis.root_cause}`,
    `### Evidence\n${analysis.evidence.map((item) => `- ${item}`).join("\n")}`,
    `### Suggested fix\n${analysis.suggested_fix}`,
  ].join("\n\n");

/**
 * @typedef {object} FailureContext
 * @property {string} testTitle    Full title path of the test
 * @property {string} specPath     Spec file, relative to the project root
 * @property {string} error        Error message, code frame and stack
 * @property {string} [url]        Page URL at the moment of failure
 * @property {string} [dom]        Cleaned DOM snapshot of the page
 * @property {string} [screenshotPath]  Failure screenshot (PNG)
 */

/**
 * Sends failure contexts to Claude, with a per-run budget.
 *
 * Never throws: any API problem is logged and returned as `null`, so the analysis can't hide or
 * alter the real test result.
 */
class FailureAnalyzer {
  constructor({ client, model, effort, maxAnalyses, logger = console } = {}) {
    this.client = client;
    this.model = model || process.env.AI_ANALYSIS_MODEL || DEFAULT_MODEL;
    this.effort = effort || process.env.AI_ANALYSIS_EFFORT || "medium";
    this.maxAnalyses = maxAnalyses ?? Number(process.env.AI_ANALYSIS_MAX || 10);
    this.logger = logger;
    this.analysesDone = 0;
    this.disabledReason = null;
  }

  canAnalyze() {
    return this.disabledReason === null && this.analysesDone < this.maxAnalyses;
  }

  /** @param {FailureContext} context */
  async analyze(context) {
    if (!this.canAnalyze()) return null;
    this.analysesDone += 1;

    let response;
    try {
      this.client ??= new Anthropic.default();
      response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
        output_config: { effort: this.effort, format: betaZodOutputFormat(FailureAnalysis) },
        // On a safety-classifier decline, re-run on Anthropic's recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content: buildContent(context) }],
      });
    } catch (error) {
      return this.#handleError(error, context);
    }

    if (response.stop_reason === "refusal") {
      this.logger.warn(`[ai] Analysis declined for "${context.testTitle}"`);
      return null;
    }
    this.logger.log(
      `[ai] "${context.testTitle}": ${response.usage.input_tokens} input ` +
        `(${response.usage.cache_read_input_tokens ?? 0} cached), ` +
        `${response.usage.output_tokens} output tokens`,
    );
    return response.parsed_output;
  }

  #handleError(error, context) {
    if (error instanceof Anthropic.AuthenticationError) {
      this.disabledReason = "No valid Anthropic credentials (set ANTHROPIC_API_KEY)";
    } else if (error instanceof Anthropic.RateLimitError) {
      this.logger.warn(`[ai] Rate limited while analyzing "${context.testTitle}"`);
      return null;
    } else if (error instanceof Anthropic.APIConnectionError) {
      this.logger.warn(`[ai] Could not reach the API for "${context.testTitle}": ${error.message}`);
      return null;
    } else if (error instanceof Anthropic.APIError) {
      this.logger.warn(
        `[ai] Analysis failed for "${context.testTitle}": HTTP ${error.status} ${error.message}`,
      );
      return null;
    } else {
      // e.g. no credentials configured at all: reporting must never break the run.
      this.disabledReason = `${error.name}: ${error.message}`;
    }
    this.logger.warn(`[ai] Analysis disabled: ${this.disabledReason}`);
    return null;
  }
}

/** @param {FailureContext} context */
function buildContent(context) {
  const content = [];
  if (context.screenshotPath && fs.existsSync(context.screenshotPath)) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: fs.readFileSync(context.screenshotPath).toString("base64"),
      },
    });
  }
  const specSource = fs.existsSync(context.specPath)
    ? fs.readFileSync(context.specPath, "utf8")
    : "(not available)";
  const sections = {
    test_title: context.testTitle,
    spec_path: context.specPath,
    spec_source: specSource,
    error: context.error,
    page_url: context.url || "(no page)",
    dom_snapshot: context.dom || "(not available)",
  };
  const text = Object.entries(sections)
    .map(([name, value]) => `<${name}>\n${value}\n</${name}>`)
    .join("\n\n");
  content.push({ type: "text", text: `${text}\n\nDiagnose this failure.` });
  return content;
}

module.exports = { FailureAnalyzer, FailureAnalysis, buildContent, toMarkdown, DEFAULT_MODEL };
