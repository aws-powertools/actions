import { faker } from "@faker-js/faker";
import { GitHub } from "github/src/client";
import { buildIssues } from "testing/src/builders";
import { describe, expect, it, vi } from "vitest";

describe("create or update issue", () => {
	it("find issue using search", async () => {
		// GIVEN
		const existingIssue = buildIssues({ max: 1 });
		const searchQuery = faker.lorem.sentence();

		const github = new GitHub();
		const findIssueSpy = vi.spyOn(github, "findIssue").mockImplementation(() => existingIssue);

		// WHEN
		const issueFound = await github.findIssue({ searchQuery });

		// THEN
		expect(issueFound).toBe(existingIssue);
		expect(findIssueSpy).toHaveBeenCalledWith({
			searchQuery,
		});
	});
	it("create issue if one is not found", async () => {
		// GIVEN
		const searchResult = [];
		const createdIssue = buildIssues({ max: 1 });
		const searchQuery = faker.lorem.sentence();
		const options = {
			title: "new issue",
			body: "nothing to see here",
			labels: [faker.lorem.sentence()],
			assignees: [faker.internet.userName()],
			milestone: 1,
		};

		const github = new GitHub();
		const findIssueSpy = vi.spyOn(github, "findIssue").mockImplementation(() => searchResult);
		const createIssueSpy = vi.spyOn(github, "createIssue").mockImplementation(() => createdIssue);

		// WHEN
		const newIssue = await github.createOrUpdateIssue({ github, searchQuery, ...options });

		// THEN
		expect(newIssue).toStrictEqual(createdIssue);
		expect(findIssueSpy).toHaveBeenCalledWith({ searchQuery });
		expect(createIssueSpy).toHaveBeenCalledWith(options);
	});

	it("update issue if one is found", async () => {
		// GIVEN
		const existingIssue = buildIssues({ max: 1 });
		const searchQuery = faker.lorem.sentence();
		const options = {
			title: "new title",
			body: "nothing to see here",
			labels: [faker.lorem.sentence()],
			assignees: [faker.internet.userName()],
			milestone: 1,
		};

		const github = new GitHub();
		const findIssueSpy = vi.spyOn(github, "findIssue").mockImplementation(() => existingIssue);
		const updateIssueSpy = vi.spyOn(github, "updateIssue").mockImplementation(() => existingIssue);

		// WHEN
		const newIssue = await github.createOrUpdateIssue({ github, searchQuery, ...options });

		// THEN
		expect(findIssueSpy).toHaveBeenCalledWith({ searchQuery });
		expect(newIssue).toStrictEqual(existingIssue);
		expect(updateIssueSpy).toHaveBeenCalledWith({
			issueNumber: existingIssue[0].number,
			...options,
		});
	});
});
