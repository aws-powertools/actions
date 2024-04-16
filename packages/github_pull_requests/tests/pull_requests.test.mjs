import { getLongRunningPRs } from "monthly_roadmap/src/index.mjs";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildPullRequests } from "../../testing/src/builders/pull_requests.mjs";
import { listPullRequestsHandler } from "../../testing/src/interceptors/pull_requests_handler";
import { listPullRequests } from "../src/pull_requests.mjs";

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
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
		});

		// THEN
		expect(ret).toStrictEqual(data);
	});
});
