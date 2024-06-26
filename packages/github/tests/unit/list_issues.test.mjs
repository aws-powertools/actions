import { BLOCKED_LABELS } from "@aws-powertools-actions/reporting/constants";
import { buildIssues } from "@aws-powertools-actions/testing/builders";
import { describe, expect, it, vi } from "vitest";
import { MAX_ISSUES_PER_PAGE } from "../../src/constants.mjs";
import { filterByMinDaysWithoutUpdate } from "../../src/filters/issues.mjs";
import { getDateWithDaysDelta } from "../../src/functions.mjs";
import { GitHub } from "../../src/index.mjs";

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

	it("should limit the number of issues returned", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 5 });
		const maxExpected = 1;

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: existingIssues };
		});

		// WHEN
		const issues = await github.listIssues({ limit: maxExpected });

		expect(issues.length).toBe(maxExpected);
		expect(issues.length).not.toBe(existingIssues.length);
	});

	it("should filter pull requests out from results", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 2 });
		const existingPullRequestsAsIssues = buildIssues({ max: 2, isPr: true });

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: [...existingIssues, ...existingPullRequestsAsIssues] };
		});

		// WHEN
		const issues = await github.listIssues();

		expect(issues.length).toBe(existingIssues.length);
	});

	it("should exclude issues containing certain labels", async () => {
		// GIVEN
		const existingIssues = buildIssues({ max: 2, labels: BLOCKED_LABELS });

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: existingIssues };
		});

		// WHEN
		const issues = await github.listIssues({ excludeLabels: BLOCKED_LABELS });

		// THEN
		expect(issues.length).not.toBe(existingIssues.length);
	});

	it("should exclude issues this week", async () => {
		// GIVEN
		const todayIssues = buildIssues({
			max: 2,
			overrides: {
				created_at: getDateWithDaysDelta(0).toISOString(),
			},
		});
		const lastWeekIssues = buildIssues({
			max: 2,
			overrides: {
				created_at: getDateWithDaysDelta(-7).toISOString(),
			},
		});

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: [...todayIssues, lastWeekIssues] };
		});

		// WHEN
		const issues = await github.listIssues({ minDaysOld: 7 });

		// THEN
		expect(issues.length).not.toBe(lastWeekIssues.length);
	});

	it("should exclude issues updated in the last 7 days", async () => {
		// GIVEN
		const minDaysWithoutUpdate = 7;

		const todayIssues = buildIssues({
			max: 3,
			overrides: {
				updated_at: getDateWithDaysDelta(0).toISOString(),
			},
		});

		const lastWeekIssues = buildIssues({
			max: 2,
			overrides: {
				updated_at: getDateWithDaysDelta(-minDaysWithoutUpdate).toISOString(),
			},
		});

		const expectedIssues = filterByMinDaysWithoutUpdate([...todayIssues, ...lastWeekIssues], minDaysWithoutUpdate);

		const github = new GitHub();
		vi.spyOn(github.client.paginate, "iterator").mockImplementation(async function* () {
			yield { data: [...todayIssues, ...lastWeekIssues] };
		});

		// WHEN
		const issues = await github.listIssues({ minDaysWithoutUpdate });

		// THEN
		expect(issues).toStrictEqual(expectedIssues);
	});
});
