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
});
