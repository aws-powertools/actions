import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../../testing/src/builders/issues.mjs";
import { buildTopFeatureRequests } from "../../../testing/src/builders/monthly_roadmap.mjs";
import { listIssuesHandler } from "../../../testing/src/interceptors/issues_handler.mjs";
import { FEATURE_REQUEST_LABEL, TOP_FEATURE_REQUESTS_LIMIT } from "../../src/constants.mjs";
import { getTopFeatureRequests } from "../../src/index.mjs";
import * as issueModule from "../../../github_issues/src/issues.mjs";

describe("build monthly roadmap", () => {
	const org = "test";
	const repo = "test-repo";
	const github = buildGithubClient({ token: process.env.GITHUB_TOKEN });
	const context = buildGithubContext({ org, repo });
	const core = buildGithubCore();

	describe("top feature requests", () => {
		const server = setupServer();

		beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
		afterAll(() => server.close());
		afterEach(() => server.resetHandlers());

		it("get top 3 feature requests", async () => {
			// GIVEN
			const existingFeatureRequests = buildIssues({ max: TOP_FEATURE_REQUESTS_LIMIT, labels: [FEATURE_REQUEST_LABEL] });
			const expectedTopFeatureRequests = buildTopFeatureRequests(existingFeatureRequests);

			server.use(...listIssuesHandler({ data: existingFeatureRequests, org, repo }));

			// WHEN
			const topFeatureRequests = await getTopFeatureRequests({ github, context, core });

			// THEN
			expect(topFeatureRequests).toStrictEqual(expectedTopFeatureRequests);
		});

		it("Test for regressions in params", async () => {
			// GIVEN
			const listIssuesSpy = vi.spyOn(issueModule, "listIssues");
			listIssuesSpy.mockImplementation(({ options }) => {
				return buildIssues({ max: TOP_FEATURE_REQUESTS_LIMIT, labels: [FEATURE_REQUEST_LABEL] });
			});

			// WHEN
			await getTopFeatureRequests({ github, context, core });

			// THEN
			// TODO: make labels param more robust; everything else shouldn't suffer regression
			expect(listIssuesSpy).toHaveBeenCalledWith({
				github,
				context,
				core,
				limit: TOP_FEATURE_REQUESTS_LIMIT,
				sortBy: "reactions-+1",
				labels: ["feature-request"],
				direction: "desc",
			});
		});
	});

	it.todo("get top 3 most commented issues", async () => {});
	it.todo("get top 3 oldest issues", async () => {});
	it.todo("get top 3 long running PRs", async () => {});
});
