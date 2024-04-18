import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../testing/src/builders/issues.mjs";
import { updateIssueFailureHandler, updateIssueHandler } from "../../testing/src/interceptors/issues_handler.mjs";
import { updateIssue } from "../src/issues.mjs";

const org = "aws-powertools";
const repo = "powertools-lambda-python";

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
			github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
			context: buildGithubContext({ org, repo }),
			core: buildGithubCore(),
			issueNumber: issue.number,
		});

		// THEN
		expect(ret).toStrictEqual(issue);
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
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
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
				github: buildGithubClient({ token: process.env.GITHUB_TOKEN }),
				context: buildGithubContext({ org, repo }),
				core: buildGithubCore(),
			}),
		).rejects.toThrowError("Issue number is required");
	});
});
