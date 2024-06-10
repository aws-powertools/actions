export class MonthlyRoadmapTemplate extends BaseTemplate {
    /**
     *
     * @param {Object} options - Config.
     * @param {PopularFeatureRequest[]} [options.featureRequests] - List of feature requests.
     * @param {LongRunningPullRequest[]} [options.longRunningPRs] - List of long-running pull requests.
     * @param {OldestIssue[]} [options.oldestIssues] - List of oldest issues.
     * @param {HighlyCommentedIssue[]} [options.mostActiveIssues] - List of most commented issues.
     * @property {string} [title] - Issue title.
     */
    constructor(options?: {
        featureRequests?: PopularFeatureRequest[];
        longRunningPRs?: LongRunningPullRequest[];
        oldestIssues?: OldestIssue[];
        mostActiveIssues?: HighlyCommentedIssue[];
    });
    featureRequests: PopularFeatureRequest[];
    longRunningPRs: LongRunningPullRequest[];
    oldestIssues: OldestIssue[];
    mostActiveIssues: HighlyCommentedIssue[];
}
import { BaseTemplate } from "./base.mjs";
import { PopularFeatureRequest } from "../models/index.mjs";
import { LongRunningPullRequest } from "../models/index.mjs";
import { OldestIssue } from "../models/index.mjs";
import { HighlyCommentedIssue } from "../models/index.mjs";
//# sourceMappingURL=MonthlyRoadmapTemplate.d.mts.map