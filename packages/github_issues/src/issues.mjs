import { z } from "zod";
import { issueSchema, pullRequestAsIssueSchema } from "../../schemas/src/issue_schema.mjs";
import { MAX_ISSUES_LIMIT, MAX_ISSUES_PER_PAGE } from "./constants.mjs";

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
export async function createIssue({ github, context, core, title, body, labels, assignees, milestone }) {
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
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created issue. - Newly updated issue
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
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created or updated issue.
 */
export async function createOrUpdateIssue({
	github,
	context,
	core,
	searchQuery,
	title,
	body,
	labels,
	assignees,
	state,
	milestone,
}) {
	const searchResult = await findIssue({ github, context, core, searchQuery });

	const reportingIssue = searchResult[0];

	if (reportingIssue === undefined) {
		return await createIssue({ github, context, core, title, body, labels, milestone, assignees });
	}

	return await updateIssue({
		github,
		context,
		core,
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
