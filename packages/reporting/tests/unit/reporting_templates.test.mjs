import {
	buildGitHubActionsClient,
	buildIssues,
	buildLongRunningPullRequests,
	buildPullRequests,
	buildTopFeatureRequests,
	buildTopMostCommented,
	buildTopOldestIssues,
} from "testing/src/builders/index.mjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BLOCKED_LABELS, FEATURE_REQUEST_LABEL, NO_CONTENT_AVAILABLE_DEFAULT } from "../../src/constants.mjs";
import { UnorderedList } from "../../src/markdown/index.mjs";
import { MonthlyRoadmapTemplate } from "../../src/templates/MonthlyRoadmapTemplate.mjs";

describe("build reporting templates", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe("monthly roadmap", () => {
		it("should include labels used that excluded issues and PRs", () => {
			// GIVEN
			const expectedLabelsIgnored = UnorderedList.fromArray(BLOCKED_LABELS);
			const expectedReport = new MonthlyRoadmapTemplate();

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			expect(reportBody).contains(expectedLabelsIgnored);
		});

		it("should use placeholder when there is no data", () => {
			// GIVEN
			const expectedReport = new MonthlyRoadmapTemplate();

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			expect(reportBody).contains(NO_CONTENT_AVAILABLE_DEFAULT);
		});

		it("should include GitHub workflow run link in the report when running in GitHub Actions", () => {
			// GIVEN
			const repo = "test-org/test-repo";
			const runId = "test";

			vi.stubEnv("GITHUB_REPOSITORY", repo);
			vi.stubEnv("GITHUB_RUN_ID", runId);
			vi.stubEnv("GITHUB_ACTIONS", "true");

			const actions = buildGitHubActionsClient();
			const expectedReport = new MonthlyRoadmapTemplate();

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			expect(reportBody).contains(actions.getWorkflowRunUrl());
		});

		it("should not include GitHub workflow run link in the report when not running in GitHub Actions", () => {
			// GIVEN
			vi.stubEnv("GITHUB_REPOSITORY", "");
			vi.stubEnv("GITHUB_RUN_ID", "");
			vi.stubEnv("GITHUB_ACTIONS", "");

			const expectedReport = new MonthlyRoadmapTemplate();

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			expect(reportBody).not.toContain("/actions/runs");
		});

		it("should include top feature requests", () => {
			// GIVEN
			const existingFeatureRequests = buildIssues({ max: 2, labels: [FEATURE_REQUEST_LABEL] });
			const expectedTopFeatureRequests = buildTopFeatureRequests(existingFeatureRequests);
			const expectedReport = new MonthlyRoadmapTemplate({ featureRequests: expectedTopFeatureRequests });

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			for (const featureRequest of expectedTopFeatureRequests) {
				expect(reportBody).contains(featureRequest.title);
			}
		});

		it("should include top oldest issues", () => {
			// GIVEN
			const existingIssues = buildIssues({ max: 2 });
			const expectedOldestIssues = buildTopOldestIssues(existingIssues);
			const expectedReport = new MonthlyRoadmapTemplate({ oldestIssues: expectedOldestIssues });

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			for (const oldIssue of expectedOldestIssues) {
				expect(reportBody).contains(oldIssue.title);
			}
		});

		it("should include most commented issues", () => {
			// GIVEN
			const existingIssues = buildIssues({ max: 2 });
			const expectedMostCommentedIssues = buildTopMostCommented(existingIssues);
			const expectedReport = new MonthlyRoadmapTemplate({ mostActiveIssues: expectedMostCommentedIssues });

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			for (const activeIssue of expectedMostCommentedIssues) {
				expect(reportBody).contains(activeIssue.title);
			}
		});

		it("should include long running pull requests", () => {
			// GIVEN
			const existingPullRequests = buildPullRequests({ max: 2 });
			const expectedLongRunningPRs = buildLongRunningPullRequests(existingPullRequests);
			const expectedReport = new MonthlyRoadmapTemplate({ longRunningPRs: expectedLongRunningPRs });

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			for (const longRunningPR of expectedLongRunningPRs) {
				expect(reportBody).contains(longRunningPR.title);
			}
		});
	});
});
