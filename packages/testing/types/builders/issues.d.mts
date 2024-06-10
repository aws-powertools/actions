/**
 * Builds an array of mock issues with associated labels based on the provided parameters.
 * @param {Object} options - The options object.
 * @param {number} [options.max=10] - The maximum number of issues to generate.
 * @param {string[]} [options.labels=[]] - Labels to include in the mock issues.
 * @param {string} [options.org="aws-powertools"] - The organization name.
 * @param {string} [options.repo="powertools-lambda-python"] - The repository name.
 * @param {string} [options.isPr=false] - Whether to transform an issue mock to a PR-like GitHub Issues API.
 * @param {z.infer<typeof issueSchema>} [options.overrides] - Object to override from schema
 * @returns {z.infer<typeof issueSchema>[]} Issue - An array of mocked issues.
 */
export function buildIssues({ max, labels, org, repo, isPr, overrides, }: {
    max?: number;
    labels?: string[];
    org?: string;
    repo?: string;
    isPr?: string;
    overrides?: z.infer<typeof issueSchema>;
}): z.infer<typeof issueSchema>[];
/**
 * Builds an array of mock issues with associated labels following Search Endpoint.
 * Search Endpoint ref: https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28
 * @param {Object} options - The options object.
 * @param {number} [options.max=10] - The maximum number of issues to generate.
 * @param {string[]} [options.labels=[]] - Labels to include in the mock issues.
 * @param {string} [options.org="aws-powertools"] - The organization name.
 * @param {string} [options.repo="powertools-lambda-python"] - The repository name.
 * @param {z.infer<typeof issueSchema[]>} [options.issues] - Existing issues to build search response.
 * @param {z.infer<typeof issueSchema>} [options.overrides] - Object to override from schema
 *
 * @returns {z.infer<typeof issueSearchSchema>} SearchResponse - Search containing results
 */
export function buildSearchIssues({ max, labels, org, repo, issues, overrides, }: {
    max?: number;
    labels?: string[];
    org?: string;
    repo?: string;
    issues?: z.infer<(typeof issueSchema)[]>;
    overrides?: z.infer<typeof issueSchema>;
}): z.infer<typeof issueSearchSchema>;
import { z } from "zod";
import { issueSchema } from "@aws-powertools-actions/github/schemas/issues";
import { issueSearchSchema } from "@aws-powertools-actions/github/schemas/issues";
//# sourceMappingURL=issues.d.mts.map