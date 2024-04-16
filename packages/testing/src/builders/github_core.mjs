import { vi } from "vitest";
import { Octokit } from "@octokit/rest";

export function buildGithubClient({ token }) {
	return new Octokit({
		auth: token,
		log: console,
	});
}

export function buildGithubContext({ org, repo }) {
	return {
		repo: {
			owner: org,
			repo: repo,
		},
	};
}

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
