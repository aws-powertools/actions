import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { MAX_PULL_REQUESTS_LIMIT, MAX_PULL_REQUESTS_PER_PAGE } from "github_pull_requests/src/constants.mjs";
import { z } from "zod";
import { MAX_ISSUES_LIMIT, MAX_ISSUES_PER_PAGE } from "../../github_issues/src/constants.mjs";
import { issueSchema } from "./schemas/issues.mjs";
import { pullRequestSchema } from "./schemas/pull_requests";

export class Github {
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
	 * const github = new Github();
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
	 * import { core } from "@actions/core";
	 * import { Octokit } from "@octokit/rest";
	 *
	 * const octokit = new Octokit(auth: process.env.GITHUB_TOKEN);
	 *
	 * const issues = await listIssues({
	 *   github: octokit,
	 *   core,
	 *   labels: ['feature-request'],
	 *   sortBy: 'created',
	 *   limit: 15,
	 *   excludeLabels: ['do-not-merge']
	 * });
	 *
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
				owner: context.repo.owner,
				repo: context.repo.repo,
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
}
