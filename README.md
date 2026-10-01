# OrangeHRM E2E Automation — Cypress + JavaScript

[![E2E Tests](https://github.com/kevindnestico/Cypress-OrangeHRM/actions/workflows/e2e.yml/badge.svg)](https://github.com/kevindnestico/Cypress-OrangeHRM/actions/workflows/e2e.yml)
[![Allure Report](https://img.shields.io/badge/Allure-report-orange?logo=qameta)](https://kevindnestico.github.io/Cypress-OrangeHRM/)
![Cypress](https://img.shields.io/badge/cypress-16-69D3A7?logo=cypress)
![Node](https://img.shields.io/badge/node-22%2B-339933?logo=node.js)
[![ESLint](https://img.shields.io/badge/lint-eslint-4B32C3?logo=eslint)](https://eslint.org/)

End-to-end test framework for the [OrangeHRM open-source demo](https://opensource-demo.orangehrmlive.com/)
built with **Cypress 16** and **JavaScript**, using the **Page Object Model** with reusable UI components,
**API-driven test data** and an **Allure** report published to GitHub Pages from **GitHub Actions**
(Chrome and Firefox).

**67 tests** covering login, session security, role-based access, navigation, user management, employee
management (PIM), network behavior and accessibility.

---

## Highlights

|                                        |                                                                                                                                                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 **Login once with `cy.session`**    | Login is programmatic (CSRF token + form POST through `cy.request`), cached with `cy.session` across tests and specs, validated with a cheap API call and recreated automatically if the server expires it. Only the login specs use the login form. |
| 🧩 **Page Objects + components**       | Pages extend a `BasePage` that owns the shared layout (`SideMenu`, `TopBar`, `Toast`). Forms, tables and confirm dialogs are reusable components used by every page.                                                                                 |
| 🏷️ **Label-based locators**            | OrangeHRM has no ids or `data-test` attributes, so fields are located by their visible label (like `getByLabel` in Playwright), never by `:nth-child` chains.                                                                                        |
| ⚡ **API-driven preconditions**        | Employees and users that a test needs are created through OrangeHRM's REST API, so each test only drives the UI it is actually testing.                                                                                                              |
| 🧹 **Automatic cleanup**               | Every record created by a test (through the API or the UI) is registered and deleted in a global `afterEach`, even when the test fails. The shared public demo is left as it was found.                                                              |
| 🎲 **Unique test data**                | Factories built on Faker give every record a unique token, so parallel CI jobs and other demo users never collide.                                                                                                                                   |
| 📄 **Data-driven tests from fixtures** | Login cases (incl. SQL/script injection, case sensitivity, whitespace), navigation map, dashboard widgets and messages live in JSON fixtures. Fixtures never contain credentials: they reference them as `{adminPassword}` placeholders.             |
| 🌐 **Network control**                 | `cy.intercept` waits for real API calls instead of fixed sleeps, asserts request parameters, and stubs empty lists, slow responses and server errors.                                                                                                |
| ♿ **Accessibility**                   | axe-core scans on the main pages (injected with a custom command, no wrapper plugin). New critical/serious violations fail the build; OrangeHRM's current defects are documented in a known-issues fixture.                                          |
| 🔑 **Secrets out of the bundle**       | Credentials come from `.env` / CI secrets and are read with `cy.env()`, so they are never bundled into the spec files or shown in the command log.                                                                                                   |
| 📊 **Allure report**                   | Allure 3 report with steps, screenshots, axe results and trend history, published to GitHub Pages.                                                                                                                                                   |

## Tech stack

Cypress 16 · JavaScript (ES modules) · Allure 3 (`allure-cypress`) · `@cypress/grep` · axe-core · Faker ·
dotenv · ESLint 10 (`eslint-plugin-cypress`) · Prettier · GitHub Actions

## Project structure

```
├── cypress/
│   ├── e2e/                    # Specs by feature
│   │   ├── a11y/               #   axe-core scans
│   │   ├── admin/              #   User Management (CRUD, validation)
│   │   ├── auth/               #   Login, session, logout, disabled accounts
│   │   ├── dashboard/          #   Widgets, side menu, ESS role restrictions
│   │   ├── network/            #   Stubs, spies, slow and failing APIs
│   │   └── pim/                #   Employees (add, search, validation, delete)
│   ├── fixtures/               # Login cases, messages, navigation map, a11y known issues, API stubs
│   ├── pages/                  # Page Objects
│   │   ├── components/         #   Form, Table, SideMenu, TopBar, Toast, ConfirmDialog
│   │   ├── admin/  pim/        #   Pages per module
│   │   └── BasePage.js
│   └── support/
│       ├── api/                # REST API client + cleanup registry
│       ├── commands/           # cy.login / cy.loginAsAdmin (cy.session), axe commands
│       ├── factories/          # Faker-based builders for employees and users
│       ├── utils/              # Fixture placeholder resolver
│       ├── routes.js           # App routes and API base path
│       └── e2e.js              # Allure, grep, global cleanup hook
├── .github/workflows/e2e.yml   # CI: lint → tests (Chrome, Firefox) → Allure report on GitHub Pages
├── cypress.config.js
├── allurerc.mjs
└── eslint.config.mjs
```

## Test coverage

| Area               | Spec                          | What it checks                                                                                                                                                                                                     |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login              | `auth/login.cy.js`            | Valid login (button and Enter key), case-insensitive usernames, 8 data-driven invalid credential cases, client-side required validation without a server call, password masking, forgot password                   |
| Session & security | `auth/session.cy.js`          | Protected routes redirect to login, HttpOnly session cookie, reload keeps the session, logout + back button, disabled accounts cannot log in                                                                       |
| Navigation & roles | `dashboard/navigation.cy.js`  | Dashboard widgets, full side menu, every menu item opens its module, menu search, re-authentication for Maintenance, ESS users see only self-service modules and get blocked on admin URLs and admin API endpoints |
| User Management    | `admin/user-management.cy.js` | Create a user from the UI and log in with it, required fields, password confirmation, duplicate username, edit status, delete and cancel delete                                                                    |
| Employees (PIM)    | `pim/employee.cy.js`          | Add an employee, required names, duplicate Employee Id, search by name (autocomplete) and id, delete                                                                                                               |
| Network            | `network/network.cy.js`       | No failed API calls on the dashboard, search query parameters, stubbed empty list, slow response loader, stubbed 500                                                                                               |
| Accessibility      | `a11y/accessibility.cy.js`    | axe-core on login, dashboard, system users, add user and employee list                                                                                                                                             |

## Getting started

Requirements: Node.js 22+ and Chrome or Firefox.

```bash
git clone https://github.com/kevindnestico/Cypress-OrangeHRM.git
```

```bash
cd Cypress-OrangeHRM && npm ci
```

Optional: `cp .env.example .env` to point to another OrangeHRM instance or use other credentials. Without a
`.env` file the public demo and its published credentials are used.

## Running tests

| Command                                           | What it does                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run cy:open`                                 | Interactive Cypress runner                                                       |
| `npm test`                                        | All specs, headless (Electron)                                                   |
| `npm run test:chrome` / `npm run test:firefox`    | All specs in a specific browser                                                  |
| `npm run test:smoke`                              | Only tests tagged `@smoke`                                                       |
| `npx cypress run --expose grepTags=@admin`        | Any tag: `@smoke`, `@auth`, `@navigation`, `@admin`, `@pim`, `@network`, `@a11y` |
| `npx cypress run --expose grep="logs out",burn=5` | Repeat a test 5 times to check it is not flaky                                   |
| `npm run lint` / `npm run format:check`           | ESLint and Prettier                                                              |

## Allure report

Every run writes results to `allure-results/`.

```bash
npm run report
```

This generates the report in `allure-report/` and opens it. Each test includes its Cypress steps, the
browser as a parameter, screenshots on failure, and the full axe-core output for the accessibility tests.

CI merges the results of all browsers, keeps the trend history and publishes the report to
**https://kevindnestico.github.io/Cypress-OrangeHRM/**.

## CI/CD

[`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) runs on every push to `main`, on pull requests, on a
weekday schedule (to catch changes in the demo site) and on demand:

1. **Lint**: ESLint and Prettier.
2. **Tests**: Chrome and Firefox in parallel with `cypress-io/github-action`, one retry for the public demo's
   network hiccups. Screenshots are uploaded for failures.
3. **Report** (on `main`): merges the Allure results, restores the history and publishes to GitHub Pages.

Credentials can be overridden with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` repository secrets.

## Design decisions

- **Why programmatic login?** Typing into the login form in every test is slow and makes every spec depend on
  the login UI. The login form has its own spec; everything else starts from a cached session.
- **Why create test data through the API?** A user-management test should not fail because the Add Employee
  form changed. The API is also the only reliable way to clean up on a public demo that other people use at the
  same time.
- **Why is the cleanup registry stored on the `Cypress` object?** Cypress bundles the support file and each spec
  separately, so a module-level variable exists twice. The first version of the cleanup silently left data
  behind because of this.
- **Why does `shouldBeLoaded()` wait for the module header and the loaders?** OrangeHRM is a Vue SPA: the URL
  changes before the view is rendered and lists load asynchronously.
- **Why known issues instead of disabling axe rules?** The report keeps showing every current defect, and any
  new violation fails the build.

## Issues found in OrangeHRM

- **Uncaught `TypeError` after logout**: going back after logging out (or leaving the dashboard while its widgets
  are loading) makes the widget requests return 401 and the app throws
  `Cannot read properties of undefined (reading 'response')`. The test ignores only that error, in that test.
- **Pre-filled Employee Id can already be taken**: Add Employee proposes the next free id when the page loads, so
  if someone else saves an employee first the form fails with "Employee Id already exists".
- **Accessibility**: buttons without accessible names (icon buttons), inputs without associated labels,
  insufficient color contrast and invalid list markup — see
  [`a11y-known-issues.json`](cypress/fixtures/a11y-known-issues.json).
