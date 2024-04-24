export const githubRepository = process.env.GITHUB_REPOSITORY; // aws-powertools/actions
export const githubUrl = process.env.GITHUB_SERVER_URL; // https://github.com
export const actionRunId = process.env.GITHUB_RUN_ID;

// TODO: move to constants

export function getWorkflowRunUrl() {
	if (isGitHubAction()) {
		return `${githubUrl}/${githubRepository}/actions/runs/${actionRunId}`;
	}
	return "";
}

// TODO: proper boolean
export function isGitHubAction() {
	return process.env.GITHUB_ACTION;
}
