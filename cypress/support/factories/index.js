import { faker } from "@faker-js/faker";

/**
 * Test data builders. Every record gets a unique token so parallel runs (and other people using
 * the public demo) never collide, and every field can be overridden per test.
 */
export const uniqueToken = () =>
  `${Date.now().toString(36).slice(-5)}${faker.string.alphanumeric(3)}`.toLowerCase();

export const buildEmployee = (overrides = {}) => {
  const token = uniqueToken();
  return {
    firstName: faker.person.firstName().replace(/[^A-Za-z]/g, ""),
    // The unique token in the middle name makes the employee easy to find in autocompletes.
    middleName: `QA${token}`,
    lastName: faker.person.lastName().replace(/[^A-Za-z]/g, ""),
    employeeId: `qa${token}`.slice(0, 10),
    ...overrides,
  };
};

export const fullName = ({ firstName, middleName, lastName }) =>
  [firstName, middleName, lastName].filter(Boolean).join(" ");

/** OrangeHRM requires 7+ characters with at least one number and one lowercase letter. */
export const buildPassword = () => `Qa!${faker.string.alphanumeric(8)}7x`;

export const buildUser = (overrides = {}) => ({
  username: `qa.user.${uniqueToken()}`,
  password: buildPassword(),
  role: "ESS",
  status: "Enabled",
  ...overrides,
});
