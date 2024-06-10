/**
 * Represents an unordered list in Markdown format.
 *
 * @example
 * const list = new UnorderedList();
 * list.addItem('do-not-merge');
 * list.addItem('blocked');
 * list.addItem('need-customer-feedback');
 * console.log(list.build());
 * // Output:
 * // * do-not-merge
 * // * blocked
 * // * need-customer-feedback
 */
export class UnorderedList {
    /**
     * Creates an unordered list from an array of items.
     * @param {string[]} items - The array of items to include in the list.
     * @returns {string} The unordered list in Markdown format.
     *
     * @example Create list of items from an array of labels
     * const list = UnorderedList.fromArray(['feature-request', 'documentation', 'internal']);
     * console.log(list);
     * // Output:
     * // * Apple
     * // * Banana
     * // * Cherry
     */
    static fromArray(items: string[]): string;
    items: any[];
    /**
     * Adds an item to the unordered list.
     * @param {string} item - The item to add to the list.
     * @returns {UnorderedList} The instance of the UnorderedList class.
     */
    addItem(item: string): UnorderedList;
    /**
     * Builds the unordered list in Markdown format.
     * @returns {string} The unordered list in Markdown format.
     */
    build(): string;
}
//# sourceMappingURL=lists.d.mts.map