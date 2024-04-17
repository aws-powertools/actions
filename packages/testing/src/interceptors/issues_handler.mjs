import { HttpResponse, http } from "msw";

export const findIssueHandler = ({ data }) => {
	return [
		http.get("https://api.github.com/search/issues", ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

export const findIssueFailureHandler = ({ err = "Unable to process request" }) => {
	return [
		http.get("https://api.github.com/search/issues", ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};

export const listIssuesHandler = ({ data, org, repo }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/issues`, ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};

export const listIssuesFailureHandler = ({ org, repo, err = "Unable to process request" }) => {
	return [
		http.get(`https://api.github.com/repos/${org}/${repo}/issues`, ({ request, params }) => {
			return new HttpResponse(err, { status: 500 });
		}),
	];
};
