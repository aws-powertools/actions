import { issueSchema } from "github/src/schemas/issues.mjs";
import { HighlyCommentedIssue } from "reporting/src/models/HighlyCommentedIssue.mjs";
import { LongRunningPullRequest } from "reporting/src/models/LongRunningPullRequest.mjs";
import { OldestIssue } from "reporting/src/models/OldestIssue.mjs";
import { PopularFeatureRequest } from "reporting/src/models/PopularFeatureRequest.mjs";
import {MonthlyRoadmapTemplate} from "reporting/src/templates/MonthlyRoadmapTemplate.mjs";
import { z } from "zod";

/**
 * Builds an array of top feature requests from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top feature requests issues.
 * @returns {PopularFeatureRequest[]} Feature requests - An array of top feature requests.
 */
export function buildTopFeatureRequests(issues) {
	return issues.map((issue) => new PopularFeatureRequest(issue));
}

/**
 * Builds an array of top commented issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top commented issues.
 * @returns {HighlyCommentedIssue[]} Most active issues - An array of top commented issues.
 */
export function buildTopMostCommented(issues) {
	return issues.map((issue) => new HighlyCommentedIssue(issue));
}

/**
 * Builds an array of top oldest issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top oldest issues.
 * @returns {OldestIssue[]} Oldest issues - An array of top oldest issues.
 */
export function buildTopOldestIssues(issues) {
	return issues.map((issue) => new OldestIssue(issue));
}

/**
 * Builds an array of top long running from GitHub pull requests
 * @param {z.infer<typeof pullRequestSchema>[]} issues - Top long-running.
 * @returns {LongRunningPullRequest[]} Long running PRs - An array of top long running pull requests.
 */
export function buildLongRunningPullRequests(issues) {
	return issues.map((issue) => new LongRunningPullRequest(issue));
}

/**
 * Builds a monthly roadmap template with top feature requests, long-running pull requests, oldest issues, and most active issues.
 *
 * @param {Object} options - Config.
 * @param {z.infer<typeof pullRequestSchema>[]} options.longRunningPRs - List of long-running pull requests.
 * @param {z.infer<typeof issueSchema>[]} options.oldestIssues - List of oldest issues.
 * @param {z.infer<typeof issueSchema>[]} options.mostActiveIssues - List of most active issues.
 */
export function buildMonthlyRoadmapTemplate(options = {}) {
	const {
		featureRequests = [],
		longRunningPRs= [],
		oldestIssues= [],
		mostActiveIssues= [],
	} = options;
	
	return new MonthlyRoadmapTemplate({
		featureRequests: buildTopFeatureRequests(featureRequests),
		longRunningPRs: buildLongRunningPullRequests(longRunningPRs),
		oldestIssues: buildTopOldestIssues(oldestIssues),
		mostActiveIssues: buildTopMostCommented(mostActiveIssues),
	});
}
