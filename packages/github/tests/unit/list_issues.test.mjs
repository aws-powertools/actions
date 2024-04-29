import { buildIssues } from "testing/src/builders/index.mjs";
import { describe, expect, it, vi } from "vitest";
import { GitHub } from "../../src/client/index.mjs";
import { MAX_ISSUES_PER_PAGE } from "../../src/constants.mjs";

describe("list issues", () => {
	it("should list issues (default params)", async () => {
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
		const issues = await github.listIssues();

		// THEN
		expect(issues).toStrictEqual(existingIssues);
		expect(paginateSpy).toHaveBeenCalledWith(
			github.client.rest.issues.listForRepo,
			expect.objectContaining(listIssuesOptions),
		);
	});
});
