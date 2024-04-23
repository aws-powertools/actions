import { Github } from "github/src/Github.mjs";
import { issueSchema, pullRequestAsIssueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";
import { MAX_ISSUES_LIMIT, MAX_ISSUES_PER_PAGE } from "./constants.mjs";

/**
 * Searches for an issue based on query parameters.
 * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
 * @param {Object} options - Config.
 * @param {import('@octokit/rest').Octokit} options.github - Octokit pre-authenticated instance
 * @param {typeof import("@actions/core/lib/core")} options.core - GitHub Core
 * @param {string} [options.searchQuery] - Search query to find issues and pull requests
 *
 * @example Finding an issue labeled as bug
 *
 * import { core } from "@actions/core";
 * import { Octokit } from "@octokit/rest";
 *
 * const octokit = new Octokit(auth: process.env.GITHUB_TOKEN);
 * const core = require('@actions/core');
 *
 * const searchQuery = 'New bug is:issue label:bug in:title';
 * const issues = await findIssue({ github: octokit, core, searchQuery });
 *
 * @typedef {(z.infer<typeof issueSchema>[] | z.infer<typeof pullRequestAsIssueSchema>[])} SearchResult
 * @returns {Promise<SearchResult>} Response - Search containing results
 */
export async function findIssue({ github, core, searchQuery }) {
	try {
		core.info(`Searching whether issue exists. Search params: '${searchQuery}'`);

		const {
			data: { items: issues },
		} = await github.rest.search.issuesAndPullRequests({ q: searchQuery });

		core.debug(issues);
		return issues;
	} catch (error) {
		core.error(`Unable to search for issues at this time. Error: ${error}`);
		throw error;
	}
}

/**
 * Creates a new issue.
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @param {string} options.title - Issue title
 * @param {string} [options.body] - Issue body (description)
 * @param {string[]} [options.labels] - Labels to assign
 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
 * @param {number} [options.milestone] - Milestone number to assign this issue to
 *
 * @example Creating an issue
 *
 * const issue = await createIssue({
 *   title: 'New Issue',
 *   body: 'This is a new issue created using the createIssue function.',
 *   labels: ['enhancement'],
 *   assignees: ['heitorlessa'],
 *   milestone: 1
 * });
 *
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created issue
 */
export async function createIssue(options = {}) {
	const { title, body, labels, assignees, milestone, github = new Github() } = options;

	if (title === undefined) {
		throw new Error("Issue title is required in CREATE operations.");
	}

	try {
		const issue = await github.client.rest.issues.create({
			owner: github.owner,
			repo: github.repo,
			title,
			body,
			labels,
			assignees,
			milestone,
		});

		github.core.debug(issue);
		return issue.data;
	} catch (error) {
		github.core.error(`Unable to create issue in repository '${github.owner}/${github.repo}'. Error: ${error}`);
		throw error;
	}
}

/**
 * Updates an existing issue number.
 *
 * @param {Object} options - Config.
 * @param {import('@octokit/rest').Octokit} options.github - Octokit pre-authenticated instance
 *
 * @param {Object} options.context - GitHub Context information
 * @param {Object} options.context.repo - Context Repository information
 * @param {string} options.context.repo.owner - The organization name.
 * @param {string} options.context.repo.repo - The repository name.
 *
 * @param {typeof import("@actions/core/lib/core")} options.core - GitHub Core
 *
 * @param {string} options.issueNumber - Issue number to update
 * @param {string} [options.title] - Issue title
 * @param {string} [options.body] - Issue body (description)
 * @param {string[]} [options.labels] - Labels to assign
 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
 * @param {("open"|"closed")} [options.state] - Issue state to update to
 * @param {number} [options.milestone] - Milestone number
 *
 * @example Updating an existing issue
 *
 * import { core } from "@actions/core";
 * import { Octokit } from "@octokit/rest";
 *
 * const octokit = new Octokit(auth: process.env.GITHUB_TOKEN);
 * const core = require('@actions/core');
 *
 * const issue = await updateIssue({
 *   github: octokit,
 *   core,
 *   issueNumber: 10,
 *   title: 'New title',
 *   body: 'Updated description',
 *   labels: ['enhancement', 'need-customer-feedback],
 *   assignees: ['heitorlessa'],
 *   state: "closed",
 *   milestone: 1
 * });
 *
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly updated issue
 */
export async function updateIssue({
	github,
	context,
	core,
	issueNumber,
	title,
	body,
	labels,
	assignees,
	state,
	milestone,
}) {
	if (issueNumber === undefined) {
		throw new Error("Issue number is required in UPDATE operations.");
	}

	try {
		core.info(`Updating existing issue ${issueNumber}`);

		const issue = await github.rest.issues.update({
			owner: context.repo.owner,
			repo: context.repo.repo,
			issue_number: issueNumber,
			body,
			labels,
			title,
			assignees,
			state,
			milestone,
		});

		core.debug(issue);
		return issue.data;
	} catch (err) {
		core.error(`Unable to update issue number '${issueNumber}'. Error: ${err}`);
		throw err;
	}
}

/**
 * Update existing issue if found, or create it.
 *
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @param {string} [options.searchQuery] - Search query to find issue to update
 * @param {string} [options.title] - Issue title
 * @param {string} [options.body] - Issue body (description)
 * @param {string[]} [options.labels] - Labels to assign
 * @param {string[]} [options.assignees] - GitHub logins to assign this issue to
 * @param {("open" | "closed")} [options.state] - Issue state to update to
 * @param {number} [options.milestone] - Milestone number
 *
 * @example Update roadmap issue, or create it if not found
 *
 * import { core } from "@actions/core";
 * import { Octokit } from "@octokit/rest";
 *
 * const octokit = new Octokit(auth: process.env.GITHUB_TOKEN);
 *
 * const issue = await createOrUpdateIssue({
 *   searchQuery: 'Roadmap reminder is:issue in:title label:report-roadmap',
 *   body: 'The new roadmap is...',
 *   labels: ['report-roadmap'],
 *   assignees: ['heitorlessa'],
 * });
 *
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created or updated issue.
 */
export async function createOrUpdateIssue(options = {}) {
	const { searchQuery, title, body, labels, assignees, state, milestone, github = new Github() } = options;
	const searchResult = await github.findIssue({ searchQuery });

	const reportingIssue = searchResult.items[0];

	if (reportingIssue === undefined) {
		return await github.createIssue({ title, body, labels, milestone, assignees });
	}

	return await github.updateIssue({
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
 * List issues
 *
 * @param {Object} options - Config.
 * @param {import('@octokit/rest').Octokit} options.github - Octokit pre-authenticated instance
 *
 * @param {Object} options.context - GitHub Context information
 * @param {Object} options.context.repo - Context Repository information
 * @param {string} options.context.repo.owner - The organization name.
 * @param {string} options.context.repo.repo - The repository name.
 *
 * @param {typeof import("@actions/core/lib/core")} options.core - GitHub Core
 *
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
export async function listIssues({
	github,
	context,
	core,
	labels,
	sortBy,
	limit = MAX_ISSUES_LIMIT,
	pageSize = MAX_ISSUES_PER_PAGE,
	direction = "asc",
	excludeLabels = [],
}) {
	let issues = [];

	try {
		core.info(
			`Listing issues. Filtered by labels: '${labels}', Sorted by:'${sortBy}', Excluding labels: '${excludeLabels}', Limit: ${limit}`,
		);

		for await (const { data: ret } of github.paginate.iterator(github.rest.issues.listForRepo, {
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

		core.debug(issues);

		return issues;
	} catch (error) {
		core.error(`Unable to list issues. Error: ${error}`);
		throw error;
	}
}
