export class WeeklyRoadmapReport extends BaseReport {
    /**
     * Constructs a BaseReport instance.
     * @param {Object} [options={}] - Options object.
     * @param {Logger} [options.logger] - A Logger instance.
     * @param {GitHub} [options.github] - A GitHub client instance.
     * @param {GitHubActions} [options.actions] - A GitHub Actions client instance.
     * @param {string} [options.searchQuery="Roadmap update reminder"] - GitHub Search query to find issue existing report to update.
     * @param {string} [options.title="Roadmap update reminder"] - GitHub Issue title for this report.
     * @param {string?} [options.language] - The language of the repository.
     */
    constructor(options?: {
        logger?: Logger;
        github?: GitHub;
        actions?: GitHubActions;
        searchQuery?: string;
        title?: string;
        language?: string | null;
    });
    title: string;
    searchQuery: string;
    #private;
}
import { BaseReport } from "./base.mjs";
import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub } from "@aws-powertools-actions/github";
import { GitHubActions } from "@aws-powertools-actions/github";
//# sourceMappingURL=WeeklyRoadmapReport.d.mts.map