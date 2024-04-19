import { TopFeatureRequest } from "../../../monthly_roadmap/src/TopFeatureRequests.mjs";
import { issueSchema } from "../../../schemas/src/issue_schema.mjs";

/**
 * Builds an array of top feature requests from GitHub issues
 * @param {z.infer<typeof issueSchema>[]} issues - Top feature requests issues.
 * @returns {TopFeatureRequest[]} Feature requests - An array of top feature requests.
 */
export function buildTopFeatureRequests(issues) {
	return issues.map((issue) => new TopFeatureRequest(issue));
}
