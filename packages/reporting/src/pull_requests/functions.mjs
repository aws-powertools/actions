import { GitHub } from "@aws-powertools-actions/github";
import { LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD, PULL_REQUESTS_SORT_BY } from "@aws-powertools-actions/github/constants";
import { BLOCKED_LABELS, TOP_LONG_RUNNING_PR_LIMIT } from "../constants.mjs";
import { LongRunningPullRequest } from "../models";

/**
 * Retrieves a list of long-running pull requests from a repository, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @param {number} [options.minDaysWithoutUpdate=7] - Minimum number of days since last update
 * @returns {Promise<Array<LongRunningPullRequest>>} A promise resolving with an array of PR objects.
 */
export async function getLongRunningPRs(options = {}) {
	const { github = new GitHub({}), minDaysWithoutUpdate = LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD } = options;

	github.logger.info("Fetching PRs sorted by long-running");

	const prs = await github.listPullRequests({
		limit: TOP_LONG_RUNNING_PR_LIMIT,
		sortBy: PULL_REQUESTS_SORT_BY.LONG_RUNNING,
		direction: "desc",
		excludeLabels: BLOCKED_LABELS,
		minDaysWithoutUpdate: minDaysWithoutUpdate,
	});

	return prs.map((pr) => new LongRunningPullRequest(pr));
}
