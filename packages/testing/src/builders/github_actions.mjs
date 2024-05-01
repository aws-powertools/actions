import { GitHubActions } from "github/src/client/index.mjs";
import { vi } from "vitest";

/**
 * Returns a mocked GitHub Actions Client with a mocked `core` lib that builds job summaries.
 * @returns {GitHubActions}- Core object mock.
 */
export function buildGitHubActionsClient() {
	return new GitHubActions({
		core: vi.mocked({
			summary: {
				addHeading: vi.fn().mockReturnThis(),
				addLink: vi.fn().mockReturnThis(),
				write: vi.fn(),
			},
		}),
	});
}
