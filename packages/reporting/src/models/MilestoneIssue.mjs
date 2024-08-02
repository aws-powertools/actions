import { Issue } from "./Issue.mjs";

/**
 * Represents an issue for a bug for reporting.
 */
export class MilestoneIssue extends Issue {
	/**
	 * Creates a new instance of the MilestoneIssue class.
	 * @param {z.infer<typeof issueSchema>} issue - A GitHub issue.
	 */
	constructor(issue) {
		super(issue);
		/**
		 * The total number of comments.
		 * @type {number}
		 */
		this.assignee = issue.assignee?.login || "No assignee";

		// biome-ignore lint/performance/noDelete: This is a public API and we want to expose this property.
		delete this.created_at;
	}
}
