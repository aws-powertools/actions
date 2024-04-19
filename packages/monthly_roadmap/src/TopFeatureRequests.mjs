import { z } from "zod";
import { issueSchema } from "../../schemas/src/issue_schema.mjs";
import { formatISOtoLongDate } from "../../date_utils/src/formatter.mjs";

/**
 * Represents a top feature request for reporting.
 */
export class TopFeatureRequest {
	/**
	 * Creates a new instance of the TopFeatureRequest class.
	 * @param {z.infer<typeof issueSchema>} issue - The issue object representing the feature request.
	 */
	constructor(issue) {
		/**
		 * The title of the feature request, with a link to the issue.
		 * @type {string}
		 */
		this.title = `[${issue.title}](${issue.html_url})`;

		/**
		 * The creation date of the feature request, formatted as a long date.
		 * @type {string}
		 */
		this.created_at = formatISOtoLongDate(issue.created_at);

		/**
		 * The total number of reactions on the feature request.
		 * @type {number}
		 */
		this.reaction_count = issue.reactions.total_count;

		/**
		 * The labels associated with the feature request, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
