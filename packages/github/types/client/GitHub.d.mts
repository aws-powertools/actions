export class GitHub {
    /**
     * Constructs a new instance of a GitHub client.
     *
     * @param {Object} [options={}] - The configuration options for the GitHub client.
     * @param {string} [options.token] - The GitHub token for authentication.
     * @param {boolean} [options.debug=false] - Flag indicating whether debug mode is enabled.
     * @param {Octokit} [options.client] - The Octokit client instance.
     * @param {Logger} [options.logger] - Logger to use
     * @param {string} [options.repository] - Full GitHub repository name to use, e.g., `aws-powertools/actions`
     * @property {string} owner - The owner of the GitHub repository.
     * @property {string} repo - The name of the GitHub repository.
     *
     */
    constructor(options?: {
        token?: string;
        debug?: boolean;
        client?: Octokit;
        logger?: Logger;
        repository?: string;
    });
    token: string;
    client: import("@octokit/core").Octokit & {
        paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
    } & import("@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types.js").RestEndpointMethods & import("@octokit/plugin-rest-endpoint-methods").Api;
    logger: Logger;
    owner: string;
    repo: string;
    /**
     * List Pull Requests
     * @param {Object} options - Config.
     * @param {("created" | "updated" | "popularity" | "long-running")} [options.sortBy] - Sort results by
     * @param {number} [options.limit] - Max number of pull requests to return (default 10)
     * @param {number} [options.pageSize] - Pagination size for each List Pull Requests API call (max 100)
     * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
     * @param {string[]} [options.excludeLabels] - Exclude pull requests containing these labels
     * @param {("open" | "closed" | "all")} [options.state="open"] - Limit listing to pull requests in these state
     * @param {number} [options.minDaysOld] - The minimum number of days since the pull request was created.
     * @param {number} [options.minDaysWithoutUpdate] - The minimum number of days since the pull request was last updated.
     *
     * @example Listing pull requests excluding those labels with `do-not-merge`
     *
     * ```javascript
     * const github = new GitHub();
     * const pullRequests = await github.listPullRequests({ sortBy: 'created', excludeLabels: ["do-not-merge"] });
     * ```
     *
     * @returns {Promise<z.infer<typeof pullRequestSchema>[]>}
     */
    listPullRequests(options?: {
        sortBy?: ("created" | "updated" | "popularity" | "long-running");
        limit?: number;
        pageSize?: number;
        direction?: ("asc" | "desc");
        excludeLabels?: string[];
        state?: ("open" | "closed" | "all");
        minDaysOld?: number;
        minDaysWithoutUpdate?: number;
    }): Promise<z.infer<typeof pullRequestSchema>[]>;
    /**
     * List issues
     *
     * @param {Object} options - Config.
     * @param {string[]} [options.labels] - Include issues containing these labels
     * @param {("created" | "updated" | "comments")} [options.sortBy] - Sort results by
     * @param {number} [options.limit] - Max number of issues to return (default 10)
     * @param {number} [options.pageSize] - Pagination size for each List Issues API call (max 100)
     * @param {("asc" | "desc")} [options.direction] - Results direction (default ascending)
     * @param {number} [options.minDaysOld] - The minimum number of days since the issue was created.
     * @param {number} [options.minDaysWithoutUpdate] - The minimum number of days since the issue was last updated.
     * @param {string[]} [options.excludeLabels] - Exclude issues containing these labels
     *
     * @example List feature requests, excluding blocked issues
     *
     * ```javascript
     * const github = new GitHub();
     * const issues = await github.listIssues({
     *   labels: ['feature-request'],
     *   sortBy: 'created',
     *   limit: 15,
     *   excludeLabels: ['do-not-merge']
     * });
     * ```
     * @returns {Promise<z.infer<typeof issueSchema>[]>} Issue - Newly created issue
     */
    listIssues(options?: {
        labels?: string[];
        sortBy?: ("created" | "updated" | "comments");
        limit?: number;
        pageSize?: number;
        direction?: ("asc" | "desc");
        minDaysOld?: number;
        minDaysWithoutUpdate?: number;
        excludeLabels?: string[];
    }): Promise<z.infer<typeof issueSchema>[]>;
    /**
     * Searches for an issue based on query parameters.
     * GitHub Search qualifiers: https://docs.github.com/en/search-github/searching-on-github
     * @param {Object} options - Config.
     * @param {string} [options.searchQuery] - Search query to find issues and pull requests
     *
     * @example Finding an issue labeled as bug
     * ```javascript
     * const github = new GitHub();
     * const searchQuery = 'New bug is:issue label:bug in:title';
     * const issues = await github.findIssue({ searchQuery });
     * ```
     * @typedef {z.infer<typeof issueSearchSchema>} SearchResult
     * @returns {Promise<SearchResult>} Response - Search containing results
     */
    findIssue(options?: {
        searchQuery?: string;
    }): Promise<{
        total_count?: number;
        items?: {
            number?: number;
            comments?: number;
            id?: number;
            node_id?: string;
            url?: string;
            html_url?: string;
            events_url?: string;
            labels_url?: string;
            state?: "open" | "closed";
            title?: string;
            created_at?: string;
            updated_at?: string;
            closed_at?: string;
            repository_url?: string;
            comments_url?: string;
            user?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            };
            labels?: {
                name?: string;
                id?: number;
                node_id?: string;
                url?: string;
                color?: string;
                default?: boolean;
                description?: string;
            }[];
            locked?: boolean;
            assignee?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            };
            assignees?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            }[];
            milestone?: {
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
                    type?: "Bot" | "User";
                    site_admin?: boolean;
                    starred_at?: string;
                };
                open_issues?: number;
                closed_issues?: number;
                created_at?: string;
                updated_at?: string;
                closed_at?: string;
                due_on?: string;
            };
            author_association?: "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER";
            active_lock_reason?: null;
            body?: string;
            reactions?: {
                url?: string;
                total_count?: number;
                "+1"?: number;
                "-1"?: number;
                laugh?: number;
                hooray?: number;
                confused?: number;
                heart?: number;
                rocket?: number;
                eyes?: number;
            };
            timeline_url?: string;
            performed_via_github_app?: {
                name?: string;
                id?: number;
                node_id?: string;
                html_url?: string;
                description?: string;
                slug?: string;
                external_url?: string;
            };
            state_reason?: any;
        }[] | {
            number?: number;
            comments?: number;
            id?: number;
            node_id?: string;
            url?: string;
            html_url?: string;
            events_url?: string;
            labels_url?: string;
            state?: "open" | "closed";
            title?: string;
            created_at?: string;
            updated_at?: string;
            closed_at?: string;
            repository_url?: string;
            comments_url?: string;
            user?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            };
            labels?: {
                name?: string;
                id?: number;
                node_id?: string;
                url?: string;
                color?: string;
                default?: boolean;
                description?: string;
            }[];
            locked?: boolean;
            assignee?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            };
            assignees?: {
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
                type?: "Bot" | "User";
                site_admin?: boolean;
                starred_at?: string;
            }[];
            milestone?: {
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
                    type?: "Bot" | "User";
                    site_admin?: boolean;
                    starred_at?: string;
                };
                open_issues?: number;
                closed_issues?: number;
                created_at?: string;
                updated_at?: string;
                closed_at?: string;
                due_on?: string;
            };
            author_association?: "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER";
            active_lock_reason?: null;
            body?: string;
            reactions?: {
                url?: string;
                total_count?: number;
                "+1"?: number;
                "-1"?: number;
                laugh?: number;
                hooray?: number;
                confused?: number;
                heart?: number;
                rocket?: number;
                eyes?: number;
            };
            timeline_url?: string;
            performed_via_github_app?: {
                name?: string;
                id?: number;
                node_id?: string;
                html_url?: string;
                description?: string;
                slug?: string;
                external_url?: string;
            };
            state_reason?: any;
            pull_request?: {
                url?: string;
                html_url?: string;
                diff_url?: string;
                patch_url?: string;
                merged_at?: string;
            };
        }[];
        incomplete_results?: boolean;
    }>;
    /**
     * Creates a new issue.
     * API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue
     * @param {Object} options - Config.
     * @param {string} options.title - Issue title
     * @param {string} [options.body] - Issue body (description)
     * @param {string[]} [options.labels] - Labels to assign
     * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
     * @param {number} [options.milestone] - Milestone number to assign this issue to
     *
     * @example Creating an issue
     * ```javascript
     * const github = new GitHub();
     * const issue = await github.createIssue({
     *   title: 'New Issue',
     *   body: 'This is a new issue created using the createIssue function.',
     *   labels: ['enhancement'],
     *   assignees: ['heitorlessa'],
     *   milestone: 1
     * });
     *```
     * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created issue
     */
    createIssue(options?: {
        title: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        milestone?: number;
    }): Promise<z.infer<typeof issueSchema>>;
    /**
     * Updates an existing issue number.
     *
     * @param {Object} options - Config.
     * @param {number} options.issueNumber - Issue number to update
     * @param {string} [options.title] - Issue title
     * @param {string} [options.body] - Issue body (description)
     * @param {string[]} [options.labels] - Labels to assign
     * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
     * @param {("open"|"closed")} [options.state] - Issue state to update to
     * @param {number} [options.milestone] - Milestone number
     *
     * @example Updating an existing issue
     *```javascript
     * const github = new GitHub();
     * const issue = await github.updateIssue({
     *   github: octokit,
     *   core,
     *   issueNumber: 10,
     *   title: 'New title',
     *   body: 'Updated description',
     *   labels: ['enhancement', 'need-customer-feedback'],
     *   assignees: ['heitorlessa'],
     *   state: "closed",
     *   milestone: 1
     * });
     * ```
     * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly updated issue
     */
    updateIssue(options?: {
        issueNumber: number;
        title?: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        state?: ("open" | "closed");
        milestone?: number;
    }): Promise<z.infer<typeof issueSchema>>;
    /**
     * Update existing issue if found, or create it.
     *
     * @param {Object} options - Config.
     * @param {string} [options.searchQuery] - Search query to find issue to update
     * @param {string} [options.title] - Issue title
     * @param {string} [options.body] - Issue body (description)
     * @param {string[]} [options.labels] - Labels to assign
     * @param {string[]} [options.assignees] - GitHub usernames to assign this issue to
     * @param {("open" | "closed")} [options.state] - Issue state to update to
     * @param {number} [options.milestone] - Milestone number
     *
     * @example Update roadmap issue, or create it if not found
     * ```javascript
     * const github = new GitHub();
     * const issue = await createOrUpdateIssue({
     *   searchQuery: 'Roadmap reminder is:issue in:title label:report-roadmap',
     *   body: 'The new roadmap is...',
     *   labels: ['report-roadmap'],
     *   assignees: ['heitorlessa'],
     * });
     * ```
     * @returns {Promise<z.infer<typeof issueSchema>>} Issue - Newly created or updated issue.
     */
    createOrUpdateIssue(options?: {
        searchQuery?: string;
        title?: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        state?: ("open" | "closed");
        milestone?: number;
    }): Promise<z.infer<typeof issueSchema>>;
    #private;
}
import { Logger } from "@aws-lambda-powertools/logger";
import { z } from "zod";
import { pullRequestSchema } from "../schemas/pull_requests.mjs";
import { issueSchema } from "../schemas/issues.mjs";
import { Octokit } from "@octokit/rest";
//# sourceMappingURL=GitHub.d.mts.map