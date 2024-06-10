/**
 * Retrieves a list of long-running pull requests from a repository, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @param {number} [options.minDaysWithoutUpdate=7] - Minimum number of days since last update
 * @returns {Promise<Array<LongRunningPullRequest>>} A promise resolving with an array of PR objects.
 */
export function getLongRunningPRs(options?: {
    github: GitHub;
    minDaysWithoutUpdate?: number;
}): Promise<Array<LongRunningPullRequest>>;
import { GitHub } from "@aws-powertools-actions/github";
//# sourceMappingURL=functions.d.mts.map