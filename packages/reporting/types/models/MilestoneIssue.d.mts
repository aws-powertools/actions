/**
 * Represents an issue for a bug for reporting.
 */
export class MilestoneIssue extends Issue {
    /**
     * Creates a new instance of the MilestoneIssue class.
     * @param {z.infer<typeof issueSchema>} issue - A GitHub issue.
     */
    constructor(issue: z.infer<any>);
    /**
     * The total number of comments.
     * @type {number}
     */
    assignee: number;
}
import { Issue } from "./Issue.mjs";
//# sourceMappingURL=MilestoneIssue.d.mts.map