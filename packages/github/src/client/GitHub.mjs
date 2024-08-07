import { Logger } from "@aws-lambda-powertools/logger";
import { Octokit } from "@octokit/rest";
import { z } from "zod";
import {
	MAX_ISSUES_LIMIT,
	MAX_ISSUES_PER_PAGE,
	MAX_PULL_REQUESTS_LIMIT,
	MAX_PULL_REQUESTS_PER_PAGE,
	SERVICE_NAME,
} from "../constants.mjs";
import {
	filterByExcludedLabels,
	filterByMinDaysOld,
	filterByMinDaysWithoutUpdate,
	filterPullRequestsAsIssues,
} from "../filters/issues.mjs";
import { issueSchema, issueSearchSchema } from "../schemas/issues.mjs";
import { milestoneSchema } from "../schemas/milestones.mjs";
import { pullRequestSchema } from "../schemas/pull_requests.mjs";

export class GitHub {
	#debug;

	/**
	 * Fully qualified repository name e.g., aws-powertools/powertools-lambda-python
	 * @private
	 */
	#repoFQDN;

	/**
	 * Constructs a new instance of a GitHub client.
	 *
	 * @param {Object} [options={}] - The configuration options for the GitHub client.
	 * @param {string} [options.token] - The GitHub token for authentication.
	 * @param {boolean} [options.debug=false] - Flag indicating whether debug mode is enabled.
	 * @param {Octokit} [options.client] - The Octokit client instance.
	 * @param {Logger} [options.logger] - Logger to use
	 * @param {string} [options.repository] - Full GitHub repository name to use, e.g., `aws-powertools/actions`
	 * @property {string} owner - The owner of the GitHub repository.
	 * @property {string} repo - The name of the GitHub repository.
	 *
	 */
	constructor(options = {}) {
		this.token = options.token || process.env.GITHUB_TOKEN;
		this.#debug = options.debug || false;
		this.client = options.client || new Octokit({ auth: this.token, ...(this.#debug && { log: console }) });
		this.logger = options.logger || new Logger({ serviceName: SERVICE_NAME });
		this.#repoFQDN = options.repository || process.env.GITHUB_REPOSITORY || "";
		this.owner = this.#repoFQDN.split("/")[0];
		this.repo = this.#repoFQDN.split("/")[1];
	}

	/**
	 * List Pull Requests
	 * @param {Object} options - Config.
	 * @param {("created" | "updated" | "popularity" | "long-running")} [options.sortBy] - Sort results by
	 * @param {number} [options.limit] - Max number of pull requests to return (default 10)
	 * @param {number} [options.pageSize] - Pagination size for each List Pull Requests API call (max 100)
	 * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
	 * @param {string[]} [options.excludeLabels] - Exclude pull requests containing these labels
	 * @param {("open" | "closed" | "all")} [options.state="open"] - Limit listing to pull requests in these state
	 * @param {number} [options.minDaysOld] - The minimum number of days since the pull request was created.
	 * @param {number} [options.minDaysWithoutUpdate] - The minimum number of days since the pull request was last updated.
	 *
	 * @example Listing pull requests excluding those labels with `do-not-merge`
	 *
	 * ```javascript
	 * const github = new GitHub();
	 * const pullRequests = await github.listPullRequests({ sortBy: 'created', excludeLabels: ["do-not-merge"] });
	 * ```
	 *
	 * @returns {Promise<z.infer<typeof pullRequestSchema>[]>}
	 */
	async listPullRequests(options = {}) {
		const {
			sortBy,
			limit = MAX_PULL_REQUESTS_LIMIT,
			pageSize = MAX_PULL_REQUESTS_PER_PAGE,
			direction = "asc",
			excludeLabels = [],
			state = "open",
			minDaysOld,
			minDaysWithoutUpdate,
		} = options;

		let prs = [];

		try {
			this.logger.info("Listing pull requests", { sortBy: sortBy, excludeLabels: excludeLabels, limit: limit });

			for await (const { data: ret } of this.client.paginate.iterator(this.client.rest.pulls.list, {
				owner: this.owner,
				repo: this.repo,
				state,
				sort: sortBy,
				direction,
				per_page: pageSize,
			})) {
				let filteredPullRequests = ret;

				// TODO: Check with Andrea whether there's a perf concern on this being accidentally quadratic
				// single filter w/ conditions (1 loop) over multiple filters (N loops)

				filteredPullRequests = filterByMinDaysOld(filteredPullRequests, minDaysOld);
				filteredPullRequests = filterByMinDaysWithoutUpdate(filteredPullRequests, minDaysWithoutUpdate);
				filteredPullRequests = filterByExcludedLabels(filteredPullRequests, excludeLabels);

				prs.push(...filteredPullRequests);

				if (prs.length >= limit) {
					prs = prs.slice(0, limit);
					break;
				}
			}

			this.logger.debug(JSON.stringify(prs));

			return prs;
		} catch (error) {
			this.logger.error(`Unable to list pull requests. Error: ${error}`);
			throw error;
		}
	}

	/**
	 * List issues
	 *
	 * @param {Object} options - Config.
	 * @param {string[]} [options.labels] - Include issues containing these labels
	 * @param {("created" | "updated" | "comments")} [options.sortBy] - Sort results by
	 * @param {number} [options.limit] - Max number of issues to return (default 10)
	 * @param {number} [options.pageSize] - Pagination size for each List Issues API call (max 100)
	 * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
	 * @param {number} [options.minDaysOld] - The minimum number of days since the issue was created.
	 * @param {number} [options.minDaysWithoutUpdate] - The minimum number of days since the issue was last updated.
	 * @param {string[]} [options.excludeLabels] - Exclude issues containing these labels
	 * @param {number} [options.milestone] - Milestone number to filter issues by
	 * @param {("open" | "closed" | "all")} [options.state="open"] - Limit listing to issues in these state
	 *
	 * @example List feature requests, excluding blocked issues
	 *
	 * ```javascript
	 * const github = new GitHub();
	 * const issues = await github.listIssues({
	 *   labels: ['feature-request'],
	 *   sortBy: 'created',
	 *   limit: 15,
	 *   excludeLabels: ['do-not-merge']
	 * });
	 * ```
	 * @returns {Promise<z.infer<typeof issueSchema>[]>} Issue - Newly created issue
	 */
	async listIssues(options = {}) {
		const {
			labels,
			sortBy,
			limit = MAX_ISSUES_LIMIT,
			pageSize = MAX_ISSUES_PER_PAGE,
			direction = "asc",
			excludeLabels = [],
			minDaysOld,
			minDaysWithoutUpdate,
			milestone,
			state = "open",
		} = options;

		let issues = [];

		try {
			this.logger.info("Listing issues. Filtered by labels", {
				sortBy: sortBy,
				labels: labels,
				excludeLabels: excludeLabels,
				limit: limit,
			});

			// fetch as many issues as possible (`pageSize`), filter out PRs and issues labelled with any of our `excludeLabels`
			// cap the results (`limit`)
			for await (const { data: ret } of this.client.paginate.iterator(this.client.rest.issues.listForRepo, {
				owner: this.owner,
				repo: this.repo,
				labels,
				sort: sortBy,
				direction,
				per_page: pageSize,
				milestone,
				state,
			})) {
				let filteredIssues = ret;

				// TODO: Check with Andrea whether there's a perf concern on this being accidentally quadratic
				// single filter w/ conditions (1 loop) over multiple filters (N loops)

				filteredIssues = filterPullRequestsAsIssues(filteredIssues);
				filteredIssues = filterByMinDaysOld(filteredIssues, minDaysOld);
				filteredIssues = filterByMinDaysWithoutUpdate(filteredIssues, minDaysWithoutUpdate);
				filteredIssues = filterByExcludedLabels(filteredIssues, excludeLabels);

				issues.push(...filteredIssues);

				if (issues.length >= limit) {
					issues = issues.slice(0, limit);
					break;
				}
			}

			this.logger.debug(JSON.stringify(issues));

			return issues;
		} catch (error) {
			this.logger.error(`Unable to list issues. Error: ${error}`);
			throw error;
		}
	}

	/**
	 * Searches for an issue based on query parameters.
	 * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
	 * @param {Object} options - Config.
	 * @param {string} [options.searchQuery] - Search query to find issues and pull requests
	 *
	 * @example Finding an issue labeled as bug
	 * ```javascript
	 * const github = new GitHub();
	 * const searchQuery = 'New bug is:issue label:bug in:title';
	 * const issues = await github.findIssue({ searchQuery });
	 * ```
	 * @typedef {z.infer<typeof issueSearchSchema>} SearchResult
	 * @returns {Promise<SearchResult>} Response - Search containing results
	 */
	async findIssue(options = {}) {
		const { searchQuery } = options;

		try {
			this.logger.info("Searching whether issue exists", { query: searchQuery });

			const {
				data: { items: issues },
			} = await this.client.rest.search.issuesAndPullRequests({ q: searchQuery });

			this.logger.debug(JSON.stringify(issues));
			return issues;
		} catch (error) {
			this.logger.error(`Unable to search for issues at this time. Error: ${error}`);
			throw error;
		}
	}

	/**
	 * Creates a new issue.
	 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue
	 * @param {Object} options - Config.
	 * @param {string} options.title - Issue title
	 * @param {string} [options.body] - Issue body (description)
	 * @param {string[]} [options.labels] - Labels to assign
	 * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
	 * @param {number} [options.milestone] - Milestone number to assign this issue to
	 *
	 * @example Creating an issue
	 * ```javascript
	 * const github = new GitHub();
	 * const issue = await github.createIssue({
	 *   title: 'New Issue',
	 *   body: 'This is a new issue created using the createIssue function.',
	 *   labels: ['enhancement'],
	 *   assignees: ['heitorlessa'],
	 *   milestone: 1
	 * });
	 *```
	 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created issue
	 */
	async createIssue(options = {}) {
		const { title, body, labels, assignees, milestone } = options;

		if (title === undefined) {
			throw new Error("Issue title is required in CREATE operations.");
		}

		try {
			const issue = await this.client.rest.issues.create({
				owner: this.owner,
				repo: this.repo,
				title,
				body,
				labels,
				assignees,
				milestone,
			});

			this.logger.debug(JSON.stringify(issue));
			return issue.data;
		} catch (error) {
			this.logger.error(`Unable to create issue in repository '${this.owner}/${this.repo}'. Error: ${error}`);
			throw error;
		}
	}

	/**
	 * Updates an existing issue number.
	 *
	 * @param {Object} options - Config.
	 * @param {number} options.issueNumber - Issue number to update
	 * @param {string} [options.title] - Issue title
	 * @param {string} [options.body] - Issue body (description)
	 * @param {string[]} [options.labels] - Labels to assign
	 * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
	 * @param {("open"|"closed")} [options.state] - Issue state to update to
	 * @param {number} [options.milestone] - Milestone number
	 *
	 * @example Updating an existing issue
	 *```javascript
	 * const github = new GitHub();
	 * const issue = await github.updateIssue({
	 *   github: octokit,
	 *   core,
	 *   issueNumber: 10,
	 *   title: 'New title',
	 *   body: 'Updated description',
	 *   labels: ['enhancement', 'need-customer-feedback'],
	 *   assignees: ['heitorlessa'],
	 *   state: "closed",
	 *   milestone: 1
	 * });
	 * ```
	 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly updated issue
	 */
	async updateIssue(options = {}) {
		const { issueNumber, title, body, labels, assignees, state, milestone } = options;

		if (issueNumber === undefined) {
			throw new Error("Issue number is required in UPDATE operations.");
		}

		try {
			this.logger.info("Updating existing issue", { issueNumber: issueNumber });

			const issue = await this.client.rest.issues.update({
				owner: this.owner,
				repo: this.repo,
				issue_number: issueNumber,
				body,
				labels,
				title,
				assignees,
				state,
				milestone,
			});

			this.logger.debug(JSON.stringify(issue));
			return issue.data;
		} catch (err) {
			this.logger.error(`Unable to update issue number '${issueNumber}'. Error: ${err}`);
			throw err;
		}
	}

	/**
	 * Update existing issue if found, or create it.
	 *
	 * @param {Object} options - Config.
	 * @param {string} [options.searchQuery] - Search query to find issue to update
	 * @param {string} [options.title] - Issue title
	 * @param {string} [options.body] - Issue body (description)
	 * @param {string[]} [options.labels] - Labels to assign
	 * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
	 * @param {("open" | "closed")} [options.state] - Issue state to update to
	 * @param {number} [options.milestone] - Milestone number
	 *
	 * @example Update roadmap issue, or create it if not found
	 * ```javascript
	 * const github = new GitHub();
	 * const issue = await createOrUpdateIssue({
	 *   searchQuery: 'Roadmap reminder is:issue in:title label:report-roadmap',
	 *   body: 'The new roadmap is...',
	 *   labels: ['report-roadmap'],
	 *   assignees: ['heitorlessa'],
	 * });
	 * ```
	 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created or updated issue.
	 */
	async createOrUpdateIssue(options = {}) {
		const { searchQuery, title, body, labels, assignees, state, milestone } = options;
		const searchResult = await this.findIssue({ searchQuery });

		const reportingIssue = searchResult[0];

		if (reportingIssue === undefined) {
			return await this.createIssue({ title, body, labels, milestone, assignees });
		}

		return await this.updateIssue({
			issueNumber: reportingIssue.number,
			title,
			body,
			labels,
			milestone,
			assignees,
			state,
		});
	}

	/**
	 * List milestones
	 *
	 * @param {Object} options - Config.
	 * @param {("open" | "closed" | "all")} [options.state] - Include milestones in these states
	 * @param {("due_on" | "completeness")} [options.sortBy] - Sort results by
	 * @param {number} [options.limit] - Max number of issues to return (default 10)
	 * @param {number} [options.pageSize] - Pagination size for each List Issues API call (max 100)
	 * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
	 *
	 * @example List open milestones
	 *
	 * ```javascript
	 * const github = new GitHub();
	 * const issues = await github.listIssues({
	 *   state: 'open',
	 *   sortBy: 'due_on',
	 * });
	 * ```
	 * @returns {Promise<z.infer<typeof milestoneSchema>[]>} Milestone
	 */
	async listMilestones(options = {}) {
		const {
			sortBy,
			limit = MAX_ISSUES_LIMIT,
			pageSize = MAX_ISSUES_PER_PAGE,
			direction = "asc",
			state = "all",
		} = options;

		let milestones = [];

		try {
			this.logger.info("Listing issues. Filtered by state", {
				sortBy: sortBy,
				state,
				limit: limit,
			});

			// fetch as many milestones as possible (`pageSize`), cap the results (`limit`)
			for await (const { data: ret } of this.client.paginate.iterator(this.client.rest.issues.listMilestones, {
				owner: this.owner,
				repo: this.repo,
				state,
				sort: sortBy,
				direction,
				per_page: pageSize,
			})) {
				milestones.push(...ret);

				if (milestones.length >= limit) {
					milestones = milestones.slice(0, limit);
					break;
				}
			}

			this.logger.debug("Milestones", { milestones });

			return milestones;
		} catch (error) {
			this.logger.error("Unable to list milestones", error);
			throw error;
		}
	}
}
