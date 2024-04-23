import {setupServer} from "msw/node";
import {buildIssues} from "testing/src/builders/issues.mjs";
import {updateIssueFailureHandler, updateIssueHandler} from "testing/src/interceptors/issues_handler.mjs";
import {afterAll, afterEach, beforeAll, describe, expect, it} from "vitest";
import {Github} from "../../src/Github.mjs";

describe("update issues contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should update an issue (default parameters)", async () => {
		// GIVEN
		const github = new Github();
		const updatedIssue = buildIssues({ max: 1 })[0];
		server.use(
			...updateIssueHandler({
				data: updatedIssue,
				issueNumber: updatedIssue.number,
				org: github.owner,
				repo: github.repo,
			}),
		);

		// WHEN
		const ret = await github.updateIssue({ issueNumber: updatedIssue.number });

		// THEN
		expect(ret).toStrictEqual(updatedIssue);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const github = new Github();
		const issueNumber = 0;
		const err = "Unable to process request at this time";
		server.use(...updateIssueFailureHandler({ issueNumber, err, org: github.owner, repo: github.repo }));

		// WHEN
		// THEN
		await expect(github.updateIssue({ issueNumber })).rejects.toThrowError(err);
	});

	it("should throw if issue number is missing", async () => {
		// GIVEN
		const github = new Github();
		// WHEN
		// THEN
		await expect(github.updateIssue()).rejects.toThrowError("Issue number is required");
	});
});
