import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../testing/src/builders/issues.mjs";
import { listIssuesHandler } from "../../testing/src/interceptors/issues_handler.mjs";
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
		throw new Error("Not implemented");
	});

	it("should exclude results with certain labels", async () => {
		throw new Error("Not implemented");
	});

	it("should limit the number of issues returned", async () => {
		throw new Error("Not implemented");
	});

	it("should paginate to list all available pull requests when the limit is higher", async () => {
		throw new Error("Not implemented");
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		throw new Error("Not implemented");
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
