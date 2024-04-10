/**
 * Generates a markdown table from an array of key:value object.
 *
 * This function takes an array of objects as input and generates a markdown table with the keys as column headings and the values as rows.
 *
 * @param {Array<Object>} data - The data to generate the table from.
 * @returns {Object} An object containing the formatted table components.
 *   - heading: The formatted column headings of the table.
 *   - dashes: The formatted dashed line separating the headings from the rows.
 *   - rows: The formatted rows of the table.
 *
 * @example
 * const data = [
 *   { name: 'John', age: 30, city: 'New York' },
 *   { name: 'Jane', age: 25, city: 'London' },
 *   { name: 'Bob', age: 35, city: 'Paris' }
 * ];
 *
 * const table = buildMarkdownTable(data);
 * console.log(table.heading); // '| name | age | city |'
 * console.log(table.dashes); // '| ---- | --- | ---- |'
 * console.log(table.rows); // '| John | 30  | New York |'
 */
export function buildMarkdownTable(data) {
	const keys = Object.keys(data[0]);

	if (keys.length === 0) {
		return "Not available";
	}

	const formatted_headings = `${keys.join(" | ")}`;
	const keyLength = keys[0]?.length || 0;
	const dashes = keys.map(() => `${"-".repeat(keyLength)} |`).join(" ");

	const values = data.map((issues) => Object.values(issues));
	const rows = values.map((row) => `${row.join(" | ")} |`).join("\n");

	return `${formatted_headings}
${dashes}
${rows}`;
}
