import { diffInDaysFromToday } from "date_utils/src/date_diff.mjs";
import { formatISOtoLongDate } from "date_utils/src/formatter.mjs";
import { issueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";

/**
 * Represents a base issue with shared attributes for consistent reporting.
 */
export class Issue {
	/**
	 * Creates a new instance of the Issue class.
	 * @param {z.infer<typeof issueSchema>} issue - The issue object representing an issue.
	 */
	constructor(issue) {
		/**
		 * The title of the feature request, with a link to the issue.
		 * @type {string}
		 */
		this.title = `[${issue.title}](${issue.html_url})`;

		/**
		 * The issue creation date, formatted as a long date.
		 * @type {string}
		 */
		this.created_at = formatISOtoLongDate(issue.created_at);

		/**
		 * The total number of days since last update.
		 * @type {string}
		 */
		this.last_update = `${diffInDaysFromToday(issue.updated_at)} days`;

		/**
		 * The labels associated with the feature request, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
