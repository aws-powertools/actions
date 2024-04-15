import { Octokit } from "@octokit/rest";
import { getLongRunningPRs } from "monthly_roadmap/src/index.mjs";
import { beforeAll, afterAll, afterEach, it, expect, describe, vi } from "vitest";
import { listPullRequests } from "../src/pull_requests.mjs";
import { setupServer } from "msw/node";
import { listPullRequestsHandler } from "./interceptors/pull_requests_handler";
import { buildPullRequests } from "./builders/pull_requests";

const server = setupServer(
	...listPullRequestsHandler({
		data: buildPullRequests({ max: 5 }),
		org: "aws-powertools",
		repo: "powertools-lambda-python",
	}),
);

describe("list pull requests", () => {
	// Start server before all tests
	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	//  Close server after all tests
	afterAll(() => server.close());

	// Reset handlers after each test `important for test isolation`
	afterEach(() => server.resetHandlers());

	// TODO: test for label filtering (excludeLabels)
	// TODO: test for limit

	it("listing a pull request (no filter)", async () => {
		const github = new Octokit({
			auth: process.env.GITHUB_TOKEN,
			log: console,
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

		const ret = await getLongRunningPRs({ github, context, core });
		expect(ret.length).greaterThan(0);
		// const ret = await listPullRequests({
		//     github: github,
		//     context: context,
		//     core: core,
		// })
	});
});
