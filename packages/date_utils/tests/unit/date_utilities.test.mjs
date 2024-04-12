import {afterEach, beforeEach, describe, expect, it, test, vi} from "vitest";
import {diffInDaysFromToday} from "../../src/date_diff.mjs";
import {formatISOtoLongDate} from "../../src/formatter.mjs";

test("format ISO date", () => {
	const date = "2024-01-01T12:00:00Z"
	expect(formatISOtoLongDate(date)).toBe("January 1, 2024");
});

describe("differences between dates", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("test diff between two dates in days", () => {
		vi.setSystemTime(new Date("2024-04-12T16:36:00Z"));

		const now = new Date();
		const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Two days in milliseconds

		expect(diffInDaysFromToday(twoDaysAgo)).toBe(2);
	});
});
