import * as z from "zod";

const commentSchema = z.object({
	id: z.string().uuid(),
	author: z.object({
		name: z.string(),
		username: z.string(),
		avatar: z.string().url(),
	}),
	content: z.string(),
	created_at: z.date(),
});

export const labelSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
});

const reviewerSchema = z.object({
	name: z.string(),
	username: z.string(),
	avatar: z.string().url(),
	login: z.string(),
});

export const pullRequestSchema = z.object({
	id: z.number(),
	number: z.number().lte(1000),
	html_url: z.string().url(),
	diff_url: z.string().url(),
	patch_url: z.string().url(),
	issue_url: z.string().url(),
	status: z.enum(["open", "merged"]),
	title: z.string(),
	description: z.string(),
	author: z.object({
		name: z.string(),
		username: z.string(),
		avatar: z.string().url(),
	}),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	mergedAt: z.date().nullable(),
	comments: z.array(commentSchema),
	labels: z.array(labelSchema),
	requested_reviewers: z.array(reviewerSchema),
	reviewers: z.array(reviewerSchema),
});
