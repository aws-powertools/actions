import { pullRequestSchema } from "github/src/schemas/pull_requests.js";
import { z } from "zod";
import { MAX_PULL_REQUESTS_LIMIT, MAX_PULL_REQUESTS_PER_PAGE } from "./constants.mjs";

/**
 * List Pull Requests
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
 * @param {("created" | "updated" | "popularity" | "long-running")} [options.sortBy] - Sort results by
 * @param {number} [options.limit] - Max number of pull requests to return (default 10)
 * @param {number} [options.pageSize] - Pagination size for each List Pull Requests API call (max 100)
 * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
 * @param {string[]} [options.excludeLabels] - Exclude pull requests containing these labels
 * @param {("open" | "closed" | "all")} [options.state="open"] - Limit listing to pull requests in these state
 *
 * @returns {Promise<z.infer<typeof pullRequestSchema>[]>}
 */
export async function listPullRequests({
	github,
	context,
	core,
	sortBy,
	limit = MAX_PULL_REQUESTS_LIMIT,
	pageSize = MAX_PULL_REQUESTS_PER_PAGE,
	direction = "asc",
	excludeLabels = [],
	state = "open",
}) {
	let prs = [];

	try {
		core.info(`Listing pull requests. Sorted by:'${sortBy}', Excluding labels: '${excludeLabels}', Limit: ${limit}`);

		for await (const { data: ret } of github.paginate.iterator(github.rest.pulls.list, {
			owner: context.repo.owner,
			repo: context.repo.repo,
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

		core.debug(prs);

		return prs;
	} catch (error) {
		core.error(`Unable to list pull requests. Error: ${error}`);
		throw error;
	}
}
