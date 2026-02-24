// eslint.config.js
import antfu from "@antfu/eslint-config";

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  isInEditor: false,
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  ignores: [
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/lib/",
    "**/vendor/",
    "**/scripts/",
    "**/lixo/",
    "**/tmp/",
    "**/*.cjs",
    "**/vite.config.ts",
    "**/tsup.config.ts",
    "**/jest.config.ts",
    "**/jest.setup.ts",
    "**/uno.config.ts",
    "**/CoreVault.sparsebundle/**",
    "**/*.md",
    // "eslint.config.js",
  ],
}, {
  rules: {
    // Desabilita type-checking estrito (ativa depois progressivamente)
    "ts/strict-boolean-expressions": "off",
    "ts/no-unsafe-call": "off",
    "ts/no-unsafe-member-access": "off",
    "ts/no-unsafe-assignment": "off",
    "ts/no-unsafe-argument": "off",
    "ts/no-unsafe-return": "off",

    // Compatibilidade com codigo anterior
    "jsonc/sort-keys": "off",
    "ts/method-signature-style": "off",
    "no-console": "off",
    "style/arrow-parens": ["error", "always"],
    "ts/consistent-type-imports": "off",
    "import/consistent-type-specifier-style": "off",
    "ts/consistent-type-definitions": "off",
    "perfectionist/sort-named-imports": "off",

    // Formatação
    "style/no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
    "style/padded-blocks": "off",
    "perfectionist/sort-imports": "error",
    "unicorn/prefer-number-properties": "error",

    // imports / exports
    "unused-imports/no-unused-imports": "error",
    "perfectionist/sort-exports": ["error", {
      type: "alphabetical",
      order: "asc",
    }],

  },
});
