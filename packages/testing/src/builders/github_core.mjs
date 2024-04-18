import { Octokit } from "@octokit/rest";
import { vi } from "vitest";

/**
 * Builds and returns a new Octokit client instance for interacting with the GitHub API.
 * @param {Object} options - Client config.
 * @param {string} options.token - Authentication token for GitHub API.
 * @param {boolean} [options.debug=false] - Whether debug logging is enabled.
 * @returns {Octokit} - The Octokit client instance.
 */
export function buildGithubClient({ token, debug = false }) {
	return new Octokit({
		auth: token,
		log: console,
		...(debug ? {} : { log: debug }),
	});
}

/**
 * Builds and returns a GitHub context object with the provided organization and repository information.
 *
 * @typedef {Object} GitHubContext
 * @property {Object} repo - The repository information.
 * @property {string} repo.owner - The GitHub organization name.
 * @property {string} repo.repo - The GitHub repository name.
 *
 * @param {Object} options - The options object.
 * @param {string} options.org - The organization name.
 * @param {string} options.repo - The repository name.
 *
 * @returns {GitHubContext} - The GitHub context object with owner and repository details.
 */
export function buildGithubContext({ org, repo }) {
	return {
		repo: {
			owner: org,
			repo: repo,
		},
	};
}

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
