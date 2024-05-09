import { buildPullRequests } from "@aws-powertools-actions/testing/builders";
import { listPullRequestsFailureHandler, listPullRequestsHandler } from "@aws-powertools-actions/testing/interceptors";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { MAX_PULL_REQUESTS_PER_PAGE } from "../../src/constants.mjs";
import { GitHub } from "../../src/index.mjs";

describe("list pull requests contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list pull requests (default parameters)", async () => {
		// GIVEN
		const github = new GitHub();
		const data = buildPullRequests({ max: 5 });
		server.use(...listPullRequestsHandler({ data, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listPullRequests();

		// THEN
		expect(ret).toStrictEqual(data);
	});

	it("should paginate to list all available pull requests when the limit is higher", async () => {
		// GIVEN
		const github = new GitHub();
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
		const github = new GitHub();
		const err = "Unable to process request at this time";
		server.use(...listPullRequestsFailureHandler({ org: github.owner, repo: github.repo, err }));

		// WHEN
		// THEN
		await expect(github.listPullRequests()).rejects.toThrowError(err);
	});
});
