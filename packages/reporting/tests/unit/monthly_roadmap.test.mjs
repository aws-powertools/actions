import { GitHub } from "github/src/client";
import { ISSUES_SORT_BY, PULL_REQUESTS_SORT_BY } from "github/src/constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "reporting/src/issues";
import {
	buildGitHubActionsClient,
	buildIssues,
	buildLongRunningPullRequests,
	buildPullRequests,
	buildTopFeatureRequests,
	buildTopMostCommented,
	buildTopOldestIssues,
} from "testing/src/builders";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	BLOCKED_LABELS,
	FEATURE_REQUEST_LABEL,
	NO_CONTENT_AVAILABLE_DEFAULT,
	REPORT_ROADMAP_LABEL,
	TOP_FEATURE_REQUESTS_LIMIT,
	TOP_LONG_RUNNING_PR_LIMIT,
	TOP_MOST_COMMENTED_LIMIT,
	TOP_OLDEST_LIMIT,
} from "../../src/constants.mjs";
import { UnorderedList } from "../../src/markdown/index.mjs";
import { createMonthlyRoadmapReport } from "../../src/monthly_roadmap.mjs";
import { getLongRunningPRs } from "../../src/pull_requests";

describe("build monthly roadmap", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

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

	describe("build report", () => {
		it("build report issue (default params)", async () => {
			// GIVEN
			const github = new GitHub();
			const actions = buildGitHubActionsClient();

			const existingIssues = buildIssues({ max: 3, labels: ["test-label"] });
			const existingPullRequests = buildPullRequests({ max: 3, labels: ["test-label"] });
			const existingReport = existingIssues[0];

			vi.spyOn(github, "listPullRequests").mockImplementation(() => existingPullRequests);
			vi.spyOn(github, "listIssues").mockImplementation(() => existingIssues);
			const createOrUpdateIssueSpy = vi.spyOn(github, "createOrUpdateIssue").mockImplementation(() => existingReport);

			// WHEN
			const ret = await createMonthlyRoadmapReport({ github, actions });

			// THEN
			expect(ret).toStrictEqual(existingReport);
			expect(createOrUpdateIssueSpy).toHaveBeenCalledWith(expect.objectContaining({ labels: [REPORT_ROADMAP_LABEL] }));
		});

		it("include blocked labels in report", async () => {
			// GIVEN
			const github = new GitHub();
			const actions = buildGitHubActionsClient();

			const existingIssues = buildIssues({ max: 3, labels: ["test-label"] });
			const existingPullRequests = buildPullRequests({ max: 3, labels: ["test-label"] });
			const expectedLabelsIgnored = UnorderedList.fromArray(BLOCKED_LABELS);

			vi.spyOn(github, "listPullRequests").mockImplementation(() => existingPullRequests);
			vi.spyOn(github, "listIssues").mockImplementation(() => existingIssues);
			const createOrUpdateIssueSpy = vi
				.spyOn(github, "createOrUpdateIssue")
				.mockImplementation(() => existingIssues[0]);

			// WHEN
			await createMonthlyRoadmapReport({ github, actions });

			// THEN
			expect(createOrUpdateIssueSpy).toHaveBeenCalledWith(
				expect.objectContaining({ body: expect.stringContaining(expectedLabelsIgnored) }),
			);
		});

		it("build report even when no data is found", async () => {
			// GIVEN
			const github = new GitHub();
			const actions = buildGitHubActionsClient();

			const noDataFound = Promise.resolve([]);
			const reportIssue = buildIssues({ max: 1 })[0];

			vi.spyOn(github, "listPullRequests").mockImplementation(() => noDataFound);
			vi.spyOn(github, "listIssues").mockImplementation(() => noDataFound);
			const createOrUpdateIssueSpy = vi.spyOn(github, "createOrUpdateIssue").mockImplementation(() => reportIssue);

			// WHEN
			await createMonthlyRoadmapReport({ github, actions });

			// THEN
			expect(createOrUpdateIssueSpy).toHaveBeenCalledWith(
				expect.objectContaining({ body: expect.stringContaining(NO_CONTENT_AVAILABLE_DEFAULT) }),
			);
		});

		it("include GitHub workflow run link in the report", async () => {
			// GIVEN
			const repo = "test-org/test-repo";
			const runId = "test";

			vi.stubEnv("GITHUB_REPOSITORY", repo);
			vi.stubEnv("GITHUB_RUN_ID", runId);
			vi.stubEnv("GITHUB_ACTIONS", "true");

			const github = new GitHub();
			const actions = buildGitHubActionsClient();

			const noDataFound = Promise.resolve([]);
			const reportIssue = buildIssues({ max: 1 })[0];

			vi.spyOn(github, "listPullRequests").mockImplementation(() => noDataFound);
			vi.spyOn(github, "listIssues").mockImplementation(() => noDataFound);
			const createOrUpdateIssueSpy = vi.spyOn(github, "createOrUpdateIssue").mockImplementation(() => reportIssue);

			// WHEN
			await createMonthlyRoadmapReport({ github, actions });

			// THEN
			expect(createOrUpdateIssueSpy).toHaveBeenCalledWith(
				expect.objectContaining({ body: expect.stringContaining(actions.getWorkflowRunUrl()) }),
			);
		});

		it("do not include GitHub workflow run in the report if it was not generated in GH Actions", async () => {
			// GIVEN
			const github = new GitHub();
			const actions = buildGitHubActionsClient();

			const noDataFound = Promise.resolve([]);
			const reportIssue = buildIssues({ max: 1 })[0];

			vi.spyOn(github, "listPullRequests").mockImplementation(() => noDataFound);
			vi.spyOn(github, "listIssues").mockImplementation(() => noDataFound);
			const createOrUpdateIssueSpy = vi.spyOn(github, "createOrUpdateIssue").mockImplementation(() => reportIssue);

			// WHEN
			await createMonthlyRoadmapReport({ github, actions });

			// THEN
			expect(createOrUpdateIssueSpy).toHaveBeenCalledWith(
				expect.objectContaining({ body: expect.not.stringContaining("/actions/runs") }),
			);
		});
	});
});
