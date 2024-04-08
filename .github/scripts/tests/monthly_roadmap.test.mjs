import { formatDate } from "../monthly_roadmap.mjs";
import { expect, test } from "vitest";

test("format date", () => {
  let date = new Date("2024-01-01T12:00:00Z");
  console.log(formatDate(date));
  expect(formatDate(date)).toBe("January 1, 2025");
});
