import { LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD } from "@aws-powertools-actions/github/constants";
import { BLOCKED_LABELS } from "../constants.mjs";
import { Table, UnorderedList } from "../markdown/index.mjs";
import { HighlyCommentedIssue, LongRunningPullRequest, OldestIssue, PopularFeatureRequest } from "../models/index.mjs";
import { BaseTemplate } from "./base.mjs";

export class MonthlyRoadmapTemplate extends BaseTemplate {
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
		super(options);
		this.featureRequests = options.featureRequests || [];
		this.longRunningPRs = options.longRunningPRs || [];
		this.oldestIssues = options.oldestIssues || [];
		this.mostActiveIssues = options.mostActiveIssues || [];
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

Pull Requests updated in the last ${LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD} days are excluded.

${Table.fromKeyValueObjects(this.longRunningPRs)}

## Top Oldest Issues

${Table.fromKeyValueObjects(this.oldestIssues)}

${this.footer}
`;
	}
}
