import { expect, test } from "vitest";
import { buildMarkdownTable } from "../../src/builder.mjs";

test("build markdown table string from object", () => {
	const data = [
		{ issue: "1", description: "test" },
		{ issue: "2", description: "test two" },
	];

	const table = `
issue | description
----- | ----- |
1 | test |
2 | test two |
	`.trim();

	expect(buildMarkdownTable(data)).toBe(table);
});
