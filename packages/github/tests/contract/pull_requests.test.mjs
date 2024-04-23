import { MAX_PULL_REQUESTS_PER_PAGE } from "github_pull_requests/src/constants.mjs";
import { listPullRequests } from "github_pull_requests/src/pull_requests.mjs";
import { setupServer } from "msw/node";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "testing/src/builders/github_core.mjs";
import { buildPullRequests } from "testing/src/builders/pull_requests.mjs";
import {
	listPullRequestsFailureHandler,
	listPullRequestsHandler,
} from "testing/src/interceptors/pull_requests_handler.mjs";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Github } from "../../src/client/Github.mjs";

describe("list pull requests contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list pull requests (default parameters)", async () => {
		// GIVEN
		const github = new Github();
		const data = buildPullRequests({ max: 5 });
		server.use(...listPullRequestsHandler({ data, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listPullRequests();

		// THEN
		expect(ret).toStrictEqual(data);
	});

	it("should exclude results with certain labels", async () => {
		// GIVEN
		const github = new Github();
		const BLOCKED_LABELS = "do-not-merge";
		const data = buildPullRequests({ max: 5, labels: [BLOCKED_LABELS] });
		server.use(...listPullRequestsHandler({ data, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listPullRequests({ excludeLabels: BLOCKED_LABELS });

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should limit the number of pull requests returned", async () => {
		// GIVEN
		const github = new Github();
		const data = buildPullRequests({ max: 2 });
		server.use(...listPullRequestsHandler({ data, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listPullRequests({ limit: 1 });

		// THEN
		expect(ret.length).toBe(1);
	});

	it("should paginate to list all available pull requests when the limit is higher", async () => {
		// GIVEN
		const github = new Github();
		const totalPRs = MAX_PULL_REQUESTS_PER_PAGE + 1;

		const data = buildPullRequests({ max: totalPRs });
		server.use(...listPullRequestsHandler({ data, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listPullRequests({ limit: totalPRs });

		// THEN
		expect(ret.length).toBe(totalPRs);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const github = new Github();
		const err = "Unable to process request at this time";
		server.use(...listPullRequestsFailureHandler({ org: github.owner, repo: github.repo, err }));

		// WHEN
		// THEN
		await expect(github.listPullRequests()).rejects.toThrowError(err);
	});
});
