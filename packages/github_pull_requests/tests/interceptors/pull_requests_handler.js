import { HttpResponse, http } from "msw";

export const listPullRequestsHandler = ({ data, org, repo }) => {
	return [
		http.get("https://api.github.com/repos/aws-powertools/powertools-lambda-python/pulls", ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};
