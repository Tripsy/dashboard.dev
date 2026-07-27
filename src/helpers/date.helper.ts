import dayjs from '@/config/dayjs.config';
import { Configuration } from '@/config/settings.config';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Create a current date
 *
 * @param startOfDay - If true, returns the current date at 00:00:00.000
 * @returns {Date} - The current date
 */
export function createCurrentDate(startOfDay: boolean = false): Date {
	const now = new Date();

	if (startOfDay) {
		now.setHours(0, 0, 0, 0);
	}

	return now;
}

/**
 * Create a future date by adding seconds to the current date
 *
 * @param {number} seconds - The number of seconds to add
 * @throws {Error} - If seconds is a negative number
 * @returns {Date} - The future date
 */
export function createFutureDate(seconds: number): Date {
	if (seconds <= 0) {
		throw new Error('Seconds should a positive number greater than 0');
	}

	const currentDate = new Date();

	return new Date(currentDate.getTime() + seconds * 1000);
}

/**
 * Create a past date by subtracting seconds from the current date
 *
 * @param {number} seconds - The number of seconds to subtract
 * @throws {Error} - If seconds is a negative number
 * @returns {Date} - The past date
 */
export function createPastDate(seconds: number): Date {
	if (seconds <= 0) {
		throw new Error('Seconds should a positive number greater than 0');
	}

	const currentDate = new Date();

	return new Date(currentDate.getTime() - seconds * 1000);
}

/**
 * Check if a string is a valid date.
 *
 * Expects the calendar part to lead in `YYYY-MM-DD` form; anything after it (a time, an
 * offset) is parsed leniently.
 *
 * @param {string} date - The date string to check
 * @returns {boolean} - True if the date is valid, false otherwise
 */
export function isValidDate(date: string): boolean {
	/*
	 * dayjs parses leniently and rolls overflow forward, so a bare `isValid()` accepts
	 * impossible dates and silently changes them: '2024-02-30' becomes 2024-03-01 and
	 * '2024-13-45' becomes 2025-02-14. Validating the calendar part in strict mode rejects
	 * them instead of storing a different day than the user typed.
	 */
	if (!dayjs(date.trim().slice(0, 10), DEFAULT_DATE_FORMAT, true).isValid()) {
		return false;
	}

	return dayjs(date).isValid();
}

/**
 * Convert string to Date object using dayjs
 *
 * @param date
 * @param startOfDay
 */
export function stringToDate(date: string, startOfDay: boolean = false): Date {
	const parsed = dayjs(date);

	if (!parsed.isValid()) {
		throw new Error(`Invalid date value: "${date}"`);
	}

	if (startOfDay) {
		return parsed.startOf('day').toDate();
	}

	return parsed.toDate();
}

/**
 * Date formatter with dayjs
 *
 * @param value - Date input (string, Date, null, undefined)
 * @param format - Output format (or preset)
 * @param options - { strict: boolean }
 * @returns Formatted string or null
 */
export function formatDate(
	value: string | number | Date | null | undefined,
	format?: 'default' | 'date-time' | 'time',
	options?: {
		customFormat?: string;
		strict?: boolean;
	},
): string | null {
	// Handle empty values
	if (
		value === null ||
		value === undefined ||
		(typeof value === 'string' && value.trim() === '')
	) {
		if (options?.strict) {
			throw new Error('Invalid date: null/undefined');
		}

		return null;
	}

	const date = dayjs(value);

	// Validate date
	if (!date.isValid()) {
		if (options?.strict) {
			throw new Error(`Invalid date: ${value}`);
		}

		return null;
	}

	switch (format) {
		case 'default':
			return date.format(DEFAULT_DATE_FORMAT);
		case 'date-time':
			return date.format('DD-MM-YYYY, HH:mm');
		case 'time':
			return date.format('HH:mm');
		default:
			if (format) {
				return date.format(format);
			}

			if (options?.customFormat) {
				return date.format(options.customFormat);
			}

			return date.toISOString();
	}
}

/**
 * Combine a date with specified time
 *
 * @param date
 * @param time
 */
export function combineDateAndTime(date: Date, time: string): Date {
	const parts = time.split(':').map(Number);
	const hours = parts[0];
	const minutes = parts[1];

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		throw new Error(`Invalid time format: "${time}". Expected "HH:MM".`);
	}

	const result = new Date(date);
	result.setHours(hours, minutes, 0, 0);

	return result;
}

/**
 * Calculate the difference between two dates
 *
 * @example
 * dateDiff(start, end, 'minutes') → 90
 * dateDiff(start, end, 'display') → "1h 30'"
 * dateDiff(start, end, 'seconds') → 5400
 */
// Overload signatures
export function dateDiff(
	start: string | Date,
	end: string | Date,
	unit: 'display',
): string;
export function dateDiff(
	start: string | Date,
	end: string | Date,
	unit: 'seconds' | 'minutes' | 'hours',
): number;
// Implementation signature
export function dateDiff(
	startDate: string | Date,
	endDate: string | Date,
	unit: 'seconds' | 'minutes' | 'hours' | 'display',
): number | string {
	const start = dayjs(startDate);
	const end = dayjs(endDate);

	if (!start.isValid() || !end.isValid()) {
		throw new Error('Invalid date arguments provided for dateDiff');
	}

	switch (unit) {
		case 'seconds':
			return Math.ceil(end.diff(start, 'second', true));
		case 'minutes':
			return Math.ceil(end.diff(start, 'minute', true));
		case 'hours':
			return Math.ceil(end.diff(start, 'hour', true));
		case 'display': {
			const diffInMinutes = end.diff(start, 'minute');

			/*
			 * Formatted from the magnitude, with the sign applied once. Using the raw
			 * value put it on both parts — JavaScript's `%` keeps the sign of the
			 * dividend, so -90 gave "-2h -30'" and even -1 gave "-1h -1'", which is what
			 * a viewer whose clock trails the server's by a minute saw on a session that
			 * had only just started.
			 */
			const magnitude = Math.abs(diffInMinutes);
			const sign = diffInMinutes < 0 ? '-' : '';

			return `${sign}${Math.floor(magnitude / 60)}h ${magnitude % 60}'`;
		}
	}
}

/**
 * Relative description of a past date, e.g. "2 hours ago".
 *
 * This used to take a `TimeAgoOptions` bag — `useJustNow`, `suffix`, `useYesterday` and a
 * `maxPrecision` cascade — none of which ever ran: `maxPrecision` defaulted to 'year', which
 * matched no branch, so every call fell through to `fromNow()` regardless. The cascade was
 * also inverted relative to its name (passing 'second' enabled every level; passing 'day'
 * enabled only the day branch), so it was removed rather than repaired.
 */
export function timeAgo(date: string | Date): string {
	const target = dayjs(date);

	if (!target.isValid()) {
		throw new Error('Invalid date argument provided for timeAgo');
	}

	return target.fromNow();
}

/**
 * Convert a local datetime string to UTC ISO string for sending to BE
 *
 * @param value - Date string in local timezone (e.g. "2024-01-15" or "2024-01-15T20:00")
 * @param endOfDay
 * @param timezone - IANA timezone (e.g. "Europe/Bucharest"), falls back to app config
 * @returns UTC ISO string (e.g. "2024-01-15T18:00:00.000Z")
 */
export function toUTCISOString(
	value: string,
	endOfDay: boolean = false,
	timezone?: string,
): string {
	const tz = timezone ?? Configuration.get('app.timezone');
	let parsed = dayjs.tz(value, tz);

	if (!parsed.isValid()) {
		throw new Error(`Invalid date value: "${value}"`);
	}

	if (endOfDay) {
		parsed = parsed.endOf('day');
	}

	return parsed.utc().toISOString();
}
