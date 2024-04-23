import { diffInDaysFromToday } from "date_utils/src/date_diff.mjs";
import { formatISOtoLongDate } from "date_utils/src/formatter.mjs";
import { pullRequestSchema } from "github/src/schemas/pull_requests.js";
import { z } from "zod";

/**
 * Represents a base pull request with shared attributes for consistent reporting.
 */
export class PullRequest {
	/**
	 * Creates a new instance of the PullRequest class.
	 * @param {z.infer<typeof pullRequestSchema>} pr - A GitHub Pull Request.
	 */
	constructor(pr) {
		/**
		 * The pr title with a link to itself.
		 * @type {string}
		 */
		this.title = `[${pr.title}](${pr.html_url})`;

		/**
		 * The PR creation date, formatted as a long date.
		 * @type {string}
		 */
		this.created_at = formatISOtoLongDate(pr.created_at);

		/**
		 * The total number of days since last update.
		 * @type {string}
		 */
		this.last_update = `${diffInDaysFromToday(pr.updated_at)} days`;

		/**
		 * The login of each person requested to review this PR.
		 * @type {string}
		 */
		this.reviewers = `${pr.requested_reviewers.map((person) => person.login).join("<br>")}`;

		/**
		 * The labels associated with the PR, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${pr.labels.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
