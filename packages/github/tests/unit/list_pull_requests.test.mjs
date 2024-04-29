import { GitHub } from "github/src/client";
import { BLOCKED_LABELS } from "reporting/src/constants.mjs";
import { buildPullRequests } from "testing/src/builders";
import { describe, expect, it, vi } from "vitest";
import { MAX_PULL_REQUESTS_PER_PAGE } from "../../src/constants.mjs";

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
			yield { data: existingPullRequests };
		});

		// WHEN
		const prs = await github.listPullRequests();

		// THEN
		expect(prs).toStrictEqual(existingPullRequests);
		expect(paginateSpy).toHaveBeenCalledWith(
			github.client.rest.pulls.list,
			expect.objectContaining(listPullRequestsOptions),
		);
	});

	it("should limit the number of pull requests returned", async () => {
		// GIVEN
		const existingPullRequests = buildPullRequests({ max: 3 });
		const maxExpected = 1;

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: existingPullRequests };
		});

		// WHEN
		const prs = await github.listPullRequests({ limit: maxExpected });

		// THEN
		expect(prs.length).toBe(maxExpected);
	});

	it("should exclude results with certain labels", async () => {
		// GIVEN
		const existingPullRequests = buildPullRequests({ max: 2, labels: BLOCKED_LABELS });

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: existingPullRequests };
		});

		// WHEN
		const prs = await github.listPullRequests({ excludeLabels: BLOCKED_LABELS });

		// THEN
		expect(prs.length).toBe(0);
	});
});
