import {diffInDaysFromToday, formatISOtoLongDate} from "github/src/functions.mjs";
import { projectIssueSchema } from "github/src/schemas/projects.mjs";
import { z } from "zod";

/**
 * Represents a issue assigned to a project for reporting.
 */
export class ProjectIssue {
	/**
	 * Creates a new instance of the TopFeatureRequest class.
	 * @param {z.infer<typeof projectIssueSchema>} issue - A GitHub issue.
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
		 * The current project status e.g., Triage.
		 * @type {string|null}
		 */
		this.status = issue.projects.items[0].projectStatus?.status;

		/**
		 * The current feature area e.g., Tracer.
		 * @type {string|null}
		 */
		this.area = issue.projects.items[0].area?.area;

		/**
		 * The current iteration cycle date e.g., 2024-05-06.
		 * @type {string|null}
		 */
		this.iteration = issue.projects.items[0].iteration?.startDate;

		/**
		 * The labels associated with the issue, formatted as a string with each label enclosed in backticks (`bug`).
		 * @type {string}
		 */
		this.labels = `${issue.labels.items.map((label) => `\`${label.name}\``).join("<br>")}`;
	}
}
