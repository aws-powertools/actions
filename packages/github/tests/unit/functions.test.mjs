import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
import { diffInDaysFromToday, formatISOtoLongDate } from "../../src/functions.mjs";

describe("utility functions", () => {
	describe("datetime functions", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-12T16:36:00Z"));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("test diff between two dates in days", () => {
			const now = new Date();
			const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Two days in milliseconds

			expect(diffInDaysFromToday(twoDaysAgo)).toBe(2);
		});

		test("format ISO date", () => {
			const date = "2024-01-01T12:00:00Z";
			expect(formatISOtoLongDate(date)).toBe("January 1, 2024");
		});
	});
});
