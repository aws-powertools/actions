import { buildSearchIssues } from "testing/src/builders/index.mjs";
import { describe, expect, it, vi } from "vitest";
import { GitHub } from "../../src/client/index.mjs";

describe("find issue", () => {
	it("should find issue (default params)", async () => {
		// GIVEN
		const issueTitle = "New bug";
		const foundIssue = buildSearchIssues({ max: 1, overrides: { title: issueTitle } });
		const searchQuery = `${issueTitle} is:issue label:bug in:title`;

		const github = new GitHub();
		const findIssueOptions = {
			q: searchQuery,
		};

		const searchSpy = vi.spyOn(github.client.rest.search, "issuesAndPullRequests").mockImplementation(async () => {
			return { data: foundIssue };
		});

		// WHEN
		const issue = await github.findIssue({ searchQuery });

		// THEN
		expect(issue).toStrictEqual(foundIssue.items);
		expect(searchSpy).toHaveBeenCalledWith(
			expect.objectContaining(findIssueOptions),
		);
	});
});
