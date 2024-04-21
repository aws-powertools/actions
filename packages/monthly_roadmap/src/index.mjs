import { BLOCKED_LABELS, DEFAULT_EMPTY_RESPONSE } from "./constants.mjs";

import { getWorkflowRunUrl, isGitHubAction } from "github_actions/src/functions.mjs";
import { listPullRequests } from "github_pull_requests/src/pull_requests.mjs";
import { diffInDaysFromToday } from "../../date_utils/src/date_diff.mjs";
import { formatISOtoLongDate } from "../../date_utils/src/formatter.mjs";
import { createOrUpdateIssue, listIssues } from "../../github_issues/src/issues.mjs";
import { buildMarkdownTable } from "../../markdown/src/builder.mjs";
import { TopFeatureRequest } from "./TopFeatureRequests.mjs";
import { TopMostCommented } from "./TopMostCommented.mjs";
import { TopOldest } from "./TopOldest.mjs";
import {
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "./constants.mjs";

/**
 * Retrieves a list of PRs from a repository sorted by `reactions-+1` keyword.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @typedef {Object} Response
 * @property {string} title - The title of the issue, with a link to the issue.
 * @property {string} created_at - The creation date of the issue, formatted as April 5, 2024.
 * @property {number} reaction_count - The total number of reactions on the issue.
 * @property {string} labels - The labels of the issue, enclosed in backticks.
 * @returns {Promise<TopFeatureRequest[]>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopFeatureRequests({ github, context, core }) {
	core.info("Fetching most popular feature requests");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: TOP_FEATURE_REQUESTS_LIMIT,
		sortBy: "reactions-+1",
		labels: [FEATURE_REQUEST_LABEL],
		direction: "desc",
	});

	return issues.map((issue) => new TopFeatureRequest(issue));
}

/**
 * Retrieves a list of issues from a repository sorted by `comments` keyword.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @typedef {Object} Response
 * @property {string} title - The title of the issue, with a link to the issue.
 * @property {string} created_at - The creation date of the issue, formatted as April 5, 2024.
 * @property {number} comment_count - The total number of comments in the issue.
 * @property {string} labels - The labels of the issue, enclosed in backticks.
 * @returns {Promise<Array<TopMostCommented>>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopMostCommented({ github, context, core }) {
	core.info("Fetching most commented issues");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: TOP_MOST_COMMENTED_LIMIT,
		sortBy: "comments",
		direction: "desc",
	});

	return issues.map((issue) => new TopMostCommented(issue));
}

/**
 * Retrieves a list of oldest issues from a repository sorted by `created` keyword, excluding blocked labels.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 *
 * @typedef {Object} Response
 * @property {string} title - The title of the issue, with a link to the issue.
 * @property {string} created_at - The creation date of the issue, formatted as April 5, 2024.
 * @property {number} last_update - Number of days since the last update.
 * @property {string} labels - The labels of the issue, enclosed in backticks.
 * @returns {Promise<Array<TopOldest>>} A promise resolving with an array of issue objects.
 */
export async function getTopOldestIssues({ github, context, core }) {
	core.info("Fetching issues sorted by creation date");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: TOP_OLDEST_LIMIT,
		sortBy: "created",
		direction: "asc",
		excludeLabels: BLOCKED_LABELS,
	});

	return issues.map((issue) => new TopOldest(issue));
}

/**
 * Retrieves a list of long running pull requests from a repository, excluding blocked labels.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 *
 * @typedef {Object} Response
 * @property {string} title - The title of the PR, with a link to the PR.
 * @property {string} created_at - The creation date of the PR, formatted as April 5, 2024.
 * @property {number} last_update - Number of days since the last update.
 * @property {string} labels - The labels of the PR, enclosed in backticks.
 * @returns {Promise<Array<Response>>} A promise resolving with an array of PR objects.
 */
export async function getLongRunningPRs({ github, context, core }) {
	core.info("Fetching PRs sorted by long-running");

	const prs = await listPullRequests({
		github,
		context,
		core,
		limit: 3,
		sortBy: "long-running",
		direction: "desc",
		excludeLabels: BLOCKED_LABELS,
	});

	return prs.map((pr) => {
		return {
			title: `[${pr.title}](${pr.html_url})`,
			created_at: formatISOtoLongDate(pr.created_at),
			last_update: `${diffInDaysFromToday(pr.updated_at)} days`,
			pending_reviewers: `${pr.requested_reviewers.map((person) => person.login).join("<br>")}`,
			labels: `${pr.labels.map((label) => `\`${label.name}\``).join("<br>")}`, // enclose each label with `<label>` for rendering
		};
	});
}

/**
 * Creates a monthly roadmap issue report with top PFRs, most active issues, and stale requests.
 *
 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @returns {Promise<void>} A promise resolving when the issue is created.
 *
 */
export async function createMonthlyRoadmapReport({ github, context, core }) {
	core.info("Fetching GitHub data concurrently");

	const [
		{ value: featureRequests = DEFAULT_EMPTY_RESPONSE },
		{ value: longRunningPRs = DEFAULT_EMPTY_RESPONSE },
		{ value: oldestIssues = DEFAULT_EMPTY_RESPONSE },
		{ value: mostActiveIssues = DEFAULT_EMPTY_RESPONSE },
	] = await Promise.allSettled([
		getTopFeatureRequests({ github, context, core }),
		getLongRunningPRs({ github, context, core }),
		getTopOldestIssues({ github, context, core }),
		getTopMostCommented({ github, context, core }),
	]);

	const tables = {
		featureRequests: buildMarkdownTable(featureRequests),
		mostActiveIssues: buildMarkdownTable(mostActiveIssues),
		longRunningPRs: buildMarkdownTable(longRunningPRs),
		oldestIssues: buildMarkdownTable(oldestIssues),
	};

	const body = `
Quick report of top 3 issues/PRs to assist in roadmap updates. Issues or PRs with the following labels are excluded:

* \`do-not-merge\`
* \`need-rfc\`
* \`need-issue\`
* \`need-customer-feedback\`

> **NOTE**: It does not guarantee they will be in the roadmap. Some might already be and there might be a blocker.

## Top 3 Feature Requests

${tables.featureRequests}

## Top 3 Most Commented Issues

${tables.mostActiveIssues}

## Top 3 Long Running Pull Requests

${tables.longRunningPRs}

## Top 3 Oldest Issues

${tables.oldestIssues}

${isGitHubAction() ? `> workflow: ${getWorkflowRunUrl()}` : ""}
  `;

	core.info("Creating issue with monthly roadmap report");

	const MONTH = new Date().toLocaleString("default", { month: "long" });
	const issueTitle = `Roadmap update reminder - ${MONTH}`;
	const searchParams = `is:issue in:title state:open repo:${context.repo.owner}/${context.repo.repo}`;
	const searchQuery = `${issueTitle} ${searchParams}`;

	const ret = await createOrUpdateIssue({ github, context, core, title: issueTitle, searchQuery, body });

	await core.summary
		.addHeading("Monthly roadmap reminder created")
		.addLink("View monthly report", ret.data.html_url)
		.write();

	return ret;
}

/** @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments */
export default async function main({ github, context, core }) {
	return await createMonthlyRoadmapReport({ github, context, core });
}
