// NOTE: if we ever need tree-shaking we should get rid of this barrel
export {
	buildIssues,
	buildSearchIssues,
} from "./issues.mjs";

export { buildPullRequests } from "./pull_requests.mjs";

export { buildGitHubActionsClient } from "./github_actions.mjs";

export {
	buildLongRunningPullRequests,
	buildTopFeatureRequests,
	buildTopMostCommented,
	buildTopOldestIssues,
} from "./reporting.mjs";
