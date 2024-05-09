/**
 * Builds an array of top feature requests from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top feature requests issues.
 * @returns {PopularFeatureRequest[]} Feature requests - An array of top feature requests.
 */
export function buildTopFeatureRequests(issues: z.infer<typeof issueSchema>[]): PopularFeatureRequest[];
/**
 * Builds an array of top commented issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top commented issues.
 * @returns {HighlyCommentedIssue[]} Most active issues - An array of top commented issues.
 */
export function buildTopMostCommented(issues: z.infer<typeof issueSchema>[]): HighlyCommentedIssue[];
/**
 * Builds an array of top oldest issues from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top oldest issues.
 * @returns {OldestIssue[]} Oldest issues - An array of top oldest issues.
 */
export function buildTopOldestIssues(issues: z.infer<typeof issueSchema>[]): OldestIssue[];
/**
 * Builds an array of top long running from GitHub pull requests
 * @param {z.infer<typeof pullRequestSchema>[]} issues - Top long-running.
 * @returns {LongRunningPullRequest[]} Long running PRs - An array of top long running pull requests.
 */
export function buildLongRunningPullRequests(issues: z.infer<typeof pullRequestSchema>[]): LongRunningPullRequest[];
import { z } from "zod";
import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
import { PopularFeatureRequest } from "@aws-powertools-actions/reporting/models";
import { HighlyCommentedIssue } from "@aws-powertools-actions/reporting/models";
import { OldestIssue } from "@aws-powertools-actions/reporting/models";
import { LongRunningPullRequest } from "@aws-powertools-actions/reporting/models";
//# sourceMappingURL=reporting.d.mts.map