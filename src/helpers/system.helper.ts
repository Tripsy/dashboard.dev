import { headers } from 'next/headers';

export async function getClientIp(
	headersProvided?: Headers,
): Promise<string | undefined> {
	const headersSource = headersProvided || (await headers());

	// 1. First try x-forwarded-for header (common in proxies)
	const forwardedIp = headersSource.get('x-forwarded-for');

	// Extract the first IP from x-forwarded-for if exists
	let ip = forwardedIp
		? forwardedIp.split(',')[0].trim()
		: headersSource.get('cf-connecting-ip') ||
			headersSource.get('x-real-ip');

	if (!ip) {
		return undefined;
	}

	// Remove IPv6 prefix
	ip = ip.replace(/^::ffff:/, '');

	// Remove port number if exists
	ip = ip.split(':')[0];

	// Remove brackets from IPv6 addresses
	ip = ip.replace(/^\[|\]$/g, '');

	return ip;
}

type ApiHeaders = {
	'User-Agent': string;
	'Accept-Language': string;
	'X-Client-IP': string;
	'X-Client-OS': string;
};

export async function apiHeaders(
	headersProvided?: Headers,
): Promise<ApiHeaders> {
	const headersSource = headersProvided || (await headers());

	return {
		'User-Agent': headersSource.get('user-agent') || '',
		'Accept-Language': headersSource.get('accept-language') || '',
		'X-Client-IP': (await getClientIp(headersSource)) || '',
		'X-Client-OS': headersSource.get('x-client-os') || '',
	};
}
