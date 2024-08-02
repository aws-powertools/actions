import { LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD } from "@aws-powertools-actions/github/constants";
import { BLOCKED_LABELS } from "../constants.mjs";
import { Table, UnorderedList } from "../markdown/index.mjs";
import {
	BugIssue,
	LongRunningPullRequest,
	MilestoneIssue,
	PendingReleaseIssue,
	UntriagedIssue,
} from "../models/index.mjs";
import { BaseTemplate } from "./base.mjs";

export class WeeklyRoadmapTemplate extends BaseTemplate {
	/**
	 *
	 * @param {Object} options - Config.
	 * @param {UntriagedIssue[]} [options.untriagedIssues] - List of untriaged issues.
	 * @param {BugIssue[]} [options.bugIssues] - List of bug issues.
	 * @param {LongRunningPullRequest[]} [options.longRunningPRs] - List of long-running pull requests.
	 * @param {PendingReleaseIssue[]} [options.pendingReleaseIssues] - List of most commented issues.
	 * @param {MilestoneIssue[]} [options.prioritaryMilestoneIssues] - List of most commented issues.
	 * @property {string} [title] - Issue title.
	 */
	constructor(options = {}) {
		super(options);
		this.untriagedIssues = options.untriagedIssues || [];
		this.bugIssues = options.bugIssues || [];
		this.longRunningPRs = options.longRunningPRs || [];
		this.pendingRelease = options.pendingReleaseIssues || [];
		this.prioritaryMilestoneIssues = options.prioritaryMilestoneIssues || [];
	}

	/**
	 * Builds the body for the monthly roadmap reminder issue.
	 *
	 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
	 *
	 * @returns {string} Issue body formatted in GitHub Markdown
	 */
	build() {
		const firstThreePrioritaryMilestoneIssues = this.prioritaryMilestoneIssues.slice(0, 3);
		const remainingPrioritaryMilestoneIssues = this.prioritaryMilestoneIssues.slice(3);

		// biome-ignore format: GitHub Markdown sensitive to indentation
		return `
Quick report of top 3 issues/PRs to assist in roadmap updates. Issues or PRs with the following labels are excluded:

${UnorderedList.fromArray(BLOCKED_LABELS)}

> **NOTE**: It does not guarantee they will be in the roadmap. Some might already be and there might be a blocker.

## Untriaged Issues

${Table.fromKeyValueObjects(this.untriagedIssues)}

## Top Bug Issues

${Table.fromKeyValueObjects(this.bugIssues)}

## Top Long Running Pull Requests

Pull Requests updated in the last ${LONG_RUNNING_WITHOUT_UPDATE_THRESHOLD} days are excluded.

${Table.fromKeyValueObjects(this.longRunningPRs)}

## Items pending release

${Table.fromKeyValueObjects(this.pendingRelease)}

## Prioritary Milestone Issues

${Table.fromKeyValueObjects(firstThreePrioritaryMilestoneIssues)}

<details>

<summary>Remaining Prioritary Milestone Issues</summary>

${Table.fromKeyValueObjects(remainingPrioritaryMilestoneIssues)}

</details>

${this.footer}
`;
	}
}
