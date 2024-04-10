/**
 * Searches for an issue based on query parameters.
 * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
 *
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<{Issue}>} - Promise resolving to issue

 */
export async function findIssue({ github, context, core, searchQuery }) {
	try {
		core.info(`Searching whether issue exists. Search params: '${searchQuery}'`);

		const {
			data: { items: issues },
		} = await github.rest.search.issuesAndPullRequests({ q: searchQuery });

		return issues[0];
	} catch (error) {
		core.error(`Unable to create issue in repository '${owner}/${repo}'. Error: ${error}`);
		core.debug(body);
	}
}

/**
 * Creates a new issue
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Issue>} - Newly created issue
 */
export async function createIssue({ github, context, core, title = "", body = "", labels = [] }) {
	try {
		return await github.rest.issues.create({
			owner: context.repo.owner,
			repo: context.repo.repo,
			title,
			body,
			labels,
		});
	} catch (error) {
		core.error(`Unable to create issue in repository '${owner}/${repo}'. Error: ${error}`);
		core.debug(body);
	}
}

/**
 * Updates an existing issue number.
 *
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Issue>} - Newly updated issue
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
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Issue}> - Newly created or updated issue
 */
export async function createOrUpdateIssue({ github, context, core, searchQuery, title = "", body = "", labels = [] }) {
	if (searchQuery === undefined) {
		return await createIssue({ github, context, core, title, body, labels });
	}

	const existingReportingIssue = await findIssue({ github, context, core, searchQuery });

	if (existingReportingIssue === undefined) {
		return await createIssue({ github, context, core, title, body, labels });
	}

	return await updateIssue({
		github,
		context,
		core,
		title,
		body,
		labels,
		issueNumber: existingReportingIssue.issueNumber,
	});
}

/**
 * List issues
 *
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Issue[]>} - List of issues
 */
export async function listIssues({
	github,
	context,
	core,
	labels,
	sortBy,
	limit = 10,
	direction = "asc",
	excludeLabels = [],
}) {
	let issues = [];

	try {
		core.info(`Listing issues. Filtered by labels: '${labels}', Sorted by:'${sortBy}', ;Limit: ${limit}`);

		for await (const { data: ret } of github.paginate.iterator(github.rest.issues.listForRepo, {
			owner: context.repo.owner,
			repo: context.repo.repo,
			labels,
			sort: sortBy,
			direction,
			per_page: 30,
		})) {
			const issuesOnly = ret.filter((issue) => {
				// ignore PRs
				if (Object.hasOwn(issue, "pull_request")) {
					return false;
				}

				return issue.labels.every((label) => !excludeLabels.includes(label.name));
			});

			// const issuesOnly = ret.filter((issue) => (issue) => !Object.hasOwn(issue, "pull_request"));
			// const unblockedIssues = issuesOnly.filter((issue) =>
			// 	issue.labels.every((label) => !excludeLabels.includes(label.name)),
			// );

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
