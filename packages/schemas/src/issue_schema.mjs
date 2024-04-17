import { z } from "zod";

const userSchema = z.object({
	login: z.string(),
	id: z.number(),
	node_id: z.string(),
	avatar_url: z.string().url(),
	gravatar_id: z.string(),
	url: z.string(),
	html_url: z.string().url(),
	followers_url: z.string().url(),
	following_url: z.string().url(),
	gists_url: z.string(),
	starred_url: z.string(),
	subscriptions_url: z.string().url(),
	organizations_url: z.string().url(),
	repos_url: z.string().url(),
	events_url: z.string().url(),
	received_events_url: z.string().url(),
	type: z.enum(["Bot", "User"]),
	site_admin: z.boolean(),
});

export const labelSchema = z.object({
	id: z.number(),
	node_id: z.string(),
	url: z.string(),
	name: z.string(),
	color: z.string(),
	default: z.boolean(),
	description: z.string(),
});

const reactionsSchema = z.object({
	url: z.string(),
	total_count: z.number(),
	"+1": z.number(),
	"-1": z.number(),
	laugh: z.number(),
	hooray: z.number(),
	confused: z.number(),
	heart: z.number(),
	rocket: z.number(),
	eyes: z.number(),
});

const githubAppSchema = z.object({
	id: z.number(),
	node_id: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z.string(),
	external_url: z.string().url(),
	html_url: z.string().url(),
});

export const issueSchema = z.object({
	url: z.string(),
	repository_url: z.string().url(),
	labels_url: z.string().url(),
	comments_url: z.string().url(),
	events_url: z.string().url(),
	html_url: z.string().url(),
	id: z.number(),
	node_id: z.string(),
	number: z.number(),
	title: z.string(),
	user: userSchema,
	labels: z.array(labelSchema),
	state: z.enum(["open", "closed"]),
	locked: z.boolean(),
	assignee: userSchema.nullable(),
	assignees: z.array(userSchema.nullable()),
	milestone: z.null(),
	comments: z.number(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime().nullable(),
	closed_at: z.string().datetime().nullable(),
	author_association: z.string(),
	active_lock_reason: z.null(),
	body: z.string(),
	reactions: reactionsSchema,
	timeline_url: z.string().url(),
	performed_via_github_app: githubAppSchema.nullable(),
	state_reason: z.null(),
});

/**
 * When a Pull Request is returned from GitHub Issues API
 */
export const pullRequestIssueSchema = z.object({
	diff_url: z.string().url(),
	html_url: z.string().url(),
	patch_url: z.string().url(),
	url: z.string().url(),
	merged_at: z.string().datetime().nullable(),
});
