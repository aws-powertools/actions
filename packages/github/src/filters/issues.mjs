import { issueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";
import { getDateWithDaysDelta } from "../functions.mjs";

/**
 * Filters issues based on the minimum number of days since the issue was created.
 * @param {z.infer<typeof issueSchema>[]} issues - An array of issues.
 * @param {number} [minDaysOld] - The minimum number of days since the issue was created.
 * @returns {z.infer<typeof issueSchema>[]} - The filtered array of issues.
 * @example
 * const issues = [
 *   { id: 1, created_at: '2024-04-01T00:00:00Z' },
 *   { id: 2, created_at: '2024-03-01T00:00:00Z' },
 *   { id: 3, created_at: '2024-02-01T00:00:00Z' },
 * ];
 *
 * const issuesOlderThan30Days = filterByMinDaysOld(issues, 30);
 * console.log(issuesOlderThan30Days);
 * // Output: [
 * //   { id: 2, created_at: '2024-03-01T00:00:00Z' },
 * //   { id: 3, created_at: '2024-02-01T00:00:00Z' },
 * // ]
 */
export function filterByMinDaysOld(issues, minDaysOld) {
	if (typeof minDaysOld !== "number" || minDaysOld <= 0) {
		return issues;
	}

	const minCreatedAt = getDateWithDaysDelta(-minDaysOld);

	return issues.filter((pr) => {
		const createdAt = new Date(pr.created_at);
		return createdAt <= minCreatedAt;
	});
}

/**
 * Filters issues based on the minimum number of days since the issue was last updated.
 * @param {z.infer<typeof issueSchema>[]} issues - An array of issues.
 * @param {number} [minDaysWithoutUpdate] - The minimum number of days since the issue was last updated.
 * @returns {z.infer<typeof issueSchema>[]} - The filtered array of issues.
 * @example
 * const issues = [
 *   { id: 1, updated_at: '2024-04-01T00:00:00Z' },
 *   { id: 2, updated_at: '2024-03-01T00:00:00Z' },
 *   { id: 3, updated_at: '2024-02-01T00:00:00Z' },
 * ];
 *
 * const issuesUntouchedFor30DaysOrMore = filterByMinDaysWithoutUpdate(issues, 30);
 * console.log(issuesUntouchedFor30DaysOrMore);
 * // Output: [
 * //   { id: 2, updated_at: '2024-03-01T00:00:00Z' },
 * //   { id: 3, updated_at: '2024-02-01T00:00:00Z' },
 * // ]
 */
export function filterByMinDaysWithoutUpdate(issues, minDaysWithoutUpdate) {
	if (typeof minDaysWithoutUpdate !== "number" || minDaysWithoutUpdate <= 0) {
		return issues;
	}

	const minUpdatedAt = getDateWithDaysDelta(-minDaysWithoutUpdate);

	return issues.filter((pr) => {
		const updatedAt = new Date(pr.updated_at);
		return updatedAt <= minUpdatedAt;
	});
}

/**
 * Filters issues based on excluded labels.
 * @param {z.infer<typeof issueSchema>[]} issues - An array of issues.
 * @param {string[]} excludeLabels - An array of label names to exclude from the results.
 * @returns {z.infer<typeof issueSchema>[]} - The filtered array of issues.
 * @example
 * const issues = [
 *   { id: 1, labels: [{ name: 'wip' }, { name: 'bug' }] },
 *   { id: 2, labels: [{ name: 'enhancement' }, { name: 'help-wanted' }] },
 *   { id: 3, labels: [{ name: 'wip' }, { name: 'documentation' }] },
 * ];
 *
 * const issuesWithoutWipOrDraftLabels = filterPullRequestsByExcludedLabels(issues, ['wip', 'draft']);
 * console.log(issuesWithoutWipOrDraftLabels);
 * // Output: [
 * //   { id: 2, labels: [{ name: 'enhancement' }, { name: 'help-wanted' }] },
 * // ]
 */
export function filterPullRequestsByExcludedLabels(issues, excludeLabels) {
	if (!Array.isArray(excludeLabels)) {
		return issues;
	}

	return issues.filter((issue) => issue.labels.every((label) => !excludeLabels.includes(label.name)));
}
