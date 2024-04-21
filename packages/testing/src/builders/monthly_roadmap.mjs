import { TopFeatureRequest } from "../../../monthly_roadmap/src/TopFeatureRequests.mjs";
import { TopMostCommented } from "../../../monthly_roadmap/src/TopMostCommented.mjs";
import { TopOldest } from "../../../monthly_roadmap/src/TopOldest.mjs";
import { issueSchema } from "../../../schemas/src/issue_schema.mjs";
import { TopLongRunning } from "../../../monthly_roadmap/src/TopLongRunningPullRequest.mjs";

/**
 * Builds an array of top feature requests from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top feature requests issues.
 * @returns {TopFeatureRequest[]} Feature requests - An array of top feature requests.
 */
export function buildTopFeatureRequests(issues) {
	return issues.map((issue) => new TopFeatureRequest(issue));
}

/**
 * Builds an array of top commented issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top commented issues.
 * @returns {TopMostCommented[]} Most active issues - An array of top commented issues.
 */
export function buildTopMostCommented(issues) {
	return issues.map((issue) => new TopMostCommented(issue));
}

/**
 * Builds an array of top oldest issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top oldest issues.
 * @returns {TopOldest[]} Oldest issues - An array of top oldest issues.
 */
export function buildTopOldestIssues(issues) {
	return issues.map((issue) => new TopOldest(issue));
}

/**
 * Builds an array of top long running from GitHub pull requests
 * @param {z.infer<typeof issueSchema>[]} issues - Top long running.
 * @returns {TopLongRunning[]} Long running PRs - An array of top long running pull requests.
 */
export function buildLongRunningPullRequests(issues) {
	return issues.map((issue) => new TopLongRunning(issue));
}
