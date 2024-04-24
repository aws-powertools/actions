import { GitHub } from "github/src/client";
import { getWorkflowRunUrl, isGitHubAction } from "github/src/functions.mjs";
import { DEFAULT_EMPTY_RESPONSE } from "./constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "./issues";
import { Table } from "./markdown/index.mjs";
import { getLongRunningPRs } from "./pull_requests";

/**
 * Creates a monthly roadmap issue report with top PFRs, most active issues, and stale requests.
 *
 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<void>} A promise resolving when the issue is created.
 *
 */
export async function createMonthlyRoadmapReport(options = {}) {
	const { github = new GitHub({}) } = options;

	github.core.info("Fetching GitHub data concurrently");

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

* \`do-not-merge\`
* \`need-rfc\`
* \`need-issue\`
* \`need-customer-feedback\`

> **NOTE**: It does not guarantee they will be in the roadmap. Some might already be and there might be a blocker.

## Top 3 Feature Requests

${featureRequestsTable}

## Top 3 Most Commented Issues

${mostCommentedTable}

## Top 3 Long Running Pull Requests

${longRunningPRsTable}

## Top 3 Oldest Issues

${oldestIssuesTable}

${isGitHubAction() ? `> workflow: ${getWorkflowRunUrl()}` : ""}
  `;

	github.core.info("Creating issue with monthly roadmap report");

	const MONTH = new Date().toLocaleString("en-US", { month: "long" });
	const issueTitle = `Roadmap update reminder - ${MONTH}`;
	const searchParams = `is:issue in:title state:open repo:${github.owner}/${github.repo}`;
	const searchQuery = `${issueTitle} ${searchParams}`;

	const ret = await github.createOrUpdateIssue({ github, title: issueTitle, searchQuery, body });

	await github.core.summary
		.addHeading("Monthly roadmap reminder created")
		.addLink("View monthly report", ret.html_url)
		.write();

	return ret;
}
