const DEFAULT_EMPTY_RESPONSE = [{}];
const MONTH = new Date().toLocaleString("default", { month: "long" });
const BLOCKED_LABELS = ["do-not-merge", "need-issue", "need-rfc", "need-customer-feedback"];

import { createOrUpdateIssue, listIssues } from "../../github_utils/src/issues.mjs";
import { listPullRequests } from "../../github_utils/src/pull_requests.mjs";
import { getWorkflowRunUrl, isGitHubAction } from "../../github_utils/src/actions.mjs";

/**
 * Calculate the difference in days between the current date and a given datetime.
 *
 * @param {string} datetime - The datetime string to calculate the difference from.
 * @returns {number} - The difference in days between the current date and the given datetime.
 */
const diffInDays = (datetime) => {
	const diff_in_ms = new Date() - new Date(datetime);

	// ms(1000)->seconds(60)->minutes(60)->hours(24)->days
	return Math.floor(diff_in_ms / (1000 * 60 * 60 * 24));
};

/**
 * Formats a datetime string into a localized human date string e.g., April 5, 2024.
 *
 * @param {string} datetime - The datetime string to format.
 * @returns {string} The formatted date string.
 *
 * @example
 * const datetime = "2022-01-01T12:00:00Z";
 * console.log(formatDate(datetime)); // April 5, 2024
 */
export const formatDate = (datetime) => {
	const date = new Date(datetime);
	return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
};

/**
 * Generates a markdown table from an array of key:value object.
 *
 * This function takes an array of objects as input and generates a markdown table with the keys as column headings and the values as rows.
 *
 * @param {Array<Object>} data - The data to generate the table from.
 * @returns {Object} An object containing the formatted table components.
 *   - heading: The formatted column headings of the table.
 *   - dashes: The formatted dashed line separating the headings from the rows.
 *   - rows: The formatted rows of the table.
 *
 * @example
 * const data = [
 *   { name: 'John', age: 30, city: 'New York' },
 *   { name: 'Jane', age: 25, city: 'London' },
 *   { name: 'Bob', age: 35, city: 'Paris' }
 * ];
 *
 * const table = buildMarkdownTable(data);
 * console.log(table.heading); // '| name | age | city |'
 * console.log(table.dashes); // '| ---- | --- | ---- |'
 * console.log(table.rows); // '| John | 30  | New York |'
 */
const buildMarkdownTable = (data) => {
	const keys = Object.keys(data[0]);

	if (keys.length === 0) {
		return "Not available";
	}

	const formatted_headings = `${keys.join(" | ")}`;
	const keyLength = keys[0]?.length || 0;
	const dashes = keys.map(() => `${"-".repeat(keyLength)} |`).join(" ");

	const values = data.map((issues) => Object.values(issues));
	const rows = values.map((row) => `${row.join(" | ")} |`).join("\n");

	return `${formatted_headings}
${dashes}
${rows}`;
};

/**
 * Retrieves a list of PRs from a repository sorted by `reactions-+1` keyword.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @typedef {Object} Response
 * @property {string} title - The title of the issue, with a link to the issue.
 * @property {string} created_at - The creation date of the issue, formatted as April 5, 2024.
 * @property {number} reaction_count - The total number of reactions on the issue.
 * @property {string} labels - The labels of the issue, enclosed in backticks.
 * @returns {Promise<Array<Response>>} A promise resolving with an array of issue objects.
 *
 */
async function getTopFeatureRequests({ github, context, core }) {
	core.info("Fetching most popular feature requests");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: 3,
		sortBy: "reactions-+1",
		labels: ["feature-request"],
		direction: "desc",
	});

	return issues.map((issue) => ({
		title: `[${issue.title}](${issue.html_url})`,
		created_at: formatDate(issue.created_at),
		reaction_count: issue.reactions.total_count,
		labels: `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`, // enclose each label with `<label>` for rendering
	}));
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
 * @returns {Promise<Array<Response>>} A promise resolving with an array of issue objects.
 *
 */
async function getTopMostCommented({ github, context, core }) {
	core.info("Fetching most commented issues");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: 3,
		sortBy: "comments",
		direction: "desc",
	});

	return issues.map((issue) => ({
		title: `[${issue.title}](${issue.html_url})`,
		created_at: formatDate(issue.created_at),
		comment_count: issue.comments,
		labels: `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`, // enclose each label with `<label>` for rendering
	}));
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
 * @returns {Promise<Array<Response>>} A promise resolving with an array of issue objects.
 */
async function getTopOldestIssues({ github, context, core }) {
	core.info("Fetching issues sorted by creation date");
	const issues = await listIssues({
		github,
		context,
		core,
		limit: 3,
		sortBy: "created",
		direction: "asc",
		excludeLabels: BLOCKED_LABELS,
	});

	return issues.map((issue) => {
		return {
			title: `[${issue.title}](${issue.html_url})`,
			created_at: formatDate(issue.created_at),
			last_update: `${diffInDays(issue.updated_at)} days`,
			labels: `${issue.labels.map((label) => `\`${label.name}\``).join("<br>")}`, // enclose each label with `<label>` for rendering
		};
	});
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
async function getLongRunningPRs({ github, context, core }) {
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
			created_at: formatDate(pr.created_at),
			last_update: `${diffInDays(pr.updated_at)} days`,
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

	const issueTitle = `Roadmap update reminder - ${MONTH}`;
	const searchParams = `is:issue in:title state:open repo:${context.repo.owner}/${context.repo.repo}`;
	const searchQuery = `${issueTitle} ${searchParams}`;

	const ret = await createOrUpdateIssue({ github, context, core, searchQuery, body, title: issueTitle });

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
