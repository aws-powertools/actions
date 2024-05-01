import { GitHub } from "github/src/client";
import { ISSUES_SORT_BY } from "github/src/constants.mjs";
import {
	BLOCKED_LABELS,
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "../constants.mjs";
import { HighlyCommentedIssue, OldestIssue, PopularFeatureRequest } from "../models";

/**
 * Retrieves a list of PRs from a repository sorted by `reactions-+1` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<PopularFeatureRequest[]>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopFeatureRequests(options = {}) {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching most popular feature requests");

	const issues = await github.listIssues({
		limit: TOP_FEATURE_REQUESTS_LIMIT,
		sortBy: ISSUES_SORT_BY.REACTION_PLUS_1,
		labels: [FEATURE_REQUEST_LABEL],
		direction: "desc",
	});

	return issues.map((issue) => new PopularFeatureRequest(issue));
}

/**
 * Retrieves a list of issues from a repository sorted by `comments` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<HighlyCommentedIssue>>} A promise resolving with an array of issue objects.
 *
 */
export async function getTopMostCommented(options = {}) {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching most commented issues");

	const issues = await github.listIssues({
		limit: TOP_MOST_COMMENTED_LIMIT,
		sortBy: ISSUES_SORT_BY.COMMENTS,
		direction: "desc",
	});

	return issues.map((issue) => new HighlyCommentedIssue(issue));
}

/**
 * Retrieves a list of oldest issues from a repository sorted by `created` keyword, excluding blocked labels.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<OldestIssue>>} A promise resolving with an array of issue objects.
 */
export async function getTopOldestIssues(options = {}) {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching issues sorted by creation date");

	const issues = await github.listIssues({
		limit: TOP_OLDEST_LIMIT,
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		excludeLabels: BLOCKED_LABELS,
	});

	return issues.map((issue) => new OldestIssue(issue));
}
