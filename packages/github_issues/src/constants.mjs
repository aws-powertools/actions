export const MAX_ISSUES_PER_PAGE = 30;
export const MAX_ISSUES_LIMIT = 10;

/** Sorting options for issues.
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28
 */
export const ISSUES_SORT_BY = {
	CREATED: "created",
	UPDATED: "updated",
	COMMENTS: "comments",
	REACTION_PLUS_1: "reactions-+1", // Official API docs are out of date but sorting works
};
