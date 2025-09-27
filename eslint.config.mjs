import js from "@eslint/js";
import nextPlugin from "eslint-config-next";
import globals from "globals";

const config = [
  js.configs.recommended,
  nextPlugin.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  { ignores: [".next/", "node_modules/"] },
];

export default config;
