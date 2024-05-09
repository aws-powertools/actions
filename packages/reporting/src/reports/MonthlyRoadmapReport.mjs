import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub, GitHubActions } from "@aws-powertools-actions/github";
import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
import { z } from "zod";
import { REPORT_ROADMAP_LABEL } from "../constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "../issues/index.mjs";
import { getLongRunningPRs } from "../pull_requests/index.mjs";
import { MonthlyRoadmapTemplate } from "../templates/MonthlyRoadmapTemplate.mjs";
import { BaseReport } from "./base.mjs";

export class MonthlyRoadmapReport extends BaseReport {
	#month = new Date().toLocaleString("en-US", { month: "long" });
	#searchParams;

	/**
	 * Constructs a BaseReport instance.
	 * @param {Object} [options={}] - Options object.
	 * @param {Logger} [options.logger] - A Logger instance.
	 * @param {GitHub} [options.github] - A GitHub client instance.
	 * @param {GitHubActions} [options.actions] - A GitHub Actions client instance.
	 * @param {string} [options.searchQuery="Roadmap update reminder"] - GitHub Search query to find issue existing report to update.
	 * @param {string} [options.title="Roadmap update reminder"] - GitHub Issue title for this report.
	 */
	constructor(options = {}) {
		super(options);
		this.title = options.title || `Roadmap update reminder - ${this.#month}`;
		this.#searchParams = `is:issue in:title state:open label:${REPORT_ROADMAP_LABEL} repo:${this.github.owner}/${this.github.repo}`;
		this.searchQuery = options.searchQuery || `${this.title} ${this.#searchParams}`;
	}

	/**
	 * Builds monthly roadmap report GitHub issue body.
	 * @returns {Promise<string>} GitHub issue body
	 */
	async build() {
		this.logger.info("Fetching GitHub data");

		const [
			{ value: featureRequests = [] },
			{ value: longRunningPRs = [] },
			{ value: oldestIssues = [] },
			{ value: mostActiveIssues = [] },
		] = await Promise.allSettled([
			getTopFeatureRequests({ github: this.github }),
			getLongRunningPRs({ github: this.github }),
			getTopOldestIssues({ github: this.github }),
			getTopMostCommented({ github: this.github }),
		]);

		// noinspection JSCheckFunctionSignatures
		this.logger.info("Building monthly roadmap", { title: this.title });

		const template = new MonthlyRoadmapTemplate({
			featureRequests,
			longRunningPRs,
			oldestIssues,
			mostActiveIssues,
		});

		return template.build();
	}

	/**
	 * Creates or updates a monthly report issue on GitHub.
	 * @param {Object} [options={}] - Options object.
	 * @param {string} [options.report] - A previously built report to use; it creates one otherwise.
	 * @returns {Promise<z.infer<typeof issueSchema>>} The created or updated report issue.
	 */
	async create(options = {}) {
		const report = options.report || (await this.build());

		// noinspection JSCheckFunctionSignatures
		this.logger.info("Creating issue with monthly roadmap report", { title: this.title });
		const issue = await this.github.createOrUpdateIssue({
			searchQuery: this.searchQuery,
			title: this.title,
			body: report,
			labels: [REPORT_ROADMAP_LABEL],
		});

		await this.actions.core.summary.addHeading(this.title).addLink("View monthly report", issue.html_url).write();

		return issue;
	}
}
