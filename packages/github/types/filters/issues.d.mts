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
export function filterByMinDaysOld(issues: z.infer<typeof issueSchema>[], minDaysOld?: number): z.infer<typeof issueSchema>[];
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
export function filterByMinDaysWithoutUpdate(issues: z.infer<typeof issueSchema>[], minDaysWithoutUpdate?: number): z.infer<typeof issueSchema>[];
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
export function filterByExcludedLabels(issues: z.infer<typeof issueSchema>[], excludeLabels: string[]): z.infer<typeof issueSchema>[];
/**
 * Filters out pull requests from a list of issues.
 *
 * @param {Array} issues - The list of issues to filter.
 * @returns {Array} The filtered list of issues without pull requests.
 */
export function filterPullRequestsAsIssues(issues: any[]): any[];
import { z } from "zod";
import { issueSchema } from "../schemas/issues.mjs";
//# sourceMappingURL=issues.d.mts.map