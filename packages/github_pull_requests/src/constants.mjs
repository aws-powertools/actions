export const MAX_PULL_REQUESTS_PER_PAGE = 30;
export const MAX_PULL_REQUESTS_LIMIT = 10;

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
