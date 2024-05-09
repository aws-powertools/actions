export class BaseTemplate {
    constructor(options?: {});
    /**
     * If running on GitHub Actions, the footer includes a link to the workflow run URL.
     * @function footer
     * @returns {string} The footer content with optional GitHub Actions workflow run URL.
     */
    get footer(): string;
    build(): string;
    #private;
}
//# sourceMappingURL=base.d.mts.map