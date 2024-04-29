import {GitHub} from "github/src/client";
import {buildPullRequests} from "testing/src/builders";
import {describe, expect, it, vi} from "vitest";
import {MAX_PULL_REQUESTS_PER_PAGE} from "../../src/constants.mjs";

describe("listing pull requests", () => {
	it("should list pull requests (default params)", async () => {
		// GIVEN
		const existingPullRequests = buildPullRequests({ max: 2 });
		const github = new GitHub();
		const listPullRequestsOptions = {
			owner: github.owner,
			repo: github.repo,
			state: "open",
			sort: undefined,
			direction: "asc",
			per_page: MAX_PULL_REQUESTS_PER_PAGE,
		};

		const paginateSpy = vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield {data: existingPullRequests};
		});

		// WHEN
		const issues = await github.listPullRequests();

		// THEN
		expect(issues).toStrictEqual(existingPullRequests);
		expect(paginateSpy).toHaveBeenCalledWith(
			github.client.rest.pulls.list,
			expect.objectContaining(listPullRequestsOptions),
		);
	});
});
