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

/**
 * Builds a Date object with the specified number of days ahead or behind from the current date.
 *
 * @param {number} days - The number of days to add or subtract from the current date.
 * @returns {Date} A new Date object with the specified number of days added or subtracted.
 *
 * @example
 * // Get a date 14 days in the future
 * const futureDateAhead = getDateWithDays(14);
 * console.log(futureDateAhead); // Output: Wed May 15 2024 16:09:00 GMT+0000 (Coordinated Universal Time)
 *
 * @example
 * // Get a date 7 days in the past
 * const pastDateBehind = getDateWithDays(-7);
 * console.log(pastDateBehind); // Output: Wed Apr 24 2024 16:09:00 GMT+0000 (Coordinated Universal Time)
 */
export function getDateWithDaysDelta(days) {
	const today = new Date();
	return new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
}
