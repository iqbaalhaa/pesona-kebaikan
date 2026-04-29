import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	{
		files: ["**/*.{ts,tsx,js,jsx}"],
		ignores: ["src/generated/prisma/**", "src/generated/**", "prisma/migrations/**"],
		rules: {
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"react/no-unescaped-entities": "off",
			"@next/next/no-img-element": "off",
			"prefer-const": "warn",
		},
	},
	globalIgnores([
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
]);

export default eslintConfig;
