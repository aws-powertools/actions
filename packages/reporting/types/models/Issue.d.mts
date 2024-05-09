/**
 * Represents a base issue with shared attributes for consistent reporting.
 */
export class Issue {
    /**
     * Creates a new instance of the Issue class.
     * @param {z.infer<typeof issueSchema>} issue - The issue object representing an issue.
     */
    constructor(issue: z.infer<typeof issueSchema>);
    /**
     * The title of the feature request, with a link to the issue.
     * @type {string}
     */
    title: string;
    /**
     * The issue creation date, formatted as a long date.
     * @type {string}
     */
    created_at: string;
    /**
     * The total number of days since last update.
     * @type {string}
     */
    last_update: string;
    /**
     * The labels associated with the feature request, formatted as a string with each label enclosed in backticks (`bug`).
     * @type {string}
     */
    labels: string;
}
import { z } from "zod";
import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
//# sourceMappingURL=Issue.d.mts.map