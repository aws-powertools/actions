import { vi } from "vitest";

/**
 * Returns a mocked GitHub Actions Core object for info, error, debug logging, and summary generation.
 * @typedef {typeof import("@actions/core/lib/core")} GitHubCore
 * @returns {GitHubCore}- Core object mock.
 */
export function buildGithubCore() {
	return vi.mocked({
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
		summary: {
			addHeading: vi.fn().mockReturnThis(),
			addLink: vi.fn().mockReturnThis(),
			write: vi.fn(),
		},
	});
}
