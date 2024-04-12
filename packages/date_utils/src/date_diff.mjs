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
