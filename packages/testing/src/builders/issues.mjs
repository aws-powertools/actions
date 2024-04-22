import { generateMock } from "@anatine/zod-mock";
import {
	issueSchema,
	issueSearchSchema,
	labelSchema,
	pullRequestAsIssueSchema,
} from "github/src/schemas/issues.mjs";
import { z } from "zod";

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
export function buildIssues({
	max = 10,
	labels = [],
	org = "aws-powertools",
	repo = "powertools-lambda-python",
	isPr = false,
	overrides,
}) {
	const issues = [];

	for (let i = 1; i < max + 1; i++) {
		issues.push({
			...mockIssue({ org, repo, issueNumber: i, isPr }),
			...mockLabels(labels),
			...overrides,
		});
	}

	return issues;
}

/**
 * Generates a mock issue object with URLs based on the provided organization, repository, and issue number.
 * @param {Object} options - The options object.
 * @param {string} options.org - The organization name.
 * @param {string} options.repo - The repository name.
 * @param {number} options.issueNumber - The issue number.
 * @param {number} options.isPr - Whether to transform an issue mock to a PR-like GitHub Issues API.
 * @returns {z.infer<typeof issueSchema>} Issue - The mock issue object.
 */
const mockIssue = ({ org, repo, issueNumber, isPr = false }) => {
	const schema = isPr ? pullRequestAsIssueSchema : issueSchema;
	const type = isPr ? "pull" : "issues";
	const html_url = `https://github.com/${org}/${repo}/${type}/${issueNumber}`;

	return generateMock(schema, {
		stringMap: {
			html_url: () => html_url,
		},
	});
};

/**
 * Mocks an array of labels based on the provided label names.
 * @param {string[]} [labels=[]] - The array of label names to mock.
 * @returns {z.infer<typeof labelSchema>[]} Labels - An array of mocked labels.
 */
const mockLabels = (labels = []) => {
	if (!labels) {
		return {};
	}

	const mockedLabels = [];

	labels.map((label) => {
		mockedLabels.push(
			generateMock(labelSchema, {
				stringMap: {
					name: () => label,
				},
			}),
		);
	});

	return { labels: mockedLabels };
};

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
export function buildSearchIssues({
	max = 10,
	labels = [],
	org = "aws-powertools",
	repo = "powertools-lambda-python",
	issues,
	overrides,
}) {
	if (issues === undefined) {
		issues = buildIssues({
			max,
			labels,
			org,
			repo,
			overrides,
		});
	}

	if (!Array.isArray(issues)) {
		throw new Error("Received a single issue; We only accept an array of issues.");
	}

	return {
		items: issues,
		total_count: issues.length,
		incomplete_results: false,
	};
}
