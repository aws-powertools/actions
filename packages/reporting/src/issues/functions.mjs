import { GitHub } from "@aws-powertools-actions/github";
import { ISSUES_SORT_BY } from "@aws-powertools-actions/github/constants";
import {
	BLOCKED_LABELS,
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "../constants.mjs";
import {
	BugIssue,
	HighlyCommentedIssue,
	MilestoneIssue,
	OldestIssue,
	PendingReleaseIssue,
	PopularFeatureRequest,
	UntriagedIssue,
} from "../models";

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

/**
 * Retrieves a list of untriaged issues from a repository sorted by `created` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<UntriagedIssue>>} A promise resolving with an array of issue objects.
 */
export const getIssuesToTriage = async (options = {}) => {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching issues to triage");

	const issues = await github.listIssues({
		limit: 3,
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		labels: ["triage"],
		minDaysOld: 0,
	});

	return issues.map((issue) => new UntriagedIssue(issue));
};

/**
 * Retrieves a list of bug issues from a repository sorted by `created` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<BugIssue>>} A promise resolving with an array of issue objects.
 */
export const getBugIssues = async (options = {}) => {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching bug issues");

	const issues = await github.listIssues({
		limit: 3,
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		labels: ["bug"],
		excludeLabels: BLOCKED_LABELS,
		minDaysOld: 0,
	});

	return issues.map((issue) => new BugIssue(issue));
};

/**
 * Retrieves a list of issues marked as `pending-release` from a repository sorted by `created` keyword.
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @returns {Promise<Array<PendingReleaseIssue>>} A promise resolving with an array of issue objects.
 */
export const getPendingReleaseIssues = async (options = {}) => {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching pending release issues");

	const issues = await github.listIssues({
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		labels: ["pending-release"],
		minDaysOld: 0,
		state: "all",
	});

	return issues.map((issue) => new PendingReleaseIssue(issue));
};

/**
 * Retrieves a list of issues in a prioritary milestone sorted by `created` keyword.
 */
export const getIssuesInPrioritaryMilestone = async (options = {}) => {
	const { github = new GitHub({}) } = options;

	github.logger.info("Fetching issues in prioritary milestone");

	const milestones = await github.listMilestones({ state: "open" });

	const prioritaryMilestone = milestones.find((milestone) => milestone.title.toLowerCase().includes("(priority)"));

	if (!prioritaryMilestone) {
		return [];
	}

	const issues = await github.listIssues({
		sortBy: ISSUES_SORT_BY.CREATED,
		direction: "asc",
		milestone: prioritaryMilestone.number,
		minDaysOld: 0,
		minDaysWithoutUpdate: 0,
		limit: 999,
	});

	return issues.map((issue) => new MilestoneIssue(issue));
};
