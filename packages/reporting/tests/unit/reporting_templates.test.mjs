import { buildGitHubActionsClient } from "testing/src/builders/index.mjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BLOCKED_LABELS, NO_CONTENT_AVAILABLE_DEFAULT } from "../../src/constants.mjs";
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
			const expectedReport = new MonthlyRoadmapTemplate();

			// WHEN
			const reportBody = expectedReport.build();

			// THEN
			expect(reportBody).not.toContain("/actions/runs");
		});
	});
});
