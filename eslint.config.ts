// eslint.config.mjs

import js from "@eslint/js";
import nextConfig from "eslint-config-next"; // Renamed for clarity
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // 1. Put ignores at the top for better performance.
  //    Using `**` ensures all sub-folders and files are ignored.
  {
    ignores: [".next/**", "node_modules/**"],
  },

  // 2. ESLint's core recommended rules.
  js.configs.recommended,

  // 3. The entire Next.js config.
  //    This single object includes everything you need for Next.js.
  nextConfig,

  // 4. Custom configurations (optional).
  //    The Next.js config likely handles globals, but being explicit is fine.
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];

export default config;
