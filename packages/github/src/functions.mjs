import { GITHUB_ACTION_RUN_ID, GITHUB_BASE_URL, GITHUB_REPOSITORY } from "./constants.mjs";

export function getWorkflowRunUrl() {
	if (isGitHubAction()) {
		return `${GITHUB_BASE_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_ACTION_RUN_ID}`;
	}
	return "";
}

/**
 * Check if the current process is running in GitHub Actions.
 *
 * @returns {boolean} - True if the current process is running in GitHub Actions, false otherwise.
 */
export function isGitHubAction() {
	return Boolean(process.env.GITHUB_ACTION);
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
	return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}
