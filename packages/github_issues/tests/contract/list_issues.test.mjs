import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../../testing/src/builders/issues.mjs";
import { listIssuesFailureHandler, listIssuesHandler } from "../../../testing/src/interceptors/issues_handler.mjs";
import { MAX_ISSUES_PER_PAGE } from "../../src/constants.mjs";
import { listIssues } from "../../src/issues.mjs";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

describe("list issues contract", () => {
	const server = setupServer();
	const github = buildGithubClient({ token: process.env.GITHUB_TOKEN });
	const context = buildGithubContext({ org, repo });
	const core = buildGithubCore();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list issues (default parameters)", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 5 });
		server.use(...listIssuesHandler({ data: existingIssues, org, repo }));

		// WHEN
		const ret = await listIssues({
			github,
			context,
			core,
		});

		// THEN
		expect(ret).toStrictEqual(existingIssues);
	});

	it("should filter out pull requests from results", async () => {
		// GIVEN
		const realIssues = buildIssues({ max: 2 });
		const prAsIssues = buildIssues({ max: 2, isPr: true });
		server.use(...listIssuesHandler({ data: [...realIssues, ...prAsIssues], org, repo }));

		// WHEN
		const ret = await listIssues({
			github,
			context,
			core,
		});

		// THEN
		expect(ret).toStrictEqual(realIssues);
	});

	it("should exclude results with certain labels", async () => {
		const BLOCKED_LABELS = "do-not-merge";

		const existingIssues = buildIssues({ max: 5, labels: [BLOCKED_LABELS] });
		server.use(...listIssuesHandler({ data: existingIssues, org, repo }));

		// WHEN
		const ret = await listIssues({
			github,
			context,
			core,
			excludeLabels: BLOCKED_LABELS,
		});

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should limit the number of issues returned", async () => {
		// GIVEN
		const maxIssuesToReturn = 1;
		const existingIssues = buildIssues({ max: 2 });

		server.use(...listIssuesHandler({ data: existingIssues, org, repo }));

		// WHEN
		const ret = await listIssues({
			github,
			context,
			core,
			limit: maxIssuesToReturn,
		});

		// THEN
		expect(ret.length).toBe(maxIssuesToReturn);
	});

	it("should paginate to list all available issues when the limit is higher", async () => {
		// GIVEN
		const totalCount = MAX_ISSUES_PER_PAGE + 1;

		const existingIssues = buildIssues({ max: totalCount });
		server.use(...listIssuesHandler({ data: existingIssues, org, repo }));

		// WHEN
		const ret = await listIssues({
			github,
			context,
			core,
			limit: totalCount,
		});

		// THEN
		expect(ret.length).toBe(totalCount);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		server.use(...listIssuesFailureHandler({ org, repo, err }));

		// WHEN
		// THEN
		const ret = await expect(
			listIssues({
				github,
				context,
				core,
			}),
		).rejects.toThrowError(err);
	});
});
