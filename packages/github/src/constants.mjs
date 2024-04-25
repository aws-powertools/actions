export const MAX_ISSUES_PER_PAGE = 30;
export const MAX_ISSUES_LIMIT = 10;
export const MAX_PULL_REQUESTS_LIMIT = 10;
export const MAX_PULL_REQUESTS_PER_PAGE = 30;
export const SERVICE_NAME = "powertools-github";

/** Sorting options for Pull Requests.
 * API: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28
 */
export const PULL_REQUESTS_SORT_BY = {
	CREATED: "created",
	UPDATED: "updated",
	/**
	 * Sort by number of comments
	 */
	POPULARITY: "popularity",
	/**
	 * Sort by creation and PRs that have been opened more than a month
	 * and had activity within the past month
	 */
	LONG_RUNNING: "long-running",
};

/** Sorting options for issues.
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28
 */
export const ISSUES_SORT_BY = {
	CREATED: "created",
	UPDATED: "updated",
	COMMENTS: "comments",
	REACTION_PLUS_1: "reactions-+1", // Official API docs are out of date but sorting works
};
