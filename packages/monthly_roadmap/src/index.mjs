import { getWorkflowRunUrl, isGitHubAction } from "github_actions/src/functions.mjs";
import { createOrUpdateIssue } from "../../github_issues/src/issues.mjs";
import { buildMarkdownTable } from "../../markdown/src/builder.mjs";
import { TopFeatureRequest } from "./TopFeatureRequests.mjs";
import { TopLongRunning } from "./TopLongRunningPullRequest.mjs";
import { TopMostCommented } from "./TopMostCommented.mjs";
import { TopOldest } from "./TopOldest.mjs";
import {
	BLOCKED_LABELS,
	DEFAULT_EMPTY_RESPONSE,
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_LONG_RUNNING_PR_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "./constants.mjs";

import { PULL_REQUESTS_SORT_BY } from "github_pull_requests/src/constants.mjs";
import { Github } from "../../github/src/Github.mjs";
import { ISSUES_SORT_BY } from "../../github_issues/src/constants.mjs";

/**
 * Retrieves a list of PRs from a repository sorted by `reactions-+1` keyword.
 *
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @returns {Promise<TopFeatureRequest[]>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopFeatureRequests(options = {}) {
	const github = options.github || new Github();

	github.core.info("Fetching most popular feature requests");

	const issues = await github.listIssues({
		limit: TOP_FEATURE_REQUESTS_LIMIT,
		sortBy: ISSUES_SORT_BY.REACTION_PLUS_1,
		labels: [FEATURE_REQUEST_LABEL],
		direction: "desc",
	});

	return issues.map((issue) => new TopFeatureRequest(issue));
}

/**
 * Retrieves a list of issues from a repository sorted by `comments` keyword.
 *
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @returns {Promise<Array<TopMostCommented>>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopMostCommented(options = {}) {
	const github = options.github || new Github();

	github.core.info("Fetching most commented issues");

	const issues = await github.listIssues({
		limit: TOP_MOST_COMMENTED_LIMIT,
		sortBy: ISSUES_SORT_BY.COMMENTS,
		direction: "desc",
	});

	return issues.map((issue) => new TopMostCommented(issue));
}

/**
 * Retrieves a list of oldest issues from a repository sorted by `created` keyword, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @returns {Promise<Array<TopOldest>>} A promise resolving with an array of issue objects.
 */
export async function getTopOldestIssues(options = {}) {
	const github = options.github || new Github();

	github.core.info("Fetching issues sorted by creation date");

	const issues = await github.listIssues({
		limit: TOP_OLDEST_LIMIT,
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		excludeLabels: BLOCKED_LABELS,
	});

	return issues.map((issue) => new TopOldest(issue));
}

/**
 * Retrieves a list of long running pull requests from a repository, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {Github} options.github - A Github client instance.
 * @returns {Promise<Array<TopLongRunning>>} A promise resolving with an array of PR objects.
 */
export async function getLongRunningPRs(options = {}) {
	const github = options.github || new Github();

	github.core.info("Fetching PRs sorted by long-running");

	const prs = await github.listPullRequests({
		limit: TOP_LONG_RUNNING_PR_LIMIT,
		sortBy: PULL_REQUESTS_SORT_BY.LONG_RUNNING,
		direction: "desc",
		excludeLabels: BLOCKED_LABELS,
	});

	return prs.map((pr) => new TopLongRunning(pr));
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
