import { z } from "zod";

const userSchema = z.object({
	name: z.string().optional(),
	email: z.string().optional(),
	login: z.string(),
	id: z.number().int(),
	node_id: z.string(),
	avatar_url: z.string().url(),
	gravatar_id: z.string(),
	url: z.string().url(),
	html_url: z.string().url(),
	followers_url: z.string().url(),
	following_url: z.string().url(),
	gists_url: z.string().url(),
	starred_url: z.string().url(),
	subscriptions_url: z.string().url(),
	organizations_url: z.string().url(),
	repos_url: z.string().url(),
	events_url: z.string().url(),
	received_events_url: z.string().url(),
	type: z.enum(["Bot", "User"]),
	site_admin: z.boolean(),
	starred_at: z.string().optional(),
});

export const labelSchema = z.object({
	id: z.number(),
	node_id: z.string(),
	url: z.string().url(),
	name: z.string(),
	color: z.string(),
	default: z.boolean(),
	description: z.string(),
});

const reactionsSchema = z.object({
	url: z.string().url(),
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
	id: z.number().int(),
	node_id: z.string(),
	slug: z.string().optional(),
	name: z.string(),
	description: z.string(),
	external_url: z.string().url(),
	html_url: z.string().url(),
});

const milestoneSchema = z.object({
	url: z.string().url(),
	html_url: z.string().url(),
	labels_url: z.string().url(),
	id: z.number().int(),
	node_id: z.string(),
	number: z.number().int(),
	state: z.enum(["open", "closed"]),
	title: z.string(),
	description: z.union([z.string(), z.null()]),
	creator: userSchema,
	open_issues: z.number().int(),
	closed_issues: z.number().int(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime().optional(),
	closed_at: z.string().datetime().optional(),
	due_on: z.string().datetime().optional(),
});

export const issueSchema = z.object({
	url: z.string().url(),
	repository_url: z.string().url(),
	labels_url: z.string().url(),
	comments_url: z.string().url(),
	events_url: z.string().url(),
	html_url: z.string().url(),
	id: z.number(),
	node_id: z.string(),
	number: z.number().int(),
	title: z.string(),
	user: userSchema,
	labels: z.array(labelSchema),
	state: z.enum(["open", "closed"]),
	locked: z.boolean(),
	assignee: userSchema.nullable(),
	assignees: z.array(userSchema.nullable()),
	milestone: milestoneSchema.optional(),
	comments: z.number(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime().nullable(),
	closed_at: z.string().datetime().nullable(),
	author_association: z.enum([
		"COLLABORATOR",
		"CONTRIBUTOR",
		"FIRST_TIMER",
		"FIRST_TIME_CONTRIBUTOR",
		"MANNEQUIN",
		"MEMBER",
		"NONE",
		"OWNER",
	]),
	active_lock_reason: z.null(),
	body: z.string().optional(),
	reactions: reactionsSchema,
	timeline_url: z.string().url(),
	performed_via_github_app: githubAppSchema.nullable(),
	state_reason: z.enum(["completed", "reopened", "not_planned", null]).optional(),
});

const pullRequestSummarySchema = z.object({
	diff_url: z.string().url(),
	html_url: z.string().url(),
	patch_url: z.string().url(),
	url: z.string().url(),
	merged_at: z.string().datetime().nullable(),
});

/**
 * GitHub Issues API can return a Pull Request as an Issue
 */
export const pullRequestAsIssueSchema = issueSchema.extend({
	pull_request: pullRequestSummarySchema,
});
