import { generateMock } from "@anatine/zod-mock";
import { labelSchema, pullRequestSchema } from "../schemas/pull_request_schema";

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
