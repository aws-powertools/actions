import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
import { z } from "zod";
import { Issue } from "./Issue.mjs";

/**
 * Represents a highly debated issue for reporting.
 */
export class HighlyCommentedIssue extends Issue {
	/**
	 * Creates a new instance of the HighlyCommentedIssue class.
	 * @param {z.infer<typeof issueSchema>} issue - A GitHub issue.
	 */
	constructor(issue) {
		super(issue);
		/**
		 * The total number of comments.
		 * @type {number}
		 */
		this.comment_count = issue.comments;
	}
}
