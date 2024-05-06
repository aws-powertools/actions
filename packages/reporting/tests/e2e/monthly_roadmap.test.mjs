import { GitHub } from "github/src/client";
import { projectStatusFromIssues } from "github/src/graphql/queries/projects.mjs";
import { buildGitHubActionsClient } from "testing/src/builders/index.mjs";
import { describe, expect, it } from "vitest";
import { REPORT_ROADMAP_LABEL } from "../../src/constants.mjs";
import { ProjectIssue } from "../../src/models/ProjectIssue.mjs";
import { MonthlyRoadmapReport } from "../../src/reports/MonthlyRoadmapReport.mjs";

describe("monthly roadmap end-to-end test", () => {
	const SOURCE_REPOSITORY = "aws-powertools/powertools-lambda-python";
	const DESTINATION_REPOSITORY = "aws-powertools/actions";

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

	it.todo("should fetch issues in triage state", async () => {
		const github = new GitHub({ repository: SOURCE_REPOSITORY });

		const ret = await github.client.graphql(projectStatusFromIssues, {
			org: SOURCE_REPOSITORY.split("/")[0],
			repo: SOURCE_REPOSITORY.split("/")[1],
			fromDate: "2024-05-06T00:00:00Z",
			headers: {
				authorization: `token ${github.token}`,
			}
		})

		const {
			organization: { repository: { issues: { items: data } } }
		} = ret
		
		const projectIssues = data.map(issue => new ProjectIssue(issue));

		const triageIssues = data.filter((issue) => {
			return issue.projects.items.some((project) => project.projectStatus.status === 'Triage');
		});
		
		console.log(ret)
	})
});
