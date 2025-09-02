/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true, // for your scripts/
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module", // important for import/export
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint"],
  extends: ["standard", "plugin:import/recommended"],
  rules: {
    "no-unused-vars": "warn",
    semi: ["error", "always"],
  },
  overrides: [
    {
      files: ["scripts/*.js"],
      parserOptions: {
        sourceType: "module", // allow ES modules in scripts
      },
      env: {
        node: true,
        browser: false,
      },
      rules: {
        // optionally relax rules for build scripts
        "no-console": "off",
      },
    },
  ],
};
