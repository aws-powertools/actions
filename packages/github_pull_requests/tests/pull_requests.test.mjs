import { getLongRunningPRs } from "monthly_roadmap/src/index.mjs";
import { beforeAll, afterAll, afterEach, it, expect, describe, vi } from "vitest";
import { listPullRequests } from "../src/pull_requests.mjs";
import { setupServer } from "msw/node";
import { listPullRequestsHandler } from "./interceptors/pull_requests_handler";
import { buildPullRequests } from "./builders/pull_requests.mjs";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "./builders/github_core.mjs";

const server = setupServer();
const org = "aws-powertools";
const repo = "powertools-lambda-python";

// TODO: test for label filtering (excludeLabels)
// TODO: test for limit
describe("list pull requests", () => {
	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list feature request", async () => {
		// GIVEN
		const data = buildPullRequests({ max: 5, includeLabels: ["feature-request"] });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
		});

		// THEN
		expect(ret.length).greaterThan(0);
	});
});
