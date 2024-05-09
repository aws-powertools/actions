/**
 * Base class for all reports
 */
export class BaseReport {
    /**
     * Constructs a BaseReport instance.
     * @param {Object} [options={}] - Options object.
     * @param {Logger} [options.logger] - A Logger instance.
     * @param {GitHub} [options.github] - A GitHub client instance.
     * @param {GitHubActions} [options.actions] - A GitHub Actions client instance.
     */
    constructor(options?: {
        logger?: Logger;
        github?: GitHub;
        actions?: GitHubActions;
    });
    actions: GitHubActions;
    logger: Logger;
    github: GitHub;
    /**
     * Builds a report.
     * @returns {Promise<string>} The built report in GitHub Markdown format.
     */
    build(): Promise<string>;
    /**
     * Creates a report issue on GitHub.
     * @param {Object} [options={}] - Options object.
     * @param {string} [options.report] - A previously built report to use; it creates one otherwise.
     * @returns {Promise<z.infer<typeof issueSchema>>} The created or updated report issue.
     */
    create(options?: {
        report?: string;
    }): Promise<z.infer<typeof issueSchema>>;
}
import { GitHubActions } from "@aws-powertools-actions/github";
import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub } from "@aws-powertools-actions/github";
import { z } from "zod";
import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
//# sourceMappingURL=base.d.mts.map