import { HttpResponse, http } from "msw";

export const listPullRequestsHandler = ({ data, org, repo }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/pulls`, ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

export const listPullRequestsFailureHandler = ({ org, repo, err = "Unable to process request" }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/pulls`, ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};
