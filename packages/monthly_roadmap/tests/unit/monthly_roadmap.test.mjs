import { describe, expect, it, vi } from "vitest";
import * as issueModule from "../../../github_issues/src/issues.mjs";
import { buildGithubClient, buildGithubContext, buildGithubCore } from "../../../testing/src/builders/github_core.mjs";
import { buildIssues } from "../../../testing/src/builders/issues.mjs";
import {
	buildTopFeatureRequests,
	buildTopMostCommented,
	buildTopOldestIssues,
} from "../../../testing/src/builders/monthly_roadmap.mjs";
import {
	BLOCKED_LABELS,
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "../../src/constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "../../src/index.mjs";

describe("build monthly roadmap", () => {
	const org = "test";
	const repo = "test-repo";
	const github = buildGithubClient({ token: process.env.GITHUB_TOKEN });
	const context = buildGithubContext({ org, repo });
	const core = buildGithubCore();

	describe("data fetching", () => {
		it("get top feature requests (default params)", async () => {
			// GIVEN
			const existingFeatureRequests = buildIssues({ max: 2, labels: [FEATURE_REQUEST_LABEL] });
			const expectedTopFeatureRequests = buildTopFeatureRequests(existingFeatureRequests);

			const listIssuesSpy = vi.spyOn(issueModule, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingFeatureRequests;
			});

			// WHEN
			const topFeatureRequests = await getTopFeatureRequests({ github, context, core });

			// THEN
			expect(topFeatureRequests).toStrictEqual(expectedTopFeatureRequests);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				github,
				context,
				core,
				limit: TOP_FEATURE_REQUESTS_LIMIT,
				sortBy: "reactions-+1",
				labels: [FEATURE_REQUEST_LABEL],
				direction: "desc",
			});
		});

		it("get top 3 most commented issues", async () => {
			// GIVEN
			const existingTopCommentedIssues = buildIssues({ max: 2 });
			const expectedTopCommentedIssues = buildTopMostCommented(existingTopCommentedIssues);

			const listIssuesSpy = vi.spyOn(issueModule, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingTopCommentedIssues;
			});

			// WHEN
			const topCommentedIssues = await getTopMostCommented({ github, context, core });

			// THEN
			expect(topCommentedIssues).toStrictEqual(expectedTopCommentedIssues);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				github,
				context,
				core,
				limit: TOP_MOST_COMMENTED_LIMIT,
				sortBy: "comments",
				direction: "desc",
			});
		});

		it("get top oldest issues", async () => {
			// GIVEN
			const existingOldestIssues = buildIssues({ max: 2 });
			const expectedTopOldestIssues = buildTopOldestIssues(existingOldestIssues);

			const listIssuesSpy = vi.spyOn(issueModule, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingOldestIssues;
			});

			// WHEN
			const topOldestIssues = await getTopOldestIssues({ github, context, core });

			// THEN
			expect(topOldestIssues).toStrictEqual(expectedTopOldestIssues);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				github,
				context,
				core,
				limit: TOP_OLDEST_LIMIT,
				sortBy: "created",
				direction: "asc",
				excludeLabels: BLOCKED_LABELS,
			});
		});

		it.todo("get top 3 long running PRs", async () => {});
	});
});
