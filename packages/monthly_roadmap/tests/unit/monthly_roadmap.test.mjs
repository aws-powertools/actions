import { expect, test, vi } from "vitest";

import { createMonthlyRoadmapReport } from "../../src/index.mjs";

// exploratory testing to speed up prototyping
test("update existing issue", async () => {
	const { Octokit } = require("@octokit/rest");
	const github = new Octokit({
		auth: process.env.GITHUB_TOKEN,
	});

	const context = {
		repo: {
			owner: "aws-powertools",
			repo: "powertools-lambda-python",
		},
	};

	const core = vi.mocked({
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
		summary: {
			addHeading: vi.fn().mockReturnThis(),
			addLink: vi.fn().mockReturnThis(),
			write: vi.fn(),
		},
	});

	const ret = await createMonthlyRoadmapReport({ github, context, core });

	expect(ret.status).toBe(200);
});
