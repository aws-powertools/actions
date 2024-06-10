/**
 * Retrieves a list of PRs from a repository sorted by `reactions-+1` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<PopularFeatureRequest[]>} A promise resolving with an array of issue objects.
 *
 */
export function getTopFeatureRequests(options?: {
    github: GitHub;
}): Promise<PopularFeatureRequest[]>;
/**
 * Retrieves a list of issues from a repository sorted by `comments` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<HighlyCommentedIssue>>} A promise resolving with an array of issue objects.
 *
 */
export function getTopMostCommented(options?: {
    github: GitHub;
}): Promise<Array<HighlyCommentedIssue>>;
/**
 * Retrieves a list of oldest issues from a repository sorted by `created` keyword, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<OldestIssue>>} A promise resolving with an array of issue objects.
 */
export function getTopOldestIssues(options?: {
    github: GitHub;
}): Promise<Array<OldestIssue>>;
import { GitHub } from "@aws-powertools-actions/github";
//# sourceMappingURL=functions.d.mts.map