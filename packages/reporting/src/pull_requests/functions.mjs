import { GitHub } from "github/src/client/GitHub.mjs";
import { PULL_REQUESTS_SORT_BY } from "github/src/constants.mjs";
import { BLOCKED_LABELS, TOP_LONG_RUNNING_PR_LIMIT } from "../constants.mjs";
import { LongRunningPullRequest } from "../models/LongRunningPullRequest.mjs";

/**
 * Retrieves a list of long running pull requests from a repository, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<LongRunningPullRequest>>} A promise resolving with an array of PR objects.
 */
export async function getLongRunningPRs(options = {}) {
	const { github = new GitHub({}) } = options;

	github.core.info("Fetching PRs sorted by long-running");

	const prs = await github.listPullRequests({
		limit: TOP_LONG_RUNNING_PR_LIMIT,
		sortBy: PULL_REQUESTS_SORT_BY.LONG_RUNNING,
		direction: "desc",
		excludeLabels: BLOCKED_LABELS,
	});

	return prs.map((pr) => new LongRunningPullRequest(pr));
}
