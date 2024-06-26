import { buildIssues } from "@aws-powertools-actions/testing/builders";
import { listIssuesFailureHandler, listIssuesHandler } from "@aws-powertools-actions/testing/interceptors";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { MAX_ISSUES_PER_PAGE } from "../../src/constants.mjs";
import { GitHub } from "../../src/index.mjs";

describe("list issues contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list issues (default parameters)", async () => {
		// GIVEN
		const github = new GitHub();
		const existingIssues = buildIssues({ max: 5 });
		server.use(...listIssuesHandler({ data: existingIssues, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listIssues();

		// THEN
		expect(ret).toStrictEqual(existingIssues);
	});

	it("should paginate to list all available issues when the limit is higher", async () => {
		// GIVEN
		const github = new GitHub();
		const totalCount = MAX_ISSUES_PER_PAGE + 1;

		const existingIssues = buildIssues({ max: totalCount });
		server.use(...listIssuesHandler({ data: existingIssues, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listIssues({ limit: totalCount });

		// THEN
		expect(ret.length).toBe(totalCount);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const github = new GitHub();
		const err = "Unable to process request at this time";
		server.use(...listIssuesFailureHandler({ org: github.owner, repo: github.repo, err }));

		// WHEN
		// THEN
		await expect(github.listIssues()).rejects.toThrowError(err);
	});
});
