import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// Next 16 removed `next lint`, and eslint-config-next@16 ships native
// flat-config arrays, so `npm run lint` runs the ESLint CLI over the same
// directories `next lint` covered (`app components lib`; repo has no pages/
// or src/). The deleted .eslintrc.json extended both "next/core-web-vitals"
// and "next/typescript": coreWebVitals embeds base `next` + TS parser wiring,
// nextTypescript adds the typescript-eslint recommended ruleset — appended
// last to keep legacy override order. Global ignores port the deleted
// .eslintignore one-for-one.
export default [
  {
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
];
