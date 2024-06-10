export function listPullRequestsHandler({ data, org, repo }: {
    data: any;
    org: any;
    repo: any;
}): import("msw").HttpHandler[];
export function listPullRequestsFailureHandler({ org, repo, err }: {
    org: any;
    repo: any;
    err?: string;
}): import("msw").HttpHandler[];
//# sourceMappingURL=pull_requests_handler.d.mts.map