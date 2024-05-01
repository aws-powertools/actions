import { GitHubActions } from "github/src/client/index.mjs";
import { BLOCKED_LABELS } from "../constants.mjs";
import { Table, UnorderedList } from "../markdown/index.mjs";
import { HighlyCommentedIssue, LongRunningPullRequest, OldestIssue, PopularFeatureRequest } from "../models/index.mjs";

export class MonthlyRoadmapTemplate {
	#month;
	#actions;

	/**
	 *
	 * @param {Object} options - Config.
	 * @param {PopularFeatureRequest[]} [options.featureRequests] - List of feature requests.
	 * @param {LongRunningPullRequest[]} [options.longRunningPRs] - List of long-running pull requests.
	 * @param {OldestIssue[]} [options.oldestIssues] - List of oldest issues.
	 * @param {HighlyCommentedIssue[]} [options.mostActiveIssues] - List of most commented issues.
	 * @property {string} [title] - Issue title.
	 */
	constructor(options = {}) {
		this.featureRequests = options.featureRequests || [];
		this.longRunningPRs = options.longRunningPRs || [];
		this.oldestIssues = options.oldestIssues || [];
		this.mostActiveIssues = options.mostActiveIssues || [];
		this.#actions = new GitHubActions();
		this.#month = new Date().toLocaleString("en-US", { month: "long" });
		this.title = `Roadmap update reminder - ${this.#month}`;
	}

	get footer() {
		if (this.#actions.isGitHubActions) {
			return `> generated by: ${this.#actions.getWorkflowRunUrl()}`;
		}
		
		return ""
	}

	/**
	 * Builds the body for the monthly roadmap reminder issue.
	 *
	 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
	 *
	 * @returns {string} Issue body formatted in GitHub Markdown
	 */
	build() {
		// biome-ignore format: GitHub Markdown sensitive to indentation
		return `
Quick report of top 3 issues/PRs to assist in roadmap updates. Issues or PRs with the following labels are excluded:

${UnorderedList.fromArray(BLOCKED_LABELS)}

> **NOTE**: It does not guarantee they will be in the roadmap. Some might already be and there might be a blocker.

## Top Feature Requests

${Table.fromKeyValueObjects(this.featureRequests)}

## Top Most Commented Issues

${Table.fromKeyValueObjects(this.mostActiveIssues)}

## Top Long Running Pull Requests

${Table.fromKeyValueObjects(this.longRunningPRs)}

## Top Oldest Issues

${Table.fromKeyValueObjects(this.oldestIssues)}

${this.footer}
`;
	}
}
