import { MAX_ISSUES_LIMIT, MAX_ISSUES_PER_PAGE } from "./constants.mjs";
import { issueSchema, pullRequestAsIssueSchema } from "../../schemas/src/issue_schema.mjs";
import { z } from "zod";

/**
 * Searches for an issue based on query parameters.
 * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
 *
 * @param {import('@types/github-script').AsyncFunctionArguments}
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
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created issue.
 */
export async function createIssue(
	title,
	{ github, context, core, body = "", labels = [], assignees = [], milestone = null },
) {
	try {
		const issue = await github.rest.issues.create({
			owner: context.repo.owner,
			repo: context.repo.repo,
			title,
			body,
			labels,
			assignees,
			milestone,
		});

		core.debug(issue);
		return issue.data;
	} catch (error) {
		core.error(`Unable to create issue in repository '${context.repo.owner}/${context.repo.repo}'. Error: ${error}`);
		throw error;
	}
}

/**
 * Updates an existing issue number.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Object>} - Newly updated issue
 */
export async function updateIssue({ github, context, core, issueNumber, title = "", body = "", labels = [] }) {
	try {
		core.info(`Updating existing issue ${issueNumber}`);

		return await github.rest.issues.update({
			owner: context.repo.owner,
			repo: context.repo.repo,
			issue_number: issueNumber,
			body: body,
		});
	} catch (error) {
		core.error(`Unable to update issue number '${issueNumber}'. Error: ${error}`);
		throw error;
	}
}

/**
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created or updated issue.
 */
export async function createOrUpdateIssue(title, { github, context, core, searchQuery, body = "", labels = [] }) {
	const existingReportingIssues = await findIssue({ github, context, core, searchQuery });

	if (existingReportingIssues[0] === undefined) {
		return await createIssue(title, { github, context, core, body, labels });
	}

	return await updateIssue({
		github,
		context,
		core,
		title,
		body,
		labels,
		issueNumber: existingReportingIssues.number,
	});
}

/**
 * List issues
 *
 * @param {import('@types/github-script').AsyncFunctionArguments}
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
