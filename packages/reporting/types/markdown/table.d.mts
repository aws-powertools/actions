/**
 * A class for building a markdown table from data.
 */
export class Table {
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
    static fromKeyValueObjects(data: any[]): string;
    headings: any[];
    rows: any[];
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
    addHeadings(headings: string[]): Table;
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
    addRow(row: any[]): Table;
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
    build(): string;
    #private;
}
//# sourceMappingURL=table.d.mts.map