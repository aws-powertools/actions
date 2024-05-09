import { buildIssues } from "@aws-powertools-actions/testing/builders";
import { updateIssueFailureHandler, updateIssueHandler } from "@aws-powertools-actions/testing/interceptors";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { GitHub } from "../../src/index.mjs";

describe("update issues contract", () => {
	process.env.GITHUB_REPOSITORY = "test-org/test-repo";
	const server = setupServer();

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

	afterAll(() => server.close());

	afterEach(() => server.resetHandlers());

	it("should update an issue (default parameters)", async () => {
		// GIVEN
		const github = new GitHub();
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
		const github = new GitHub();
		const issueNumber = 0;
		const err = "Unable to process request at this time";
		server.use(...updateIssueFailureHandler({ issueNumber, err, org: github.owner, repo: github.repo }));

		// WHEN
		// THEN
		await expect(github.updateIssue({ issueNumber })).rejects.toThrowError(err);
	});
});
