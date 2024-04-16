import { HttpResponse, http } from "msw";

export const findIssueHandler = ({ data }) => {
	return [
		http.get("https://api.github.com/search/issues", ({ request, params }) => {
			return HttpResponse.json(data);
		}),
	];
};
