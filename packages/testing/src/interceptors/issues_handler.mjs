import { http, HttpResponse } from "msw";

import { issueSchema, issueSearchSchema } from "@aws-powertools-actions/github/schemas/issues";

/**
 * Interceptor for GitHub Search issues and pull requests
 * API: https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28
 * @param {z.infer<typeof issueSearchSchema>} SearchResponse - Search results to return
 */
export const findIssueHandler = ({ data }) => {
	return [
		http.get("https://api.github.com/search/issues", ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

/**
 * Interceptor for GitHub Search issues and pull requests that returns HTTP 500
 * API: https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28
 * @param {string>} err - Error to return
 */
export const findIssueFailureHandler = ({ err = "Unable to process request" }) => {
	return [
		http.get("https://api.github.com/search/issues", ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};

/**
 * Interceptor for GitHub List Repository Issues
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
 * @param {Object} options - Config.
 * @param {z.infer<typeof issueSchema>} options.data - List Issues result.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 */
export const listIssuesHandler = ({ data, org, repo }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/issues`, ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

/**
 * Interceptor for GitHub List Repository Issues that returns HTTP 500
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
 * @param {Object} options - Config.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 * @param {string} options.err - Error to return.
 */
export const listIssuesFailureHandler = ({ org, repo, err = "Unable to process request" }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/issues`, ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};

/**
 * Interceptor for GitHub Create Issue
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue
 * @param {Object} options - Config.
 * @param {z.infer<typeof issueSchema>} options.data - List Issues result.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 */
export const createIssueHandler = ({ data, org, repo }) => {
	return [
		http.post(`https://api.github.com/repos/${org}/${repo}/issues`, async ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

/**
 * Interceptor for GitHub Create Issue that returns HTTP 500
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue
 * @param {Object} options - Config.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 * @param {string} options.err - Error to return.
 */
export const createIssueFailureHandler = ({ org, repo, err = "Unable to process request" }) => {
	return [
		http.post(`https://api.github.com/repos/${org}/${repo}/issues`, async ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};

/**
 * Interceptor for GitHub Update Issue
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue
 * @param {Object} options - Config.
 * @param {z.infer<typeof issueSchema>} options.data - Update Issue result.
 * @param {number} options.issueNumber - Issue number to update.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 */
export const updateIssueHandler = ({ data, issueNumber, org, repo }) => {
	return [
		http.patch(`https://api.github.com/repos/${org}/${repo}/issues/${issueNumber}`, async ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

/**
 * Interceptor for GitHub Update Issue
 * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue
 * @param {Object} options - Config.
 * @param {number} options.issueNumber - Issue number to update.
 * @param {string} options.org - The organization of the repository.
 * @param {string} options.repo - The repository name.
 * @param {string} options.err - Error to return.
 */
export const updateIssueFailureHandler = ({ issueNumber, org, repo, err = "Unable to process request" }) => {
	return [
		http.patch(`https://api.github.com/repos/${org}/${repo}/issues/${issueNumber}`, async ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};
