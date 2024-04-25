import { GitHub, GitHubActions } from "github/src/client";
import { ISSUES_SORT_BY, PULL_REQUESTS_SORT_BY } from "github/src/constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "reporting/src/issues";
import {
	buildGithubCore,
	buildIssues,
	buildLongRunningPullRequests,
	buildPullRequests,
	buildTopFeatureRequests,
	buildTopMostCommented,
	buildTopOldestIssues,
} from "testing/src/builders";
import { describe, expect, it, vi } from "vitest";
import {
	BLOCKED_LABELS,
	FEATURE_REQUEST_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_LONG_RUNNING_PR_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "../../src/constants.mjs";
import { createMonthlyRoadmapReport } from "../../src/monthly_roadmap.mjs";
import { getLongRunningPRs } from "../../src/pull_requests";

describe("build monthly roadmap", () => {
	describe("data fetching", () => {
		it("get top feature requests (default params)", async () => {
			// GIVEN
			const existingFeatureRequests = buildIssues({ max: 2, labels: [FEATURE_REQUEST_LABEL] });
			const expectedTopFeatureRequests = buildTopFeatureRequests(existingFeatureRequests);
			const github = new GitHub();

			const listIssuesSpy = vi.spyOn(github, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingFeatureRequests;
			});

			// WHEN
			const topFeatureRequests = await getTopFeatureRequests({ github });

			// THEN
			expect(topFeatureRequests).toStrictEqual(expectedTopFeatureRequests);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				limit: TOP_FEATURE_REQUESTS_LIMIT,
				sortBy: ISSUES_SORT_BY.REACTION_PLUS_1,
				labels: [FEATURE_REQUEST_LABEL],
				direction: "desc",
			});
		});

		it("get top most commented issues", async () => {
			// GIVEN
			const existingTopCommentedIssues = buildIssues({ max: 2 });
			const expectedTopCommentedIssues = buildTopMostCommented(existingTopCommentedIssues);
			const github = new GitHub();

			const listIssuesSpy = vi.spyOn(github, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingTopCommentedIssues;
			});

			// WHEN
			const topCommentedIssues = await getTopMostCommented({ github });

			// THEN
			expect(topCommentedIssues).toStrictEqual(expectedTopCommentedIssues);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				limit: TOP_MOST_COMMENTED_LIMIT,
				sortBy: ISSUES_SORT_BY.COMMENTS,
				direction: "desc",
			});
		});

		it("get top oldest issues", async () => {
			// GIVEN
			const existingOldestIssues = buildIssues({ max: 2 });
			const expectedTopOldestIssues = buildTopOldestIssues(existingOldestIssues);
			const github = new GitHub();

			const listIssuesSpy = vi.spyOn(github, "listIssues");
			listIssuesSpy.mockImplementation(() => {
				return existingOldestIssues;
			});

			// WHEN
			const topOldestIssues = await getTopOldestIssues({ github });

			// THEN
			expect(topOldestIssues).toStrictEqual(expectedTopOldestIssues);
			expect(listIssuesSpy).toHaveBeenCalledWith({
				limit: TOP_OLDEST_LIMIT,
				sortBy: ISSUES_SORT_BY.CREATED,
				direction: "asc",
				excludeLabels: BLOCKED_LABELS,
			});
		});

		it("get top long running PRs", async () => {
			// GIVEN
			const existingPullRequests = buildPullRequests({ max: 2 });
			const expectedPullRequests = buildLongRunningPullRequests(existingPullRequests);
			const github = new GitHub();

			const listPullRequestsSpy = vi.spyOn(github, "listPullRequests");
			listPullRequestsSpy.mockImplementation(() => {
				return existingPullRequests;
			});

			// WHEN
			const topLongRunningPullRequests = await getLongRunningPRs({ github });

			// THEN
			expect(topLongRunningPullRequests).toStrictEqual(expectedPullRequests);
			expect(listPullRequestsSpy).toHaveBeenCalledWith({
				limit: TOP_LONG_RUNNING_PR_LIMIT,
				sortBy: PULL_REQUESTS_SORT_BY.LONG_RUNNING,
				direction: "desc",
				excludeLabels: BLOCKED_LABELS,
			});
		});
	});

	it("build report issue (default params)", async () => {
		//     GIVEN
		const github = new GitHub();
		const actions = new GitHubActions();
		actions.core = buildGithubCore(); // mock GH Action Summary functions

		const existingIssues = buildIssues({ max: 2 });
		const existingPullRequests = buildPullRequests({ max: 2 });

		const listPullRequestsSpy = vi.spyOn(github, "listPullRequests").mockImplementation(() => existingPullRequests);
		const listIssuesSpy = vi.spyOn(github, "listIssues").mockImplementation(() => existingIssues);
		const createOrUpdateIssueSpy = vi.spyOn(github, "createOrUpdateIssue").mockImplementation(() => existingIssues[0]);

		//     WHEN
		const ret = await createMonthlyRoadmapReport({ github, actions });
		expect(ret).toBe(existingIssues[0]);
		//     THEN
	});
});
