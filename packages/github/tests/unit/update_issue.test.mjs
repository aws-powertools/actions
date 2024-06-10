import { buildIssues } from "@aws-powertools-actions/testing/builders";
import { describe, expect, it, vi } from "vitest";
import { GitHub } from "../../src/index.mjs";

describe("update issue", () => {
	it("should update issue (default params)", async () => {
		// GIVEN
		const issueNumber = 1;
		const updatedIssue = buildIssues({ max: 1 })[0];

		const github = new GitHub();
		const updateIssueOptions = {
			owner: github.owner,
			repo: github.repo,
			issue_number: issueNumber,
			body: undefined,
			labels: undefined,
			title: undefined,
			assignees: undefined,
			state: undefined,
			milestone: undefined,
		};

		const updateIssueSpy = vi.spyOn(github.client.rest.issues, "update").mockImplementation(async () => {
			return { data: updatedIssue };
		});

		// WHEN
		const issue = await github.updateIssue({ issueNumber });

		// THEN
		expect(issue).toStrictEqual(updatedIssue);
		expect(updateIssueSpy).toHaveBeenCalledWith(expect.objectContaining(updateIssueOptions));
	});

	it("should not update an issue without title", async () => {
		// GIVEN
		const github = new GitHub();

		// WHEN
		// THEN
		await expect(github.updateIssue()).rejects.toThrow("Issue number is required");
	});
});
