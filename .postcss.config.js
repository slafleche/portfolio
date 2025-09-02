module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  extends: ["standard", "plugin:import/recommended"],
  plugins: ["@typescript-eslint"],
  rules: {
    // example rules you can customize
    "no-unused-vars": "warn",
    semi: ["error", "always"],
  },
};
