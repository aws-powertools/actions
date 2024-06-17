import { GitHub } from "@aws-powertools-actions/github";
import { buildGitHubActionsClient } from "@aws-powertools-actions/testing/builders";
import { describe, expect, it } from "vitest";
import { REPORT_ROADMAP_LABEL } from "../../src/constants.mjs";
import { MonthlyRoadmapReport } from "../../src/reports/MonthlyRoadmapReport.mjs";

describe("monthly roadmap end-to-end test", () => {
	const SOURCE_REPOSITORY = process.env.E2E_SOURCE_REPOSITORY || "aws-powertools/powertools-lambda-python";
	const DESTINATION_REPOSITORY = process.env.E2E_DESTINATION_REPOSITORY || "aws-powertools/actions";

	it("should create a monthly report", async () => {
		// GIVEN
		const github = new GitHub({ repository: SOURCE_REPOSITORY });
		const stagingGitHub = new GitHub({ repository: DESTINATION_REPOSITORY });
		const actions = buildGitHubActionsClient();
		const reporting = new MonthlyRoadmapReport({ github, actions });

		// WHEN
		const report = await reporting.build();
		const issue = await new MonthlyRoadmapReport({ github: stagingGitHub, actions }).create({ report });

		// THEN
		expect(issue.title).toBe(reporting.title);
		expect(issue.body).toBe(report);
		expect(issue.labels[0].name).toBe(REPORT_ROADMAP_LABEL);
	});
});
