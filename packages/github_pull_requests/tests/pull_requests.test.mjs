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

describe("list pull requests", () => {
	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list feature request regardless of the labels", async () => {
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

	it("should list feature request excluding certain labels", async () => {
		// GIVEN
		const BLOCKED_LABELS = "do-not-merge";
		const data = buildPullRequests({ max: 5, includeLabels: [BLOCKED_LABELS] });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			excludeLabels: BLOCKED_LABELS,
		});

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should limit the number of pull requests returned", async () => {
		// GIVEN
		const data = buildPullRequests({ max: 2 });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			limit: 1,
		});

		// THEN
		expect(ret.length).toBe(1);
	});
});
