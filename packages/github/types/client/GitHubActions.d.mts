export class GitHubActions {
    /**
     * Constructs a new instance of a GitHub client.
     *
     * @param {Object} [options={}] - The configuration options for the GitHub client.
     * @param {boolean} [options.debug=false] - Flag indicating whether debug mode is enabled.
     * @param {core} [options.core] - The GitHub Actions core instance.
     */
    constructor(options?: {
        debug?: boolean;
        core?: typeof core;
    });
    core: typeof core;
    isGitHubActions: boolean;
    actionName: number;
    eventName: string;
    jobName: string;
    jobId: string;
    triggerCommitSha: string;
    triggerActor: string;
    workflowName: string;
    repositoryFQDN: string;
    debug: boolean;
    getWorkflowRunUrl(): string;
    #private;
}
import core from "@actions/core";
//# sourceMappingURL=GitHubActions.d.mts.map