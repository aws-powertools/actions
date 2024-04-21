import { z } from "zod";
import { formatISOtoLongDate } from "../../date_utils/src/formatter.mjs";
import { issueSchema } from "../../schemas/src/issue_schema.mjs";

/**
 * Represents a top most commented issue for reporting.
 */
export class TopMostCommented {
	/**
	 * Creates a new instance of the TopMostCommented class.
	 * @param {z.infer<typeof issueSchema>} issue - A GitHub issue.
	 */
	constructor(issue) {
		/**
		 * The issue title with a link to itself.
		 * @type {string}
		 */
		this.title = `[${issue.title}](${issue.html_url})`;

		/**
		 * The issue creation date, formatted as a long date.
		 * @type {string}
		 */
		this.created_at = formatISOtoLongDate(issue.created_at);

		/**
		 * The total number of comments.
		 * @type {number}
		 */
		this.comment_count = issue.comments;

		/**
		 * The labels associated with the issue, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
