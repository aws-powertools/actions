export const githubRepository = process.env.GITHUB_REPOSITORY; // aws-powertools/actions
export const githubUrl = process.env.GITHUB_SERVER_URL; // https://github.com
export const actionRunId = process.env.GITHUB_RUN_ID;

// TODO: move to constants

export function getWorkflowRunUrl() {
	if (isGitHubAction()) {
		return `${githubUrl}/${githubRepository}/actions/runs/${actionRunId}`;
	}
	return "";
}

// TODO: proper boolean
export function isGitHubAction() {
	return process.env.GITHUB_ACTION;
}

/**
 * Calculate the difference in days between the current date and a given datetime.
 *
 * @param {string|Date} datetime - The datetime string to calculate the difference from.
 * @returns {number} - The difference in days between the current date and the given datetime.
 */
export function diffInDaysFromToday(datetime) {
    const diff_in_ms = new Date() - new Date(datetime);

    // ms(1000)->seconds(60)->minutes(60)->hours(24)->days
    return Math.floor(diff_in_ms / (1000 * 60 * 60 * 24));
}

/**
 * Formats a datetime string into a localized human date string e.g., April 5, 2024.
 *
 * @param {string|Date} datetime - The datetime string to format.
 * @returns {string} The formatted date string.
 *
 * @example
 * const datetime = "2022-01-01T12:00:00Z";
 * console.log(formatISOtoLongDate(datetime)); // April 5, 2024
 */
export function formatISOtoLongDate(datetime) {
    const date = new Date(datetime);
    return new Intl.DateTimeFormat("en-US", {dateStyle: "long"}).format(date);
}
