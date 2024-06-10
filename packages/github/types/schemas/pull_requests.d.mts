export const labelSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    color: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    color?: string;
}, {
    name?: string;
    id?: string;
    color?: string;
}>;
export const pullRequestSchema: z.ZodObject<{
    id: z.ZodNumber;
    number: z.ZodNumber;
    html_url: z.ZodString;
    diff_url: z.ZodString;
    patch_url: z.ZodString;
    issue_url: z.ZodString;
    status: z.ZodEnum<["open", "merged"]>;
    title: z.ZodString;
    description: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        username: z.ZodString;
        avatar: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        username?: string;
        avatar?: string;
    }, {
        name?: string;
        username?: string;
        avatar?: string;
    }>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    merged_at: z.ZodNullable<z.ZodString>;
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        author: z.ZodObject<{
            name: z.ZodString;
            username: z.ZodString;
            avatar: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            username?: string;
            avatar?: string;
        }, {
            name?: string;
            username?: string;
            avatar?: string;
        }>;
        content: z.ZodString;
        created_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        created_at?: string;
        author?: {
            name?: string;
            username?: string;
            avatar?: string;
        };
        content?: string;
    }, {
        id?: string;
        created_at?: string;
        author?: {
            name?: string;
            username?: string;
            avatar?: string;
        };
        content?: string;
    }>, "many">;
    labels: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        color?: string;
    }, {
        name?: string;
        id?: string;
        color?: string;
    }>, "many">;
    requested_reviewers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        username: z.ZodString;
        avatar: z.ZodString;
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }, {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }>, "many">;
    reviewers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        username: z.ZodString;
        avatar: z.ZodString;
        login: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }, {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    number?: number;
    comments?: {
        id?: string;
        created_at?: string;
        author?: {
            name?: string;
            username?: string;
            avatar?: string;
        };
        content?: string;
    }[];
    id?: number;
    html_url?: string;
    status?: "open" | "merged";
    description?: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    labels?: {
        name?: string;
        id?: string;
        color?: string;
    }[];
    diff_url?: string;
    patch_url?: string;
    merged_at?: string;
    author?: {
        name?: string;
        username?: string;
        avatar?: string;
    };
    issue_url?: string;
    requested_reviewers?: {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }[];
    reviewers?: {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }[];
}, {
    number?: number;
    comments?: {
        id?: string;
        created_at?: string;
        author?: {
            name?: string;
            username?: string;
            avatar?: string;
        };
        content?: string;
    }[];
    id?: number;
    html_url?: string;
    status?: "open" | "merged";
    description?: string;
    title?: string;
    created_at?: string;
    updated_at?: string;
    labels?: {
        name?: string;
        id?: string;
        color?: string;
    }[];
    diff_url?: string;
    patch_url?: string;
    merged_at?: string;
    author?: {
        name?: string;
        username?: string;
        avatar?: string;
    };
    issue_url?: string;
    requested_reviewers?: {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }[];
    reviewers?: {
        name?: string;
        login?: string;
        username?: string;
        avatar?: string;
    }[];
}>;
import { z } from "zod";
//# sourceMappingURL=pull_requests.d.mts.map