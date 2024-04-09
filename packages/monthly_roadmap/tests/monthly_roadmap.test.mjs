import { formatDate } from "../src/index.mjs";
import { expect, test } from "vitest";

test("format date", () => {
  let date = new Date("2024-01-01T12:00:00Z");
  expect(formatDate(date)).toBe("January 1, 2025");
});
