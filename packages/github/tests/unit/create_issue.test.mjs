import {faker} from "@faker-js/faker";
import {buildIssues} from "testing/src/builders/index.mjs";
import {describe, expect, it, vi} from "vitest";
import {GitHub} from "../../src/client/index.mjs";

describe("create issue", () => {
	it("should create issue (default params)", async () => {
		// GIVEN
		const issueTitle = faker.lorem.sentence(5);
		const createdIssue = buildIssues({ max: 1, overrides: { title: issueTitle } })[0];

		const github = new GitHub();
		const createIssueOptions = {
			owner: github.owner,
			repo: github.repo,
			title: issueTitle,
			body: undefined,
			labels: undefined,
			assignees: undefined,
			milestone: undefined,
		};

		const createIssueSpy = vi.spyOn(github.client.rest.issues, "create").mockImplementation(async () => {
			return { data: createdIssue };
		});

		// WHEN
		const issue = await github.createIssue({ title: issueTitle });

		// THEN
		expect(issue).toStrictEqual(createdIssue);
		expect(createIssueSpy).toHaveBeenCalledWith(expect.objectContaining(createIssueOptions));
	});

	it("should not create an issue without title", async () => {
		// GIVEN
		const github = new GitHub();

		// WHEN
		// THEN
		await expect(github.createIssue()).rejects.toThrow("Issue title is required")
	});

});
