import { HttpResponse, http } from "msw";

export const listPullRequestsHandler = ({ data, org, repo }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/pulls`, ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};
