import { issueSchema } from "github/src/schemas/issues.mjs";
import { z } from "zod";
import { Issue } from "./Issue.mjs";

/**
 * Represents a popular feature request for reporting.
 */
export class PopularFeatureRequest extends Issue {
	/**
	 * Creates a new instance of the TopFeatureRequest class.
	 * @param {z.infer<typeof issueSchema>} issue - A GitHub issue.
	 */
	constructor(issue) {
		super(issue);

		/**
		 * The total number of reactions on the feature request.
		 * @type {number}
		 */
		this.reaction_count = issue.reactions.total_count;
	}
}
