import { faker } from "@faker-js/faker";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildSearchIssues } from "../../testing/src/builders/issues.mjs";
import { findIssueFailureHandler, findIssueHandler } from "../../testing/src/interceptors/issues_handler.mjs";
import { findIssue } from "../src/issues.mjs";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

describe("search issues contract", () => {
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should find an issue based on search", async () => {
		// GIVEN
		const issueTitle = faker.lorem.lines(1);
		const searchQuery = `${issueTitle} is:issue in:title state:open repo:${org}/${repo}`;

		const data = buildSearchIssues({ max: 2, overrides: { title: issueTitle } });
		server.use(...findIssueHandler({ data, org, repo }));

		// WHEN
		const ret = await findIssue({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			core: buildGithubCore(),
			context: buildGithubContext({ org, repo }),
			searchQuery,
		});

		// THEN
		expect(ret).toStrictEqual(data.items);
	});

	it("should not fail when issue is not found", async () => {
		// GIVEN
		const data = buildSearchIssues({ max: 0 });
		server.use(...findIssueHandler({ data, org, repo }));

		// WHEN
		const ret = await findIssue({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			core: buildGithubCore(),
			context: buildGithubContext({ org, repo }),
			searchQuery: "not be found",
		});

		// THEN
		expect(ret.length).toBe(0);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		server.use(...findIssueFailureHandler({ err }));

		// WHEN
		// THEN
		await expect(
			findIssue({
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				core: buildGithubCore(),
				context: buildGithubContext({ org, repo }),
				searchQuery: "not be found",
			}),
		).rejects.toThrowError(err);
	});
});
