export const githubRepository = process.env.GITHUB_REPOSITORY; // aws-powertools/actions
export const githubUrl = process.env.GITHUB_SERVER_URL; // https://github.com
export const actionRunId = process.env.GITHUB_RUN_ID;

export function getWorkflowRunUrl() {
	if (isGitHubAction()) {
		return `${githubUrl}/${githubRepository}/actions/runs/${actionRunId}`;
	}
	return "";
}

export function isGitHubAction() {
	return process.env.GITHUB_ACTION;
}
