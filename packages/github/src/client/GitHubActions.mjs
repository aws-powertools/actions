import * as core from "@actions/core";

export class GitHubActions {
	#baseURL;

	/**
	 * Constructs a new instance of a GitHub client.
	 *
	 * @param {Object} [options={}] - The configuration options for the GitHub client.
	 * @param {boolean} [options.debug=false] - Flag indicating whether debug mode is enabled.
	 * @param {core} [options.core] - The GitHub Actions core instance.
	 */
	constructor(options = {}) {
		this.core = options.core || core;
		this.isGitHubActions = Boolean(process.env.GITHUB_ACTIONS);
		this.actionName = process.env.GITHUB_ACTION | "";
		this.eventName = process.env.GITHUB_EVENT_NAME || "";
		this.jobName = process.env.GITHUB_JOB || "";
		this.jobId = process.env.GITHUB_RUN_ID || "";
		this.triggerCommitSha = process.env.GITHUB_SHA || "";
		this.triggerActor = process.env.GITHUB_TRIGGERING_ACTOR || "";
		this.workflowName = process.env.GITHUB_WORKFLOW || "";
		this.repositoryFQDN = process.env.GITHUB_REPOSITORY || "";
		this.#baseURL = process.env.GITHUB_SERVER_URL; // https://github.com
		this.debug = Boolean(process.env.RUNNER_DEBUG);
	}

	getWorkflowRunUrl() {
		if (this.isGitHubActions) {
			return `${this.#baseURL}/${this.repositoryFQDN}/actions/runs/${this.jobId}`;
		}
		return "";
	}
}
