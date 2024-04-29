import { Logger } from "@aws-lambda-powertools/logger";
import { GitHub, GitHubActions } from "github/src/client";
import { REPORT_ROADMAP_LABEL, SERVICE_NAME } from "./constants.mjs";
import { getTopFeatureRequests, getTopMostCommented, getTopOldestIssues } from "./issues";
import { getLongRunningPRs } from "./pull_requests";
import { MonthlyRoadmapTemplate } from "./templates/MonthlyRoadmapTemplate.mjs";

/**
 * Creates a monthly roadmap issue report with top PFRs, most active issues, and stale requests.
 *
 * Example issue: https://github.com/heitorlessa/action-script-playground/issues/24
 *
 * @param {Object} options - Config.
 * @param {GitHub} options.github - A GitHub client instance.
 * @param {GitHubActions} options.actions - A GitHub Actions client instance.
 * @returns {Promise<void>} A promise resolving when the issue is created.
 *
 */
export async function createMonthlyRoadmapReport(options = {}) {
	const actions = options.actions || new GitHubActions();
	const logger = new Logger({
		serviceName: SERVICE_NAME,
		persistentLogAttributes: {
			eventName: actions.eventName,
			workflowName: actions.workflowName,
			repository: actions.repositoryFQDN,
			triggerCommit: actions.triggerCommitSha,
			triggerActor: actions.triggerActor,
			actionName: actions.actionName,
			jobName: actions.jobName,
		},
	});

	const github = options.github || new GitHub({ logger });

	logger.info("Fetching GitHub data concurrently");

	const [
		{ value: featureRequests = [] },
		{ value: longRunningPRs = [] },
		{ value: oldestIssues = [] },
		{ value: mostActiveIssues = [] },
	] = await Promise.allSettled([
		getTopFeatureRequests({ github }),
		getLongRunningPRs({ github }),
		getTopOldestIssues({ github }),
		getTopMostCommented({ github }),
	]);

	const monthlyRoadmap = new MonthlyRoadmapTemplate({
		featureRequests,
		longRunningPRs,
		oldestIssues,
		mostActiveIssues,
	});
	
	logger.info("Creating issue with monthly roadmap report");

	const searchParams = `is:issue in:title state:open repo:${github.owner}/${github.repo}`;
	const searchQuery = `${monthlyRoadmap.title} ${searchParams}`;

	const ret = await github.createOrUpdateIssue({
		github,
		searchQuery,
		title: monthlyRoadmap.title,
		body: monthlyRoadmap.build(),
		labels: [REPORT_ROADMAP_LABEL],
	});

	await actions.core.summary
		.addHeading(monthlyRoadmap.title)
		.addLink("View monthly report", ret.html_url)
		.write();

	return ret;
}
