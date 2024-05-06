import { z } from "zod";

export const labelsSchema = z.object({ items: z.array(z.object({ name: z.string() })) }).nullable()

export const projectFieldsSchema = z.object({
	items: z.array(
		z.object({
			projectStatus: z.object({ status: z.string().nullable() }),
			area: z.object({ area: z.string().nullable() }),
			iteration: z.object({ startDate: z.string().nullable() })
		})
	)
}).nullable()

/*
 Schema for GraphQL query fetching issues assigned to a project
*/
export const projectIssueSchema = z.object({
	title: z.string(),
	html_url: z.string(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	labels: labelsSchema,
	projects: projectFieldsSchema
})
