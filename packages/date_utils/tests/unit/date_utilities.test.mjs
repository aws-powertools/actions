import { expect, test } from "vitest";
import { formatISOtoLongDate } from "../../src/formatter.mjs";
import { diffInDaysFromToday } from "../../src/date_diff.mjs";

test("format ISO date", () => {
	const date = new Date("2024-01-01T12:00:00Z");
	expect(formatISOtoLongDate(date)).toBe("January 1, 2024");
});

test("test diff between two dates in days", () => {
	const now = new Date();
	const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Two days in milliseconds

	expect(diffInDaysFromToday(twoDaysAgo)).toBe(2);
});
