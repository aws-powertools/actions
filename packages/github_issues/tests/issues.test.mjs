import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../testing/src/builders/issues.mjs";
import { listIssuesHandler, listIssuesFailureHandler } from "../../testing/src/interceptors/issues_handler.mjs";
import { MAX_ISSUES_PER_PAGE } from "../src/constants.mjs";
import { listIssues } from "../src/issues.mjs";

describe("list issues", () => {
	const server = setupServer();
	const org = "aws-powertools";
	const repo = "powertools-lambda-python";

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should list issues (default parameters)", async () => {
		// GIVEN
		const data = buildIssues({ max: 5 });
		server.use(...listIssuesHandler({ data, org, repo }));

		// WHEN
		const ret = await listIssues({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
		});

		// THEN
		expect(ret).toStrictEqual(data);
	});

	it("should filter out pull requests from results", async () => {
		// GIVEN
		const realIssues = buildIssues({ max: 2 });
		const prAsIssues = buildIssues({ max: 2, isPr: true });
		server.use(...listIssuesHandler({ data: [...realIssues, ...prAsIssues], org, repo }));

		// WHEN
		const ret = await listIssues({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			labels: ["feature"],
		});

		// THEN
		expect(ret).toStrictEqual(realIssues);
	});

	it("should exclude results with certain labels", async () => {
		const BLOCKED_LABELS = "do-not-merge";

		const data = buildIssues({ max: 5, labels: [BLOCKED_LABELS] });
		server.use(...listIssuesHandler({ data, org, repo }));

		// WHEN
		const ret = await listIssues({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			excludeLabels: BLOCKED_LABELS,
		});

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should limit the number of issues returned", async () => {
		const data = buildIssues({ max: 2 });
		server.use(...listIssuesHandler({ data, org, repo }));

		// WHEN
		const ret = await listIssues({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			limit: 1,
		});

		// THEN
		expect(ret.length).toBe(1);
	});

	it("should paginate to list all available issues when the limit is higher", async () => {
		// GIVEN
		const totalIssues = MAX_ISSUES_PER_PAGE + 1;

		const data = buildIssues({ max: totalIssues });
		server.use(...listIssuesHandler({ data, org, repo }));

		// WHEN
		const ret = await listIssues({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			limit: totalIssues,
		});

		// THEN
		expect(ret.length).toBe(totalIssues);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		server.use(...listIssuesFailureHandler({ org, repo, err }));

		// WHEN
		// THEN
		const ret = await expect(
			listIssues({
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
			}),
		).rejects.toThrowError(err);
	});
});

describe("search issues", () => {
	it("should find an issue based on search", async () => {
		throw new Error("Not implemented");
	});

	it("should not fail when issue is not found", async () => {
		throw new Error("Not implemented");
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		throw new Error("Not implemented");
	});
});

describe("create and updating issues", () => {
	it("should create an issue (default parameters)", async () => {
		throw new Error("Not implemented");
	});

	it("should update an issue (default parameters)", async () => {
		throw new Error("Not implemented");
	});

	it("should create an issue if one doesn't exist when updating", async () => {
		throw new Error("Not implemented");
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		throw new Error("Not implemented");
	});
});
