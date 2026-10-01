const transforms = {
  uppercase: (value) => value.toUpperCase(),
  lowercase: (value) => value.toLowerCase(),
};

/**
 * Fixtures never contain real credentials: they reference them as `{adminPassword}` or
 * `{adminPassword|uppercase}`, resolved at runtime with the values from cy.env().
 */
export const resolveTemplate = (template, values) =>
  template.replace(/\{(\w+)(?:\|(\w+))?\}/g, (_, key, transform) => {
    const value = values[key];
    return transform ? transforms[transform](value) : value;
  });
