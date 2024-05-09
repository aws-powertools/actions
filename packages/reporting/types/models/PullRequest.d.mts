/**
 * Represents a base pull request with shared attributes for consistent reporting.
 */
export class PullRequest {
    /**
     * Creates a new instance of the PullRequest class.
     * @param {z.infer<typeof pullRequestSchema>} pr - A GitHub Pull Request.
     */
    constructor(pr: z.infer<typeof pullRequestSchema>);
    /**
     * The pr title with a link to itself.
     * @type {string}
     */
    title: string;
    /**
     * The PR creation date, formatted as a long date.
     * @type {string}
     */
    created_at: string;
    /**
     * The total number of days since last update.
     * @type {string}
     */
    last_update: string;
    /**
     * The login of each person requested to review this PR.
     * @type {string}
     */
    reviewers: string;
    /**
     * The labels associated with the PR, formatted as a string with each label enclosed in backticks (`bug`).
     * @type {string}
     */
    labels: string;
}
import { z } from "zod";
import { pullRequestSchema } from "@aws-powertools-actions/github/schemas/pull-requests";
//# sourceMappingURL=PullRequest.d.mts.map