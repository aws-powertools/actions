import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildIssues, buildSearchIssues } from "../../testing/src/builders/issues.mjs";
import {
	listIssuesHandler,
	listIssuesFailureHandler,
	findIssueHandler,
	findIssueFailureHandler,
	createIssueHandler,
	updateIssueHandler,
} from "../../testing/src/interceptors/issues_handler.mjs";
import { MAX_ISSUES_PER_PAGE } from "../src/constants.mjs";
import { findIssue, listIssues, createIssue, updateIssue, createOrUpdateIssue } from "../src/issues.mjs";
import { faker } from "@faker-js/faker";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

describe("list issues", () => {
	const server = setupServer();

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

describe("create issues", () => {
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should create an issue (default parameters)", async () => {
		// GIVEN
		const data = buildIssues({ max: 1 })[0];
		server.use(...createIssueHandler({ data, org, repo }));

		// WHEN
		const ret = await createIssue("Test", {
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
		});

		// THEN
		expect(ret).toStrictEqual(data);
	});

	it("should only create an issue if one does not exist yet", async () => {
		// GIVEN
		const createdIssue = buildIssues({ max: 1 })[0];
		const noIssueFound = buildSearchIssues({ max: 0 });

		server.use(...findIssueHandler({ data: noIssueFound }), ...createIssueHandler({ data: createdIssue, org, repo }));

		// WHEN
		const ret = await createOrUpdateIssue("Test", {
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			searchQuery: "Test issue that won't be found",
		});

		// THEN
		expect(ret).toStrictEqual(createdIssue);
	});

	it.todo("should update issue when one already exists", async () => {});

	it.todo("should throw error when GitHub API call fails (http 500)", async () => {});
});

describe("update issues", () => {
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should update an issue (default parameters)", async () => {
		// GIVEN
		const issue = buildIssues({ max: 1 })[0];
		server.use(...updateIssueHandler({ data: issue, issueNumber: issue.number, org, repo }));

		// WHEN
		const ret = await updateIssue({
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN, debug: true }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			issueNumber: issue.number,
		});

		// THEN
		expect(ret).toStrictEqual(issue);
	});
	it.todo("should throw error when GitHub API call fails (http 500)", async () => {});
});
