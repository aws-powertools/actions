import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub, GitHubActions } from "github/src/client";
import { issueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";
import { SERVICE_NAME } from "../constants.mjs";

/**
 * Base class for all reports
 */
export class BaseReport {
	/**
	 * Constructs a BaseReport instance.
	 * @param {Object} [options={}] - Options object.
	 * @param {Logger} [options.logger] - A Logger instance.
	 * @param {GitHub} [options.github] - A GitHub client instance.
	 * @param {GitHubActions} [options.actions] - A GitHub Actions client instance.
	 */
	constructor(options = {}) {
		this.actions = options.actions || new GitHubActions();
		this.logger =
			options.logger ||
			new Logger({
				serviceName: SERVICE_NAME,
				persistentLogAttributes: {
					eventName: this.actions.eventName,
					workflowName: this.actions.workflowName,
					repository: this.actions.repositoryFQDN,
					triggerCommit: this.actions.triggerCommitSha,
					triggerActor: this.actions.triggerActor,
					actionName: this.actions.actionName,
					jobName: this.actions.jobName,
				},
			});
		this.github = options.github || new GitHub({ logger: this.logger });
	}

	/**
	 * Builds a report.
	 * @returns {Promise<string>} The built report in GitHub Markdown format.
	 */
	async build() {
		return Promise.resolve({});
	}

	/**
	 * Creates a report issue on GitHub.
	 * @param {Object} [options={}] - Options object.
	 * @param {string} [options.report] - A previously built report to use; it creates one otherwise.
	 * @returns {Promise<z.infer<typeof issueSchema>>} The created or updated report issue.
	 */
	async create(options = {}) {
		return Promise.resolve({});
	}
}
