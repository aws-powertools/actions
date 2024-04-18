import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../../testing/src/builders/github_core.mjs";
import { buildIssues, buildSearchIssues } from "../../../testing/src/builders/issues.mjs";
import {
	createIssueFailureHandler,
	createIssueHandler,
	findIssueHandler,
	updateIssueHandler,
} from "../../../testing/src/interceptors/issues_handler.mjs";
import { createIssue, createOrUpdateIssue } from "../../src/issues.mjs";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

describe("create issues contract", () => {
	const server = setupServer();
	const github = buildGithubClient({ token: process.env.GITHUB_TOKEN });
	const context = buildGithubContext({ org, repo });
	const core = buildGithubCore();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should create an issue (default parameters)", async () => {
		// GIVEN
		const createdIssue = buildIssues({ max: 1 })[0];
		server.use(...createIssueHandler({ data: createdIssue, org, repo }));

		// WHEN
		const ret = await createIssue({
			github,
			context,
			core,
			title: "Test",
		});

		// THEN
		expect(ret).toStrictEqual(createdIssue);
	});

	it("should only create an issue if one does not exist yet", async () => {
		// GIVEN
		const createdIssue = buildIssues({ max: 1 })[0];
		const noIssueFound = buildSearchIssues({ max: 0 });

		server.use(...findIssueHandler({ data: noIssueFound }), ...createIssueHandler({ data: createdIssue, org, repo }));

		// WHEN
		const ret = await createOrUpdateIssue({
			github,
			context,
			core,
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

		const existingIssue = existingIssues[0];

		server.use(
			...findIssueHandler({ data: foundIssue }),
			...updateIssueHandler({ data: existingIssue, issueNumber: existingIssue.number, org, repo }),
		);

		// WHEN
		const ret = await createOrUpdateIssue({
			github,
			context,
			core,
			searchQuery: existingIssue.title,
			title: existingIssue.title,
		});

		// THEN
		expect(ret).toStrictEqual(existingIssue);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const err = "Unable to process request at this time";
		server.use(...createIssueFailureHandler({ org, repo, err }));

		// WHEN
		// THEN
		await expect(
			createIssue({
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
				title: "Test",
			}),
		).rejects.toThrowError(err);
	});

	it("should throw if issue title is missing", async () => {
		// GIVEN
		// WHEN
		// THEN
		await expect(
			createIssue({
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
			}),
		).rejects.toThrowError("Issue title is required");
	});
});
