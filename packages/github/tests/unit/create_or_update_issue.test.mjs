import { faker } from "@faker-js/faker";
import { GitHub } from "github/src/client";
import { buildIssues, buildSearchIssues } from "testing/src/builders";
import { describe, expect, it, vi } from "vitest";

describe("create or update issue", () => {
	it("create issue if one is not found", async () => {
		// GIVEN
		const notFound = buildSearchIssues({ max: 0 });
		const createdIssue = buildIssues({ max: 1 })[0];
		const github = new GitHub();
		const searchQuery = faker.lorem.sentence();
		const options = {
			owner: github.owner,
			repo: github.repo,
			title: "new issue",
			body: "nothing to see here",
			labels: [faker.lorem.sentence()],
			assignees: [faker.internet.userName()],
			milestone: 1,
		};

		const searchSpy = vi.spyOn(github.client.rest.search, "issuesAndPullRequests").mockImplementation(async () => {
			return { data: notFound };
		});

		const createIssueSpy = vi.spyOn(github.client.rest.issues, "create").mockImplementation(async () => {
			return { data: createdIssue };
		});

		// WHEN
		const newIssue = await github.createOrUpdateIssue({ searchQuery, ...options });

		// THEN
		expect(searchSpy).toHaveBeenCalled();
		expect(newIssue).toStrictEqual(createdIssue);
		expect(createIssueSpy).toHaveBeenCalledWith(expect.objectContaining(options));
	});

	it("update issue if one is found", async () => {
		// GIVEN
		const existingIssue = buildIssues({ max: 1 })[0];
		const foundIssue = buildSearchIssues({ issues: [existingIssue] });

		const github = new GitHub();
		const searchQuery = faker.lorem.sentence();
		const options = {
			owner: github.owner,
			repo: github.repo,
			issue_number: existingIssue.number,
			title: "new title",
			body: "nothing to see here",
			labels: [faker.lorem.sentence()],
			assignees: [faker.internet.userName()],
			state: undefined,
			milestone: 1,
		};

		const searchSpy = vi.spyOn(github.client.rest.search, "issuesAndPullRequests").mockImplementation(async () => {
			return { data: foundIssue };
		});

		const updateIssueSpy = vi.spyOn(github.client.rest.issues, "update").mockImplementation(async () => {
			return { data: existingIssue };
		});

		// WHEN
		const newIssue = await github.createOrUpdateIssue({ searchQuery, ...options });

		// THEN
		expect(searchSpy).toHaveBeenCalled();
		expect(newIssue).toStrictEqual(existingIssue);
		expect(updateIssueSpy).toHaveBeenCalledWith(expect.objectContaining(options));
	});
});
