export class WeeklyRoadmapTemplate extends BaseTemplate {
    /**
     *
     * @param {Object} options - Config.
     * @param {UntriagedIssue[]} [options.untriagedIssues] - List of untriaged issues.
     * @param {BugIssue[]} [options.bugIssues] - List of bug issues.
     * @param {LongRunningPullRequest[]} [options.longRunningPRs] - List of long-running pull requests.
     * @param {PendingReleaseIssue[]} [options.pendingReleaseIssues] - List of most commented issues.
     * @param {MilestoneIssue[]} [options.prioritaryMilestoneIssues] - List of most commented issues.
     * @property {string} [title] - Issue title.
     */
    constructor(options?: {
        untriagedIssues?: UntriagedIssue[];
        bugIssues?: BugIssue[];
        longRunningPRs?: LongRunningPullRequest[];
        pendingReleaseIssues?: PendingReleaseIssue[];
        prioritaryMilestoneIssues?: MilestoneIssue[];
    });
    untriagedIssues: UntriagedIssue[];
    bugIssues: BugIssue[];
    longRunningPRs: LongRunningPullRequest[];
    pendingRelease: PendingReleaseIssue[];
    prioritaryMilestoneIssues: MilestoneIssue[];
}
import { BaseTemplate } from "./base.mjs";
import { UntriagedIssue } from "../models/index.mjs";
import { BugIssue } from "../models/index.mjs";
import { LongRunningPullRequest } from "../models/index.mjs";
import { PendingReleaseIssue } from "../models/index.mjs";
import { MilestoneIssue } from "../models/index.mjs";
//# sourceMappingURL=WeeklyRoadmapTemplate.d.mts.map