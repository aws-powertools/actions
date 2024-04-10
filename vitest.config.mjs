import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/*/tests/**/*.test.{js,mjs}"],
		testTimeout: 10000,
	},
});
