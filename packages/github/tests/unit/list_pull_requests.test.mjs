import { BLOCKED_LABELS } from "@aws-powertools-actions/reporting/constants";
import { buildPullRequests } from "@aws-powertools-actions/testing/builders";
import { describe, expect, it, vi } from "vitest";
import { MAX_PULL_REQUESTS_PER_PAGE } from "../../src/constants.mjs";
import { filterByMinDaysWithoutUpdate } from "../../src/filters/issues.mjs";
import { getDateWithDaysDelta } from "../../src/functions.mjs";
import { GitHub } from "../../src/index.mjs";

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

	it("should exclude pull requests not created a week ago", async () => {
		// GIVEN
		const todayPullRequests = buildPullRequests({
			max: 2,
			overrides: {
				created_at: getDateWithDaysDelta(0).toISOString(),
			},
		});

		const lastWeekPullRequests = buildPullRequests({
			max: 2,
			overrides: {
				created_at: getDateWithDaysDelta(-7).toISOString(),
			},
		});

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: [...todayPullRequests, ...lastWeekPullRequests] };
		});

		// WHEN
		const prs = await github.listPullRequests({ minDaysOld: 7 });

		// THEN
		expect(prs.length).toBe(lastWeekPullRequests.length);
	});

	it("should exclude pull requests updated in the last 7 days ", async () => {
		// GIVEN
		const minDaysWithoutUpdate = 7;
		const todayPullRequests = buildPullRequests({
			max: 2,
			overrides: {
				updated_at: getDateWithDaysDelta(0).toISOString(),
			},
		});

		const lastWeekPullRequests = buildPullRequests({
			max: 2,
			overrides: {
				updated_at: getDateWithDaysDelta(-minDaysWithoutUpdate).toISOString(),
			},
		});

		const pullRequests = [...todayPullRequests, ...lastWeekPullRequests];
		const expectedPullRequests = filterByMinDaysWithoutUpdate(pullRequests, minDaysWithoutUpdate);

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: pullRequests };
		});

		// WHEN
		const ret = await github.listPullRequests({ minDaysWithoutUpdate });

		// THEN
		expect(ret).toStrictEqual(expectedPullRequests);
	});
});
