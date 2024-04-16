import { generateMock } from "@anatine/zod-mock";
import { labelSchema, pullRequestSchema } from "schemas/src/pull_request_schema.js";
import { z } from "zod";

/**
 * Builds an array of mock pull requests with associated labels based on the provided parameters.
 * @param {Object} options - The options object.
 * @param {number} [options.max=10] - The maximum number of pull requests to generate.
 * @param {string[]} [options.includeLabels=[]] - The labels to include in the mock pull requests.
 * @param {string} [options.org="aws-powertools"] - The organization name for the pull requests.
 * @param {string} [options.repo="powertools-lambda-python"] - The repository name for the pull requests.
 * @returns {z.infer<typeof pullRequestSchema>[]} PullRequest - An array of mocked pull requests.
 */
export function buildPullRequests({
	max = 10,
	includeLabels = [],
	org = "aws-powertools",
	repo = "powertools-lambda-python",
}) {
	const prs = [];

	for (let i = 1; i < max + 1; i++) {
		prs.push({
			...mockPullRequest({ org, repo, prNumber: i }),
			...mockLabels(includeLabels),
		});
	}

	return prs;
}

/**
 * Generates a mock pull request object with URLs based on the provided organization, repository, and pull request number.
 * @param {Object} options - The options object.
 * @param {string} options.org - The organization name.
 * @param {string} options.repo - The repository name.
 * @param {number} options.prNumber - The pull request number.
 * @returns {z.infer<typeof pullRequestSchema>} PullRequest - The mock pull request object.
 */
const mockPullRequest = ({ org, repo, prNumber }) => {
	return generateMock(pullRequestSchema, {
		stringMap: {
			html_url: () => `https://github.com/${org}/${repo}/pull/${prNumber}`,
			diff_url: () => `https://github.com/${org}/${repo}/pull/${prNumber}.diff`,
			patch_url: () => `https://github.com/${org}/${repo}/pull/${prNumber}.patch`,
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
