import { GitHub } from "github/src/client";
import { setupServer } from "msw/node";
import { buildIssues, buildSearchIssues } from "testing/src/builders";
import {
	createIssueFailureHandler,
	createIssueHandler,
	findIssueHandler,
	updateIssueHandler,
} from "testing/src/interceptors/issues_handler.mjs";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

describe("create issues contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should create an issue (default parameters)", async () => {
		// GIVEN
		const github = new GitHub();
		const createdIssue = buildIssues({ max: 1 })[0];
		server.use(...createIssueHandler({ data: createdIssue, org: github.owner, repo: github.repo }));

		// WHEN
		const ret = await github.createIssue({
			github,
			title: "Test",
		});

		// THEN
		expect(ret).toStrictEqual(createdIssue);
	});

	it("should only create an issue if one does not exist yet", async () => {
		// GIVEN
		const createdIssue = buildIssues({ max: 1 })[0];
		const noIssueFound = buildSearchIssues({ max: 0 });
		const github = new GitHub();

		server.use(
			...findIssueHandler({ data: noIssueFound }),
			...createIssueHandler({ data: createdIssue, org: github.owner, repo: github.repo }),
		);

		// WHEN
		const ret = await github.createOrUpdateIssue({
			github,
			searchQuery: "Test issue that won't be found",
			title: "Test",
		});

		// THEN
		expect(ret).toStrictEqual(createdIssue);
	});

	it("should update issue when one already exists", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 1 });
		const foundIssue = buildSearchIssues({ issues: existingIssues });
		const github = new GitHub();
		const existingIssue = existingIssues[0];

		server.use(
			...findIssueHandler({ data: foundIssue }),
			...updateIssueHandler({
				data: existingIssue,
				issueNumber: existingIssue.number,
				org: github.owner,
				repo: github.repo,
			}),
		);

		// WHEN
		const ret = await github.createOrUpdateIssue({
			github,
			searchQuery: existingIssue.title,
			title: existingIssue.title,
		});

		// THEN
		expect(ret).toStrictEqual(existingIssue);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		const github = new GitHub();
		server.use(...createIssueFailureHandler({ org: github.owner, repo: github.repo, err }));

		// WHEN
		// THEN
		await expect(
			github.createIssue({
				github,
				title: "Test",
			}),
		).rejects.toThrowError(err);
	});

	it("should throw if issue title is missing", async () => {
		// GIVEN
		const github = new GitHub();
		// WHEN
		// THEN
		await expect(github.createIssue()).rejects.toThrowError("Issue title is required");
	});
});
