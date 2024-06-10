import { describe, expect, test } from "vitest";
import { Table } from "../../src/markdown/index.mjs";

describe("markdown builders", () => {
	describe("markdown table", () => {
		test("build markdown table string from object", () => {
			// GIVEN
			const data = [
				{ issue: "1", description: "test" },
				{ issue: "2", description: "test two" },
			];

			const expectedTable = `
| issue       | description |
| ----------- | ----------- |
| 1           | test        |
| 2           | test two    |
            `.trim();

			// WHEN
			const table = Table.fromKeyValueObjects(data);

			// THEN
			expect(table).toBe(expectedTable);
		});
	});
});
