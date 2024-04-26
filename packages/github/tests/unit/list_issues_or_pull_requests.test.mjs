import { GitHub } from "github/src/client";
import { buildIssues, buildPullRequests } from "testing/src/builders";
import { describe, expect, it, vi } from "vitest";
import { MAX_ISSUES_PER_PAGE } from "../../src/constants.mjs";

describe("list issue", () => {
	it("list issues (default params)", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 2 });
		const github = new GitHub();
		const listIssuesOptions = {
			owner: github.owner,
			repo: github.repo,
			per_page: MAX_ISSUES_PER_PAGE,
			direction: "asc",
			labels: undefined,
			sort: undefined,
		};

		const paginateSpy = vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: existingIssues };
		});

		// WHEN
		const issues = await github.listIssues({ github });

		// THEN
		expect(issues).toStrictEqual(existingIssues);
		expect(paginateSpy).toHaveBeenCalledWith(
			github.client.rest.issues.listForRepo,
			expect.objectContaining(listIssuesOptions),
		);
	});

	it.todo("list pull requests", async () => {
		// GIVEN
		const existingPullRequests = buildPullRequests({ max: 2 });
		const github = new GitHub();
		const listPullRequestsSpy = vi.spyOn(github, "listPullRequests").mockImplementation(() => existingPullRequests);

		// WHEN
		const pullRequests = github.listPullRequests({ github });

		// THEN
		expect(pullRequests).toBe(existingPullRequests);
		expect(listPullRequestsSpy).toHaveBeenCalledWith({
			github,
		});
	});
});
