import { GitHub } from "github/src/client";
import { MAX_ISSUES_PER_PAGE } from "github/src/constants.mjs";
import { setupServer } from "msw/node";
import { buildIssues } from "testing/src/builders";
import { listIssuesFailureHandler, listIssuesHandler } from "testing/src/interceptors/issues_handler.mjs";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

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

	it("should filter out pull requests from results", async () => {
		// GIVEN
		const github = new GitHub();
		const realIssues = buildIssues({ max: 2 });
		const prAsIssues = buildIssues({ max: 2, isPr: true });
		server.use(...listIssuesHandler({ data: [...realIssues, ...prAsIssues], org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listIssues();

		// THEN
		expect(ret).toStrictEqual(realIssues);
	});

	it("should exclude results with certain labels", async () => {
		const github = new GitHub();
		const BLOCKED_LABELS = "do-not-merge";

		const existingIssues = buildIssues({ max: 5, labels: [BLOCKED_LABELS] });
		server.use(...listIssuesHandler({ data: existingIssues, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listIssues({ excludeLabels: BLOCKED_LABELS });

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should limit the number of issues returned", async () => {
		// GIVEN
		const github = new GitHub();
		const maxIssuesToReturn = 1;
		const existingIssues = buildIssues({ max: 2 });

		server.use(...listIssuesHandler({ data: existingIssues, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.listIssues({ limit: maxIssuesToReturn });

		// THEN
		expect(ret.length).toBe(maxIssuesToReturn);
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
