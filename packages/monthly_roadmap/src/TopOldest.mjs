import { issueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";
import { diffInDaysFromToday } from "../../date_utils/src/date_diff.mjs";
import { formatISOtoLongDate } from "../../date_utils/src/formatter.mjs";

/**
 * Represents a top oldest issue for reporting.
 */
export class TopOldest {
	/**
	 * Creates a new instance of the TopOldest class.
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
		 * The total number of days since last update.
		 * @type {string}
		 */
		this.last_update = `${diffInDaysFromToday(issue.updated_at)} days`;

		/**
		 * The labels associated with the issue, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
