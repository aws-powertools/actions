import { GitHub } from "@aws-powertools-actions/github";
import { buildGitHubActionsClient } from "@aws-powertools-actions/testing/builders";
import { describe, expect, it } from "vitest";
import { REPORT_ROADMAP_LABEL } from "../../src/constants.mjs";
import { WeeklyRoadmapReport } from "../../src/reports/WeeklyRoadmapReport.mjs";

describe("weekly roadmap end-to-end test", () => {
	const SOURCE_REPOSITORY = "aws-powertools/powertools-lambda-dotnet";
	const DESTINATION_REPOSITORY = "aws-powertools/actions";
	const TITLE = "Roadmap update reminder weekly - .NET";

	it("should create a weekly report", async () => {
		// GIVEN
		const github = new GitHub({ repository: SOURCE_REPOSITORY });
		const stagingGitHub = new GitHub({ repository: DESTINATION_REPOSITORY });
		const actions = buildGitHubActionsClient();
		const reporting = new WeeklyRoadmapReport({
			github,
			actions,
			title: TITLE,
		});

		// WHEN
		const report = await reporting.build();
		const issue = await new WeeklyRoadmapReport({ github: stagingGitHub, actions, title: TITLE }).create({ report });

		// THEN
		expect(issue.title).toBe(reporting.title);
		expect(issue.body).toBe(report);
		expect(issue.labels[0].name).toBe(REPORT_ROADMAP_LABEL);
	});
});
