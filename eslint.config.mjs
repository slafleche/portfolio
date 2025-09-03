// eslint.config.mjs
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
    },

    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },

  {
    ignores: ["node_modules/*", "dist/*", "build/*"],
  },
];
