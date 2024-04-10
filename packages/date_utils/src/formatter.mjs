/**
 * Formats a datetime string into a localized human date string e.g., April 5, 2024.
 *
 * @param {string} datetime - The datetime string to format.
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
