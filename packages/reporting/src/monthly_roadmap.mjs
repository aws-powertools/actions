import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub, GitHubActions } from "github/src/client";
import { BLOCKED_LABELS, REPORT_ROADMAP_LABEL, SERVICE_NAME } from "./constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "./issues";
import { Table, UnorderedList } from "./markdown/index.mjs";
import { getLongRunningPRs } from "./pull_requests";

const DEFAULT_EMPTY_RESPONSE = [{}];

/**
 * Creates a monthly roadmap issue report with top PFRs, most active issues, and stale requests.
 *
 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @param {GitHubActions} options.actions - A GitHub Actions client instance.
 * @returns {Promise<void>} A promise resolving when the issue is created.
 *
 */
export async function createMonthlyRoadmapReport(options = {}) {
	const actions = options.actions || new GitHubActions();
	const logger = new Logger({
		serviceName: SERVICE_NAME,
		persistentLogAttributes: {
			eventName: actions.eventName,
			workflowName: actions.workflowName,
			repository: actions.repositoryFQDN,
			triggerCommit: actions.triggerCommitSha,
			triggerActor: actions.triggerActor,
			actionName: actions.actionName,
			jobName: actions.jobName,
		},
	});

	const github = options.github || new GitHub({ logger });

	logger.info("Fetching GitHub data concurrently");

	const [
		{ value: featureRequests = DEFAULT_EMPTY_RESPONSE },
		{ value: longRunningPRs = DEFAULT_EMPTY_RESPONSE },
		{ value: oldestIssues = DEFAULT_EMPTY_RESPONSE },
		{ value: mostActiveIssues = DEFAULT_EMPTY_RESPONSE },
	] = await Promise.allSettled([
		getTopFeatureRequests({ github }),
		getLongRunningPRs({ github }),
		getTopOldestIssues({ github }),
		getTopMostCommented({ github }),
	]);

	const featureRequestsTable = Table.fromKeyValueObjects(featureRequests);
	const mostCommentedTable = Table.fromKeyValueObjects(mostActiveIssues);
	const longRunningPRsTable = Table.fromKeyValueObjects(longRunningPRs);
	const oldestIssuesTable = Table.fromKeyValueObjects(oldestIssues);

	const body = `
Quick report of top 3 issues/PRs to assist in roadmap updates. Issues or PRs with the following labels are excluded:

${UnorderedList.fromArray(BLOCKED_LABELS)}

> **NOTE**: It does not guarantee they will be in the roadmap. Some might already be and there might be a blocker.

## Top Feature Requests

${featureRequestsTable}

## Top Most Commented Issues

${mostCommentedTable}

## Top Long Running Pull Requests

${longRunningPRsTable}

## Top Oldest Issues

${oldestIssuesTable}

${actions.isGitHubActions ? `> generated by: ${actions.getWorkflowRunUrl()}` : ""}
  `;

	logger.info("Creating issue with monthly roadmap report");

	const MONTH = new Date().toLocaleString("en-US", { month: "long" });
	const issueTitle = `Roadmap update reminder - ${MONTH}`;
	const searchParams = `is:issue in:title state:open repo:${github.owner}/${github.repo}`;
	const searchQuery = `${issueTitle} ${searchParams}`;

	const ret = await github.createOrUpdateIssue({
		github,
		title: issueTitle,
		searchQuery,
		body,
		labels: [REPORT_ROADMAP_LABEL],
	});

	await actions.core.summary
		.addHeading("Monthly roadmap reminder created")
		.addLink("View monthly report", ret.html_url)
		.write();

	return ret;
}
