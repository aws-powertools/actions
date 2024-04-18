import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../../testing/src/builders/issues.mjs";
import { updateIssueFailureHandler, updateIssueHandler } from "../../../testing/src/interceptors/issues_handler.mjs";
import { updateIssue } from "../../src/issues.mjs";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

describe("update issues contract", () => {
	const server = setupServer();
	const github = buildGithubClient({ token: process.env.GITHUB_TOKEN });
	const context = buildGithubContext({ org, repo });
	const core = buildGithubCore();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should update an issue (default parameters)", async () => {
		// GIVEN
		const updatedIssue = buildIssues({ max: 1 })[0];
		server.use(...updateIssueHandler({ data: updatedIssue, issueNumber: updatedIssue.number, org, repo }));

		// WHEN
		const ret = await updateIssue({
			github,
			context,
			core,
			issueNumber: updatedIssue.number,
		});

		// THEN
		expect(ret).toStrictEqual(updatedIssue);
	});

	it("should throw error when GitHub API call fails (http 500)", async () => {
		// GIVEN
		const issueNumber = 0;
		const err = "Unable to process request at this time";
		server.use(...updateIssueFailureHandler({ issueNumber, err, org, repo }));

		// WHEN
		// THEN
		await expect(
			updateIssue({
				github,
				context,
				core,
				issueNumber,
			}),
		).rejects.toThrowError(err);
	});

	it("should throw if issue number is missing", async () => {
		// GIVEN
		// WHEN
		// THEN
		await expect(
			updateIssue({
				github,
				context,
				core,
			}),
		).rejects.toThrowError("Issue number is required");
	});
});
