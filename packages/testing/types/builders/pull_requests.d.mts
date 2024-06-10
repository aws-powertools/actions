/**
 * Builds an array of mock pull requests with associated labels based on the provided parameters.
 * @param {Object} options - The options object.
 * @param {number} [options.max=10] - The maximum number of pull requests to generate.
 * @param {string[]} [options.labels=[]] - The labels to include in the mock pull requests.
 * @param {string} [options.org="aws-powertools"] - The organization name for the pull requests.
 * @param {string} [options.repo="powertools-lambda-python"] - The repository name for the pull requests.
 * @param {z.infer<typeof pullRequestSchema>} [options.overrides] - Object to override from schema
 * @returns {z.infer<typeof pullRequestSchema>[]} PullRequest - An array of mocked pull requests.
 */
export function buildPullRequests({ max, labels, org, repo, overrides, }: {
    max?: number;
    labels?: string[];
    org?: string;
    repo?: string;
    overrides?: z.infer<typeof pullRequestSchema>;
}): z.infer<typeof pullRequestSchema>[];
import { z } from "zod";
import { pullRequestSchema } from "@aws-powertools-actions/github/schemas/pull-requests";
//# sourceMappingURL=pull_requests.d.mts.map