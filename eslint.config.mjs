import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React Compiler is enabled in eslint-config-next; many popular libraries
      // (TanStack Table, React Hook Form) intentionally return function values.
      // The compiler will skip memoization safely; we don't want noisy warnings.
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
