import { BLOCKED_LABELS } from "reporting/src/constants.mjs";
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
});
