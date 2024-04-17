import { generateMock } from "@anatine/zod-mock";
import { issueSchema, labelSchema, pullRequestIssueSchema } from "schemas/src/issue_schema.mjs";
import { z } from "zod";

/**
 * Builds an array of mock issues with associated labels based on the provided parameters.
 * @param {Object} options - The options object.
 * @param {number} [options.max=10] - The maximum number of issues to generate.
 * @param {string[]} [options.labels=[]] - Labels to include in the mock issues.
 * @param {string} [options.org="aws-powertools"] - The organization name.
 * @param {string} [options.repo="powertools-lambda-python"] - The repository name.
 * @param {string} [options.isPr=false] - Whether to transform an issue mock to a PR-like GitHub Issues API.
 * @returns {z.infer<typeof issueSchema>[]} Issue - An array of mocked issues.
 */
export function buildIssues({
	max = 10,
	labels = [],
	org = "aws-powertools",
	repo = "powertools-lambda-python",
	isPr = false,
}) {
	const prs = [];

	for (let i = 1; i < max + 1; i++) {
		prs.push({
			...mockIssue({ org, repo, issueNumber: i, isPr }),
			...mockLabels(labels),
			// pull_request: undefined,
		});
	}

	return prs;
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
	const type = isPr ? "pull" : "issues";
	const issue = generateMock(issueSchema, {
		stringMap: {
			html_url: () => `https://github.com/${org}/${repo}/${type}/${issueNumber}`,
		},
	});

	if (isPr) {
		issue.pull_request = generateMock(pullRequestIssueSchema);
	}

	return issue;
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