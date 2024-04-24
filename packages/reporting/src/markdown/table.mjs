/**
 * A class for building a markdown table from data.
 */
export class Table {
    /**
     * Creates a new instance of the MarkdownTableBuilder class.
     */
    constructor() {
        this.headings = [];
        this.rows = [];
    }

    /**
     * Adds one or more headings to the table.
     * @param {string[]} headings - An array of headings to add to the table.
     * @returns {Table} The current instance of the MarkdownTableBuilder class.
     * @example
     * ```javascript
     * const table = new Table();
     * table.addHeadings(['Name', 'Age', 'City']);
     * ```
     */
    addHeadings(headings) {
        this.headings.push(...headings);
        return this;
    }

    /**
     * Adds a row to the table.
     * @param {any[]} row - An array of values to add as a row to the table.
     * @returns {Table} The current instance of the MarkdownTableBuilder class.
     * @example
     * ```javascript
     * const table = new Table();
     * table.addRow(['John', '30', 'New York']);
     * ```
     */
    addRow(row) {
        this.rows.push(row);
        return this;
    }

    /**
     * Builds a markdown table from an array of objects, where keys are headings and values are rows.
     * @param {Object[]} data - An array of objects to use as the data for the table.
     * @returns {string} A markdown table as a string.
     * @example
     * ```javascript
     * const data = [
     *   { name: 'John', age: 30, city: 'New York' },
     *   { name: 'Jane', age: 25, city: 'London' },
     *   { name: 'Bob', age: 35, city: 'Paris' }
     * ];
     * const table = new Table();
     * table.fromKeyValueObjects(data);
     * ```
     */
    static fromKeyValueObjects(data) {
        const table = new Table();

        if (data.length === 0) {
            return "Not available";
        }

        table.addHeadings(Object.keys(data[0]));

        for (const obj of data) {
            table.addRow(Object.values(obj))
        }

        return table.build();
    }

    /**
     * Builds the markdown table.
     * @returns {string} The markdown table.
     * @example
     * ```javascript
     * const table = new Table();
     * table
     *   .addHeadings(['Name', 'Age', 'City'])
     *   .addRow(['John', '30', 'New York'])
     *   .addRow(['Jane', '25', 'London'])
     *   .addRow(['Bob', '35', 'Paris']);
     * const markdown = table.build();
     * console.log(markdown);
     * ```
     * Output:
     * ```
     * | Name | Age | City |
     * | ---- | --- | ---- |
     * | John | 30  | New York |
     * | Jane | 25  | London |
     * | Bob  | 35  | Paris |
     * ```
     */
    build() {
        const maxColumnWidth = this.#getMaxColumnWidth();

        return `${this.#formatHeadings(maxColumnWidth)}
${this.#formatDashes(maxColumnWidth)}
${this.#formatRows(maxColumnWidth)}`
    }

    /**
     * Calculates the maximum width of all columns in the table.
     * @returns {number} The maximum column width.
     */
    #getMaxColumnWidth() {
        const headingWidths = this.headings.map(heading => heading.length);
        return Math.max(...headingWidths)
    }

    /**
     * Formats the headings of the table.
     * @param {number} maxColumnWidth - The maximum width of all columns.
     * @returns {string} The formatted headings.
     */
    #formatHeadings(maxColumnWidth) {
        return `| ${this.headings.map(heading => heading.padEnd(maxColumnWidth)).join(" | ")} |`;
    }

    /**
     * Formats the dashes separating the headings from the rows.
     * @param {number} maxColumnWidth - The maximum width of all columns.
     * @returns {string} The formatted dashes.
     * Output:
     * ```
     * | --------- | --------- | --------- |
     * ```
     */
    #formatDashes(maxColumnWidth) {
        const columnSeparators = this.headings.map(() => "-".repeat(maxColumnWidth));
        return `| ${columnSeparators.join(" | ")} |`;
    }

    /**
     * Formats the rows of the table.
     * @param {number} maxColumnWidth - The maximum width of all columns.
     * @returns {string} The formatted rows.
     */
    #formatRows(maxColumnWidth) {
        return this.rows.map(row => {
            const values = row.map(value => value.toString().padEnd(maxColumnWidth));
            return `| ${values.join(" | ")} |`;
        }).join("\n");
    }
}