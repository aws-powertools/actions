import { generateMock } from "@anatine/zod-mock";
import { labelSchema, pullRequestSchema } from "schemas/src/pull_request_schema.js";
import { z } from "zod";

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

const mockLabels = (labels = []) => {
	if (!labels) {
		return {};
	}

	const mockedLables = [];

	labels.map((label) => {
		mockedLables.push(
			generateMock(labelSchema, {
				stringMap: {
					name: () => label,
				},
			}),
		);
	});

	return { labels: mockedLables };
};

// see labels from input
// see reviewers from input
