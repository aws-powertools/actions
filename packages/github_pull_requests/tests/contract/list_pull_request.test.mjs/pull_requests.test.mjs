import { setupServer } from "msw/node";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "testing/src/builders/github_core.mjs";
import { buildPullRequests } from "testing/src/builders/pull_requests.mjs";
import {
	listPullRequestsFailureHandler,
	listPullRequestsHandler,
} from "testing/src/interceptors/pull_requests_handler.js";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { MAX_PULL_REQUESTS_PER_PAGE } from "../../../src/constants.mjs";
import { listPullRequests } from "../../../src/pull_requests.mjs";

describe("list pull requests", () => {
	const server = setupServer();
	const org = "aws-powertools";
	const repo = "powertools-lambda-python";

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list pull requests (default parameters)", async () => {
		// GIVEN
		const data = buildPullRequests({ max: 5 });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
		});

		// THEN
		expect(ret).toStrictEqual(data);
	});

	it("should exclude results with certain labels", async () => {
		// GIVEN
		const BLOCKED_LABELS = "do-not-merge";
		const data = buildPullRequests({ max: 5, labels: [BLOCKED_LABELS] });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
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
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			limit: 1,
		});

		// THEN
		expect(ret.length).toBe(1);
	});

	it("should paginate to list all available pull requests when the limit is higher", async () => {
		// GIVEN
		const totalPRs = MAX_PULL_REQUESTS_PER_PAGE + 1;

		const data = buildPullRequests({ max: totalPRs });
		server.use(...listPullRequestsHandler({ data, org, repo }));

		// WHEN
		const ret = await listPullRequests({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			limit: totalPRs,
		});

		// THEN
		expect(ret.length).toBe(totalPRs);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		server.use(...listPullRequestsFailureHandler({ org, repo, err }));

		// WHEN
		// THEN
		const ret = await expect(
			listPullRequests({
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
			}),
		).rejects.toThrowError(err);
	});

	it("should filter out issues from results", async () => {
		throw new Error("Not Implemented");
	});
});
