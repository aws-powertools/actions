import { buildSearchIssues } from "@aws-powertools-actions/testing/builders";
import { findIssueFailureHandler, findIssueHandler } from "@aws-powertools-actions/testing/interceptors";
import { faker } from "@faker-js/faker";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { GitHub } from "../../src/index.mjs";

describe("search issues contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should find an issue based on search", async () => {
		// GIVEN
		const github = new GitHub();
		const issueTitle = faker.lorem.lines(1);
		const searchQuery = `${issueTitle} is:issue in:title state:open repo:${github.owner}/${github.repo}`;

		const searchResults = buildSearchIssues({ max: 2, overrides: { title: issueTitle } });
		server.use(...findIssueHandler({ data: searchResults }));

		// WHEN
		const ret = await github.findIssue({ searchQuery });

		// THEN
		expect(ret).toStrictEqual(searchResults.items);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const github = new GitHub();
		const err = "Unable to process request at this time";
		server.use(...findIssueFailureHandler({ err }));

		// WHEN
		// THEN
		await expect(github.findIssue({ searchQuery: "not be found" })).rejects.toThrowError(err);
	});
});
