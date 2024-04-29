import { GitHub } from "github/src/client";
import { buildGitHubActionsClient } from "testing/src/builders/index.mjs";
import { describe, expect, it } from "vitest";
import { REPORT_ROADMAP_LABEL } from "../../src/constants.mjs";
import { buildMonthlyRoadmapReport, createMonthlyRoadmapReport } from "../../src/monthly_roadmap.mjs";

describe("monthly roadmap end-to-end test", () => {
	const SOURCE_REPOSITORY = "aws-powertools/powertools-lambda-python";
	const DESTINATION_REPOSITORY = "aws-powertools/actions";

	it("should create a monthly report", async () => {
		// GIVEN
		const github = new GitHub({ repository: SOURCE_REPOSITORY });
		const stagingGitHub = new GitHub({ repository: DESTINATION_REPOSITORY });
		const actions = buildGitHubActionsClient();

		// WHEN
		const report = await buildMonthlyRoadmapReport({ github });
		const reportIssue = await createMonthlyRoadmapReport({ github: stagingGitHub, actions, existingReport: report });

		// THEN
		expect(reportIssue.title).toBe(report.title);
		expect(reportIssue.labels[0].name).toBe(REPORT_ROADMAP_LABEL);
	});
});
