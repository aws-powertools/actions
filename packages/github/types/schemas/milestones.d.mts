export const milestoneSchema: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    html_url: z.ZodString;
    labels_url: z.ZodString;
    id: z.ZodNumber;
    node_id: z.ZodString;
    number: z.ZodNumber;
    state: z.ZodEnum<["open", "closed"]>;
    title: z.ZodString;
    description: z.ZodUnion<[z.ZodString, z.ZodNull]>;
    creator: z.ZodUnion<[z.ZodNull, z.ZodObject<{
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNull]>>;
        email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNull]>>;
        login: z.ZodString;
        id: z.ZodNumber;
        node_id: z.ZodString;
        avatar_url: z.ZodString;
        gravatar_id: z.ZodUnion<[z.ZodString, z.ZodNull]>;
        url: z.ZodString;
        html_url: z.ZodString;
        followers_url: z.ZodString;
        following_url: z.ZodString;
        gists_url: z.ZodString;
        starred_url: z.ZodString;
        subscriptions_url: z.ZodString;
        organizations_url: z.ZodString;
        repos_url: z.ZodString;
        events_url: z.ZodString;
        received_events_url: z.ZodString;
        type: z.ZodString;
        site_admin: z.ZodBoolean;
        starred_at: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        email?: string;
        login?: string;
        id?: number;
        node_id?: string;
        avatar_url?: string;
        gravatar_id?: string;
        url?: string;
        html_url?: string;
        followers_url?: string;
        following_url?: string;
        gists_url?: string;
        starred_url?: string;
        subscriptions_url?: string;
        organizations_url?: string;
        repos_url?: string;
        events_url?: string;
        received_events_url?: string;
        type?: string;
        site_admin?: boolean;
        starred_at?: string;
    }, {
        name?: string;
        email?: string;
        login?: string;
        id?: number;
        node_id?: string;
        avatar_url?: string;
        gravatar_id?: string;
        url?: string;
        html_url?: string;
        followers_url?: string;
        following_url?: string;
        gists_url?: string;
        starred_url?: string;
        subscriptions_url?: string;
        organizations_url?: string;
        repos_url?: string;
        events_url?: string;
        received_events_url?: string;
        type?: string;
        site_admin?: boolean;
        starred_at?: string;
    }>]>;
    open_issues: z.ZodNumber;
    closed_issues: z.ZodNumber;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    closed_at: z.ZodUnion<[z.ZodString, z.ZodNull]>;
    due_on: z.ZodUnion<[z.ZodString, z.ZodNull]>;
}, "strip", z.ZodTypeAny, {
    number?: number;
    id?: number;
    node_id?: string;
    url?: string;
    html_url?: string;
    description?: string;
    labels_url?: string;
    state?: "open" | "closed";
    title?: string;
    creator?: {
        name?: string;
        email?: string;
        login?: string;
        id?: number;
        node_id?: string;
        avatar_url?: string;
        gravatar_id?: string;
        url?: string;
        html_url?: string;
        followers_url?: string;
        following_url?: string;
        gists_url?: string;
        starred_url?: string;
        subscriptions_url?: string;
        organizations_url?: string;
        repos_url?: string;
        events_url?: string;
        received_events_url?: string;
        type?: string;
        site_admin?: boolean;
        starred_at?: string;
    };
    open_issues?: number;
    closed_issues?: number;
    created_at?: string;
    updated_at?: string;
    closed_at?: string;
    due_on?: string;
}, {
    number?: number;
    id?: number;
    node_id?: string;
    url?: string;
    html_url?: string;
    description?: string;
    labels_url?: string;
    state?: "open" | "closed";
    title?: string;
    creator?: {
        name?: string;
        email?: string;
        login?: string;
        id?: number;
        node_id?: string;
        avatar_url?: string;
        gravatar_id?: string;
        url?: string;
        html_url?: string;
        followers_url?: string;
        following_url?: string;
        gists_url?: string;
        starred_url?: string;
        subscriptions_url?: string;
        organizations_url?: string;
        repos_url?: string;
        events_url?: string;
        received_events_url?: string;
        type?: string;
        site_admin?: boolean;
        starred_at?: string;
    };
    open_issues?: number;
    closed_issues?: number;
    created_at?: string;
    updated_at?: string;
    closed_at?: string;
    due_on?: string;
}>, "many">;
import { z } from "zod";
//# sourceMappingURL=milestones.d.mts.map