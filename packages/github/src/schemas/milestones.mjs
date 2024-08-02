import { z } from "zod";

export const milestoneSchema = z.array(
	z
		.object({
			url: z.string().url(),
			html_url: z.string().url(),
			labels_url: z.string().url(),
			id: z.number().int(),
			node_id: z.string(),
			number: z.number().int().describe("The number of the milestone."),
			state: z.enum(["open", "closed"]).describe("The state of the milestone."),
			title: z.string().describe("The title of the milestone."),
			description: z.union([z.string(), z.null()]),
			creator: z.union([
				z.null(),
				z
					.object({
						name: z.union([z.string(), z.null()]).optional(),
						email: z.union([z.string(), z.null()]).optional(),
						login: z.string(),
						id: z.number().int(),
						node_id: z.string(),
						avatar_url: z.string().url(),
						gravatar_id: z.union([z.string(), z.null()]),
						url: z.string().url(),
						html_url: z.string().url(),
						followers_url: z.string().url(),
						following_url: z.string(),
						gists_url: z.string(),
						starred_url: z.string(),
						subscriptions_url: z.string().url(),
						organizations_url: z.string().url(),
						repos_url: z.string().url(),
						events_url: z.string(),
						received_events_url: z.string().url(),
						type: z.string(),
						site_admin: z.boolean(),
						starred_at: z.string().optional(),
					})
					.describe("A GitHub user."),
			]),
			open_issues: z.number().int(),
			closed_issues: z.number().int(),
			created_at: z.string(),
			updated_at: z.string(),
			closed_at: z.union([z.string(), z.null()]),
			due_on: z.union([z.string(), z.null()]),
		})
		.describe("A collection of related issues and pull requests."),
);
