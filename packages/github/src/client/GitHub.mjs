import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import {
	MAX_ISSUES_LIMIT,
	MAX_ISSUES_PER_PAGE,
	MAX_PULL_REQUESTS_LIMIT,
	MAX_PULL_REQUESTS_PER_PAGE,
} from "github/src/constants.mjs";
import { issueSchema, pullRequestAsIssueSchema } from "github/src/schemas/issues.mjs";
import { pullRequestSchema } from "github/src/schemas/pull_requests.js";
import { z } from "zod";

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
	 * @param {core} [options.core] - The GitHub Actions core instance.
	 * @property {string} owner - The owner of the GitHub repository.
	 * @property {string} repo - The name of the GitHub repository.
	 *
	 * @returns {Promise<z.infer<typeof pullRequestSchema>[]>}
	 */
	constructor(options = {}) {
		this.token = options.token || process.env.GITHUB_TOKEN;
		this.#debug = options.debug || false;
		this.client = options.client || new Octokit({ auth: this.token, ...(this.#debug && { log: console }) });
		this.core = options.core || core;
		this.#repoFQDN = process.env.GITHUB_REPOSITORY || "";
		this.owner = this.#repoFQDN.split("/")[0];
		this.repo = this.#repoFQDN.split("/")[1];
		// [this.owner, this.repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
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
		} = options;

		let prs = [];

		try {
			this.core.info(
				`Listing pull requests. Sorted by:'${sortBy}', Excluding labels: '${excludeLabels}', Limit: ${limit}`,
			);

			for await (const { data: ret } of this.client.paginate.iterator(this.client.rest.pulls.list, {
				owner: this.owner,
				repo: this.repo,
				state,
				sort: sortBy,
				direction,
				per_page: pageSize,
			})) {
				const pullRequestOnly = ret.filter((pr) => pr.labels.every((label) => !excludeLabels.includes(label.name)));

				prs.push(...pullRequestOnly);

				if (prs.length >= limit) {
					prs = prs.slice(0, limit);
					break;
				}
			}

			this.core.debug(prs);

			return prs;
		} catch (error) {
			this.core.error(`Unable to list pull requests. Error: ${error}`);
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
	 * @param {string[]} [options.excludeLabels] - Exclude issues containing these labels
	 *
	 * @example List feature requests, excluding blocked issues
	 *
	 * ```javascript
     * const github = new GitHub();
	 * const issues = await github.listIssues({
	 *   github: octokit,
	 *   core,
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
		} = options;

		let issues = [];

		try {
			this.core.info(
				`Listing issues. Filtered by labels: '${labels}', Sorted by:'${sortBy}', Excluding labels: '${excludeLabels}', Limit: ${limit}`,
			);

			// fetch as many issues as possible (`pageSize`), filter out PRs and issues labelled with any of our `excludeLabels`
			// cap the results (`limit`)
			for await (const { data: ret } of this.client.paginate.iterator(this.client.rest.issues.listForRepo, {
				owner: this.owner,
				repo: this.repo,
				labels,
				sort: sortBy,
				direction,
				per_page: pageSize,
			})) {
				const issuesOnly = ret.filter((issue) => {
					// ignore PRs
					if (Object.hasOwn(issue, "pull_request")) {
						return false;
					}

					return issue.labels.every((label) => !excludeLabels.includes(label.name));
				});

				issues.push(...issuesOnly);

				if (issues.length >= limit) {
					issues = issues.slice(0, limit);
					break;
				}
			}

			this.core.debug(issues);

			return issues;
		} catch (error) {
			this.core.error(`Unable to list issues. Error: ${error}`);
			throw error;
		}
	}

	/**
	 * Searches for an issue based on query parameters.
	 * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
	 * @param {Object} options - Config.
	 * @param {GitHub} options.github - A GitHub client instance.
	 * @param {string} [options.searchQuery] - Search query to find issues and pull requests
	 *
	 * @example Finding an issue labeled as bug
	 * ```javascript
	 * const github = new GitHub();
	 * const searchQuery = 'New bug is:issue label:bug in:title';
	 * const issues = await github.findIssue({ searchQuery });
	 * ```
	 * @typedef {(z.infer<typeof issueSchema>[] | z.infer<typeof pullRequestAsIssueSchema>[])} SearchResult
	 * @returns {Promise<SearchResult>} Response - Search containing results
	 */
	async findIssue(options = {}) {
		const { searchQuery } = options;

		try {
			this.core.info(`Searching whether issue exists. Search params: '${searchQuery}'`);

			const {
				data: { items: issues },
			} = await this.client.rest.search.issuesAndPullRequests({ q: searchQuery });

			this.core.debug(issues);
			return issues;
		} catch (error) {
			this.core.error(`Unable to search for issues at this time. Error: ${error}`);
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
	 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
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

			this.core.debug(issue);
			return issue.data;
		} catch (error) {
			this.core.error(`Unable to create issue in repository '${this.owner}/${this.repo}'. Error: ${error}`);
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
	 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
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
			this.core.info(`Updating existing issue ${issueNumber}`);

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

			this.core.debug(issue);
			return issue.data;
		} catch (err) {
			this.core.error(`Unable to update issue number '${issueNumber}'. Error: ${err}`);
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
	 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
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
}
