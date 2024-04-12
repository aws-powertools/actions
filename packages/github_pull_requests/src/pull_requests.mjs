/**
 * List Pull Requests
 *
 * @typedef {import('@octokit/types').OctokitResponse} Issue
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @returns {Promise<Issue[]>} - List of PRs
 */
export async function listPullRequests({
	github,
	context,
	core,
	sortBy,
	limit = 10,
	direction = "asc",
	excludeLabels = [],
}) {
	let prs = [];

	try {
		core.info(`Listing pull requests. Sorted by:'${sortBy}', Excluding labels: '${excludeLabels}', Limit: ${limit}`);

		for await (const { data: ret } of github.paginate.iterator(github.rest.pulls.list, {
			owner: context.repo.owner,
			repo: context.repo.repo,
			state: "open",
			sort: sortBy,
			direction,
			per_page: 30,
		})) {
			const pullRequestOnly = ret.filter((pr) => pr.labels.every((label) => !excludeLabels.includes(label.name)));

			prs.push(...pullRequestOnly);

			if (prs.length >= limit) {
				prs = prs.slice(0, limit);
				break;
			}
		}

		core.debug(prs);

		return prs;
	} catch (error) {
		core.error(`Unable to list pull requests. Error: ${error}`);
		throw error;
	}
}
