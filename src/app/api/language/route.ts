import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Configuration } from '@/config/settings.config';
import type { ResponseFetch } from '@/helpers/api.helper';

type NextResponseLanguage = NextResponse<
	ResponseFetch<{
		language: string;
	}>
>;

export async function GET(): Promise<NextResponseLanguage> {
	const headerList = await headers();
	const cookieStore = await cookies();

	const fromHeader =
		headerList.get('x-language') ||
		headerList.get('accept-language')?.split(',')[0]?.split('-')[0];
	const fromCookie = cookieStore.get('preferred-language')?.value;
	const fallback = Configuration.get('app.language') as string;

	const language = fromHeader || fromCookie || fallback;

	const languageSelected = Configuration.isSupportedLanguage(language)
		? language
		: (Configuration.get('app.language') as string);

	return NextResponse.json(
		{
			data: {
				language: languageSelected,
			},
			success: true,
			message: '',
		},
		{
			status: 200,
			headers: {
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
				'Referrer-Policy': 'strict-origin-when-cross-origin',
				'Cache-Control': 'no-store, max-age=0',
				'Content-Type': 'application/json',
				'Cross-Origin-Resource-Policy': 'same-origin',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
			},
		},
	);
}

export const dynamic = 'force-dynamic'; // Ensure this route is never statically optimize
