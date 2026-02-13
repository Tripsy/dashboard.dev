import type { Metadata } from 'next';
import Link from 'next/link';
import {
	ErrorComponent,
	SuccessComponent,
} from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { ApiRequest } from '@/helpers/api.helper';
import type { ApiResponseFetch } from '@/types/api.type';

interface Props {
	params: Promise<{
		token: string;
	}>;
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('email-confirm.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
		robots: 'noindex, nofollow',
	};
}

export default async function Page(props: Props) {
	const { params } = props;

	const resolvedParams = await params;
	const token = resolvedParams.token;

	let message: string;
	let success = false;

	try {
		const fetchResponse: ApiResponseFetch<null> | undefined =
			await new ApiRequest()
				.setRequestMode('remote-api')
				.doFetch(`/account/email-confirm/${token}`, {
					method: 'POST',
					next: { revalidate: 3600 },
				});

		if (fetchResponse?.success === false) {
			message =
				fetchResponse?.message ||
				(await translate('email-confirm.message.failed'));
		} else {
			success = true;
			message = await translate('email-confirm.message.success');
		}
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			message = error.message;
		} else {
			message = await translate('email-confirm.message.failed');
		}
	}

	if (success) {
		return (
			<SuccessComponent title="Email Confirmation" description={message}>
				<div className="text-center mt-6">
					What's next? Check{' '}
					<Link
						href={Routes.get('account-me')}
						className="text-primary font-medium hover:underline"
						title="Go to your account"
					>
						your account
					</Link>{' '}
					or navigate to{' '}
					<Link
						href={Routes.get('home')}
						className="text-primary font-medium hover:underline"
					>
						home page
					</Link>
				</div>
			</SuccessComponent>
		);
	}

	return (
		<ErrorComponent title="Email Confirmation" description={message}>
			<div className="text-center mt-6">
				What now? You can register for a{' '}
				<Link
					href={Routes.get('register')}
					className="text-primary font-medium hover:underline"
					title="Create account"
				>
					new account
				</Link>{' '}
				or request{' '}
				<Link
					href={Routes.get('email-confirm-send')}
					className="text-primary font-medium hover:underline"
					title="Send confirmation link again"
				>
					another confirmation link
				</Link>
			</div>
		</ErrorComponent>
	);
}
